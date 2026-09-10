'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import { queryKeys } from '@/lib/constants/query-keys';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useVideosQuery,
	useCoursesQuery,
	useAllCourseModulesQueries,
	useActivateVideoMutation,
	useUnlistVideoMutation,
} from '@/features/admin/hooks/admin.queries';
import { buildLessonLookup } from '@/features/admin/lib/build-lesson-lookup';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { VideosTable } from '@/features/admin/components/videos-table';
import { PaginationControls } from '@/features/admin/components/pagination-controls';

const PAGE_SIZE = 50;
const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';

function VideosPanelPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageVideos);

	const [page, setPage] = useState(1);
	const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);

	const videosQuery = useVideosQuery(page, PAGE_SIZE, { enabled: ready });
	const coursesQuery = useCoursesQuery({ enabled: ready });
	const courseIds = coursesQuery.data?.map((course) => course.id) ?? [];
	const modulesResults = useAllCourseModulesQueries(courseIds, {
		enabled: ready,
	});

	const activateMutation = useActivateVideoMutation();
	const unlistMutation = useUnlistVideoMutation();

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

	function invalidateVideos() {
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.videos(page, PAGE_SIZE),
		});
	}

	function handleActivate(videoId: string) {
		setPendingVideoId(videoId);
		activateMutation.mutate(videoId, {
			onSuccess: () => {
				invalidateVideos();
				toast.success('Vídeo ativado.');
			},
			onError: () => toast.error(GENERIC_ERROR_MESSAGE),
			onSettled: () => setPendingVideoId(null),
		});
	}

	function handleUnlist(videoId: string) {
		setPendingVideoId(videoId);
		unlistMutation.mutate(videoId, {
			onSuccess: () => {
				invalidateVideos();
				toast.success('Vídeo não listado.');
			},
			onError: () => toast.error(GENERIC_ERROR_MESSAGE),
			onSettled: () => setPendingVideoId(null),
		});
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
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="videos" />

			<div className="p-8.5">
				<div className="flex items-end justify-between">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">Vídeos</h1>
						<p className="mt-2.5 font-sans text-[13.5px] font-light text-white/45">
							{videosQuery.isSuccess
								? `${totalItems} vídeos · hospedados no YouTube, referenciados por ID`
								: ' '}
						</p>
					</div>
				</div>

				<div className="mt-8.5">
					{videosQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-white/50">
							Carregando vídeos…
						</p>
					) : videosQuery.isError ? (
						isApiError(videosQuery.error) &&
						videosQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-white/60">
									Não foi possível carregar os vídeos agora.
								</p>
								<button
									type="button"
									onClick={() => videosQuery.refetch()}
									className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
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
								pendingVideoId={pendingVideoId}
								onActivate={handleActivate}
								onUnlist={handleUnlist}
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
