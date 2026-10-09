'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authPermissions } from '@/lib/auth/auth-permissions';
import { decodeAccessTokenClaims, hasPermission } from '@/lib/auth/jwt-claims';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import { LoadingScreen } from '@/components/loading-screen';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	useVisitorsQuery,
	useSetVisitorContactedMutation,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminField } from '@/features/admin/components/admin-field';
import { VisitorsTable } from '@/features/admin/components/visitors-table';
import { PaginationControls } from '@/features/admin/components/pagination-controls';
import type { VisitorContactFilter } from '@/features/admin/model/visitor';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const FILTER_OPTIONS: { value: VisitorContactFilter; label: string }[] = [
	{ value: 'pending', label: 'Pendentes de contato' },
	{ value: 'contacted', label: 'Já contatados' },
	{ value: 'all', label: 'Todos' },
];

function VisitorsListPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.readVisitors);

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [filter, setFilter] = useState<VisitorContactFilter>('pending');
	const [pendingId, setPendingId] = useState<string | null>(null);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [search]);

	const visitorsQuery = useVisitorsQuery(
		page,
		PAGE_SIZE,
		debouncedSearch,
		filter,
		{ enabled: ready },
	);
	const setContactedMutation = useSetVisitorContactedMutation();

	useEffect(() => {
		if (
			visitorsQuery.isError &&
			isApiError(visitorsQuery.error) &&
			visitorsQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [visitorsQuery.isError, visitorsQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	// UI gating only; the backend's ManageVisitors policy is the real boundary.
	const canToggle = hasPermission(
		decodeAccessTokenClaims(),
		authPermissions.manageVisitors,
	);

	function handleToggle(visitorId: string, contacted: boolean) {
		setPendingId(visitorId);
		setContactedMutation.mutate(
			{ visitorId, contacted },
			{
				onSuccess: () => {
					// Partial key match refreshes every cached page/search/filter
					// combo, so a row leaves the "Pendentes" tab as soon as it is checked.
					queryClient.invalidateQueries({ queryKey: ['admin', 'visitors'] });
					toast.success(
						contacted ? 'Marcado como contatado.' : 'Marcação removida.',
					);
				},
				onError: () => toast.error(GENERIC_ERROR_MESSAGE),
				onSettled: () => setPendingId(null),
			},
		);
	}

	const visitors = visitorsQuery.data?.items ?? [];
	const totalPages = visitorsQuery.data?.totalPages ?? 1;
	const totalItems = visitorsQuery.data?.totalItems ?? 0;

	return (
		<div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[236px_1fr]">
			<AdminSidebar active="visitors" />

			<div className="p-5 sm:p-8.5">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">
							Primeira vez
						</h1>
						<p className="mt-2.5 font-sans text-[13.5px] font-light text-foreground/45">
							{visitorsQuery.isSuccess
								? `${totalItems} ${totalItems === 1 ? 'visitante' : 'visitantes'} neste filtro · marque quem já foi contatado`
								: ' '}
						</p>
					</div>
				</div>

				<div className="mt-7 flex flex-wrap items-end gap-4">
					<div className="w-full max-w-xs">
						<AdminField
							label="Buscar"
							placeholder="Nome, e-mail ou telefone"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
					</div>
					<div>
						<label className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
							Filtrar
						</label>
						<Select
							value={filter}
							onValueChange={(value) => {
								setFilter(value as VisitorContactFilter);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-52 rounded-md border-foreground/12 bg-surface-2 px-4 py-3.25 font-sans text-[14px] font-light text-foreground focus-visible:border-[oklch(0.62_0.1_248)] focus-visible:ring-0 data-[size=default]:h-auto dark:bg-surface-2 dark:hover:bg-surface-2">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="rounded-md border-foreground/10 bg-surface-2 text-foreground">
								{FILTER_OPTIONS.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
										className="rounded-md py-2.75 pr-8 pl-3 font-sans text-[14px] font-light text-foreground/75 focus:bg-foreground/6 focus:text-foreground"
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="mt-7.5">
					{visitorsQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
							Carregando visitantes…
						</p>
					) : visitorsQuery.isError ? (
						isApiError(visitorsQuery.error) &&
						visitorsQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-foreground/60">
									Não foi possível carregar os visitantes agora.
								</p>
								<button
									type="button"
									onClick={() => visitorsQuery.refetch()}
									className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : (
						<>
							<VisitorsTable
								visitors={visitors}
								pendingId={pendingId}
								canToggle={canToggle}
								onToggle={handleToggle}
							/>
							{visitors.length > 0 ? (
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

export { VisitorsListPage };
