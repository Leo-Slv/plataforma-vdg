'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { decodeAccessTokenClaims, hasPermission } from '@/lib/auth/jwt-claims';
import { isApiError } from '@/lib/http/api-error';
import {
	useAreasQuery,
	useAuditLogsQuery,
	useCoursesQuery,
} from '@/features/admin/hooks/admin.queries';
import { resolveAuditLabel } from '@/features/admin/lib/resolve-audit-label';
import { formatRelativeTime } from '@/features/admin/lib/format-relative-time';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { CoursesTable } from '@/features/admin/components/courses-table';
import { AuditLogPanel } from '@/features/admin/components/audit-log-panel';

function CoursesPanelPage() {
	const router = useRouter();
	const ready = useRequirePermission(authPermissions.manageCourses);

	const claims = decodeAccessTokenClaims();
	const canViewAreas = hasPermission(claims, authPermissions.manageAreas);
	const canViewAudit = hasPermission(claims, authPermissions.readAudit);

	const coursesQuery = useCoursesQuery({ enabled: ready });
	const areasQuery = useAreasQuery({ enabled: ready && canViewAreas });
	const auditQuery = useAuditLogsQuery(1, 3, {
		enabled: ready && canViewAudit,
	});

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
		return <div className="min-h-screen bg-[#0a0a0b]" />;
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

				{canViewAudit ? (
					auditQuery.isPending ? (
						<div className="mt-8.5 rounded-md border border-white/10 bg-[#101012] px-6 py-5.5">
							<p className="font-sans text-[12.5px] font-light text-white/40">
								Carregando ações auditadas…
							</p>
						</div>
					) : auditQuery.isError ? (
						<AuditLogPanel
							status="error"
							onRetry={() => auditQuery.refetch()}
						/>
					) : (
						<AuditLogPanel
							status="ready"
							entries={auditQuery.data.items.map((entry) => ({
								id: entry.id,
								label: resolveAuditLabel(entry, courses, areas),
								relativeTime: formatRelativeTime(entry.createdAt, new Date()),
							}))}
						/>
					)
				) : (
					<AuditLogPanel status="forbidden" />
				)}
			</div>
		</div>
	);
}

export { CoursesPanelPage };
