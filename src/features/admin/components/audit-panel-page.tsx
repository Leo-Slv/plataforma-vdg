'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useAuditLogsQuery,
	useCoursesQuery,
	useAreasQuery,
	useUsersByIdsQueries,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AuditLogTable } from '@/features/admin/components/audit-log-table';
import { PaginationControls } from '@/features/admin/components/pagination-controls';

const PAGE_SIZE = 20;

function AuditPanelPage() {
	const router = useRouter();
	const ready = useRequirePermission(authPermissions.readAudit);

	const [page, setPage] = useState(1);

	const auditQuery = useAuditLogsQuery(page, PAGE_SIZE, { enabled: ready });
	const coursesQuery = useCoursesQuery({ enabled: ready });
	const areasQuery = useAreasQuery({ enabled: ready });

	const entries = auditQuery.data?.items ?? [];
	const userIds = [
		...new Set(
			entries
				.map((entry) => entry.userId)
				.filter((userId): userId is string => Boolean(userId)),
		),
	];
	const userResults = useUsersByIdsQueries(userIds, { enabled: ready });

	useEffect(() => {
		if (
			auditQuery.isError &&
			isApiError(auditQuery.error) &&
			auditQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [auditQuery.isError, auditQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	const totalPages = auditQuery.data?.totalPages ?? 1;
	const userEmailById = new Map(
		userIds
			.map((userId, index) => [userId, userResults[index]?.data?.email])
			.filter((pair): pair is [string, string] => Boolean(pair[1])),
	);
	const userLookupReady = userResults.every((result) => !result.isPending);

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-background text-foreground">
			<AdminSidebar active="audit" />

			<div className="p-8.5">
				<h1 className="font-heading text-[34px] font-extralight">Auditoria</h1>
				<p className="mt-2.5 font-sans text-[13.5px] font-light text-foreground/45">
					Histórico de ações administrativas, mais recentes primeiro
				</p>

				<div className="mt-8.5">
					{auditQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
							Carregando…
						</p>
					) : auditQuery.isError ? (
						isApiError(auditQuery.error) &&
						auditQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-foreground/60">
									Não foi possível carregar as ações auditadas agora.
								</p>
								<button
									type="button"
									onClick={() => auditQuery.refetch()}
									className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : (
						<>
							<AuditLogTable
								entries={entries}
								courses={coursesQuery.data ?? []}
								areas={areasQuery.data ?? []}
								userEmailById={userEmailById}
								userLookupReady={userLookupReady}
							/>
							{entries.length > 0 ? (
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

export { AuditPanelPage };
