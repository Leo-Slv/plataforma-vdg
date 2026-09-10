'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useVideosQuery,
	useCoursesQuery,
	useAllCourseModulesQueries,
} from '@/features/admin/hooks/admin.queries';
import { buildLessonLookup } from '@/features/admin/lib/build-lesson-lookup';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { VideosTable } from '@/features/admin/components/videos-table';
import { PaginationControls } from '@/features/admin/components/pagination-controls';

const PAGE_SIZE = 50;

function VideosPanelPage() {
	const router = useRouter();
	const ready = useRequirePermission(authPermissions.manageVideos);

	const [page, setPage] = useState(1);

	const videosQuery = useVideosQuery(page, PAGE_SIZE, { enabled: ready });
	const coursesQuery = useCoursesQuery({ enabled: ready });
	const courseIds = coursesQuery.data?.map((course) => course.id) ?? [];
	const modulesResults = useAllCourseModulesQueries(courseIds, {
		enabled: ready,
	});

	useEffect(() => {
		if (
			videosQuery.isError &&
			isApiError(videosQuery.error) &&
			videosQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [videosQuery.isError, videosQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	const videos = videosQuery.data?.items ?? [];
	const totalItems = videosQuery.data?.totalItems ?? 0;
	const totalPages = videosQuery.data?.totalPages ?? 1;
	const modulesByCourse = courseIds.map(
		(_, index) => modulesResults[index]?.data ?? [],
	);
	const lookupReady = modulesResults.every((result) => !result.isPending);
	const lessonLookup = buildLessonLookup(
		coursesQuery.data ?? [],
		modulesByCourse,
	);

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-background text-foreground">
			<AdminSidebar active="videos" />

			<div className="p-8.5">
				<div className="flex items-end justify-between">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">Vídeos</h1>
						<p className="mt-2.5 font-sans text-[13.5px] font-light text-foreground/45">
							{videosQuery.isSuccess
								? `${totalItems} vídeos · hospedados no YouTube, referenciados por ID`
								: ' '}
						</p>
					</div>
				</div>

				<div className="mt-8.5">
					{videosQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
							Carregando vídeos…
						</p>
					) : videosQuery.isError ? (
						isApiError(videosQuery.error) &&
						videosQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-foreground/60">
									Não foi possível carregar os vídeos agora.
								</p>
								<button
									type="button"
									onClick={() => videosQuery.refetch()}
									className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : (
						<>
							<VideosTable
								videos={videos}
								lessonLookup={lessonLookup}
								lookupReady={lookupReady}
							/>
							{videos.length > 0 ? (
								<PaginationControls
									page={page}
									totalPages={totalPages}
									onPrevious={() =>
										setPage((current) => Math.max(1, current - 1))
									}
									onNext={() =>
										setPage((current) => Math.min(totalPages, current + 1))
									}
								/>
							) : null}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export { VideosPanelPage };
