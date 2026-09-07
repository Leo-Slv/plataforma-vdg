'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { isApiError } from '@/lib/http/api-error';
import { useAreasQuery } from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AreasTable } from '@/features/admin/components/areas-table';

function AreasListPage() {
	const router = useRouter();
	const ready = useRequirePermission(authPermissions.manageAreas);

	const query = useAreasQuery({ enabled: ready });

	useEffect(() => {
		if (
			query.isError &&
			isApiError(query.error) &&
			query.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [query.isError, query.error, router]);

	if (!ready) {
		return <div className="min-h-screen bg-[#0a0a0b]" />;
	}

	const activeCount = query.data?.filter((area) => area.active).length ?? 0;

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="areas" />

			<div className="p-8.5">
				<div className="flex items-end justify-between">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">Áreas</h1>
						<p className="mt-2.5 font-sans text-[13.5px] font-light text-white/45">
							{activeCount === 1
								? '1 área ativa'
								: `${activeCount} áreas ativas`}
						</p>
					</div>
					<Link
						href={appRoutes.admin.areaNew}
						className="rounded-full bg-[#f4f4f2] px-5.5 py-3.25 font-sans text-[13px] text-[#0a0a0b]"
					>
						Nova área
					</Link>
				</div>

				<div className="mt-8.5">
					{query.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-white/50">
							Carregando áreas…
						</p>
					) : query.isError ? (
						isApiError(query.error) && query.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-white/60">
									Não foi possível carregar as áreas agora.
								</p>
								<button
									type="button"
									onClick={() => query.refetch()}
									className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : (
						<AreasTable areas={query.data} />
					)}
				</div>
			</div>
		</div>
	);
}

export { AreasListPage };
