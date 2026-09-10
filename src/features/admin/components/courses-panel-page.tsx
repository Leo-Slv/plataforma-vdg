'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { decodeAccessTokenClaims, hasPermission } from '@/lib/auth/jwt-claims';
import { isApiError } from '@/lib/http/api-error';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useAreasQuery,
	useCoursesQuery,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { CoursesTable } from '@/features/admin/components/courses-table';

function CoursesPanelPage() {
	const router = useRouter();
	const ready = useRequirePermission(authPermissions.manageCourses);

	const claims = decodeAccessTokenClaims();
	const canViewAreas = hasPermission(claims, authPermissions.manageAreas);

	const coursesQuery = useCoursesQuery({ enabled: ready });
	const areasQuery = useAreasQuery({ enabled: ready && canViewAreas });

	useEffect(() => {
		if (
			coursesQuery.isError &&
			isApiError(coursesQuery.error) &&
			coursesQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [coursesQuery.isError, coursesQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	const areas = areasQuery.data ?? [];
	const courses = coursesQuery.data ?? [];
	const publishedCount = courses.filter((course) => course.published).length;

	const activeAreasSummary = canViewAreas
		? [...areas]
				.filter((area) => area.active)
				.sort((a, b) => a.displayOrder - b.displayOrder)
				.map((area) => ({ name: area.name, courseCount: area.courseCount }))
		: undefined;

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="courses" areasSummary={activeAreasSummary} />

			<div className="p-8.5">
				<div className="flex items-end justify-between">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">Cursos</h1>
						<p className="mt-2.5 font-sans text-[13.5px] font-light text-white/45">
							{coursesQuery.isSuccess
								? `${courses.length} cursos · ${publishedCount} publicados`
								: ' '}
						</p>
					</div>
					<Link
						href={appRoutes.admin.courseNew}
						className="rounded-full bg-[#f4f4f2] px-5.5 py-3.25 font-sans text-[13px] text-[#0a0a0b]"
					>
						Novo curso
					</Link>
				</div>

				<div className="mt-8.5">
					{coursesQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-white/50">
							Carregando cursos…
						</p>
					) : coursesQuery.isError ? (
						isApiError(coursesQuery.error) &&
						coursesQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-white/60">
									Não foi possível carregar os cursos agora.
								</p>
								<button
									type="button"
									onClick={() => coursesQuery.refetch()}
									className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : (
						<CoursesTable courses={courses} areas={areas} />
					)}
				</div>
			</div>
		</div>
	);
}

export { CoursesPanelPage };
