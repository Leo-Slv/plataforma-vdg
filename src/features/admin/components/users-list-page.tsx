'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useUsersQuery,
	useCreateUserMutation,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminField } from '@/features/admin/components/admin-field';
import { UsersTable } from '@/features/admin/components/users-table';
import { PaginationControls } from '@/features/admin/components/pagination-controls';
import { CreateUserModal } from '@/features/admin/components/create-user-modal';
import type { CreateUserFormValues } from '@/features/admin/schemas/create-user-form.schema';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function UsersListPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageUsers);

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [search]);

	const usersQuery = useUsersQuery(page, PAGE_SIZE, debouncedSearch, {
		enabled: ready,
	});
	const createUserMutation = useCreateUserMutation();

	useEffect(() => {
		if (
			usersQuery.isError &&
			isApiError(usersQuery.error) &&
			usersQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [usersQuery.isError, usersQuery.error, router]);

	function handleCreateUser(values: CreateUserFormValues) {
		setCreateError(null);
		createUserMutation.mutate(values, {
			onSuccess: () => {
				// Partial key match invalidates every cached page/search combo,
				// not just the one currently shown.
				queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
				toast.success('Usuário criado.');
				setShowCreateModal(false);
			},
			onError: (error) => {
				const message =
					isApiError(error) && error.status === 409
						? 'Já existe um usuário com este e-mail.'
						: GENERIC_ERROR_MESSAGE;
				setCreateError(message);
				toast.error(message);
			},
		});
	}

	if (!ready) {
		return <LoadingScreen />;
	}

	const users = usersQuery.data?.page.items ?? [];
	const totalPages = usersQuery.data?.page.totalPages ?? 1;

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-background text-foreground">
			<AdminSidebar active="users" />

			<div className="p-8.5">
				<div className="flex items-end justify-between">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">
							Usuários
						</h1>
						<p className="mt-2.5 font-sans text-[13.5px] font-light text-foreground/45">
							{usersQuery.isSuccess
								? `${usersQuery.data.totalRegistered} cadastrados · ${usersQuery.data.totalConfirmed} confirmados`
								: ' '}
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCreateModal(true)}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background"
					>
						Convidar usuário
					</button>
				</div>

				<div className="mt-7 max-w-xs">
					<AdminField
						label="Buscar"
						placeholder="Nome ou e-mail"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
					/>
				</div>

				<div className="mt-7.5">
					{usersQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
							Carregando usuários…
						</p>
					) : usersQuery.isError ? (
						isApiError(usersQuery.error) &&
						usersQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-foreground/60">
									Não foi possível carregar os usuários agora.
								</p>
								<button
									type="button"
									onClick={() => usersQuery.refetch()}
									className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : (
						<>
							<UsersTable users={users} />
							{users.length > 0 ? (
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

			{showCreateModal ? (
				<CreateUserModal
					onClose={() => setShowCreateModal(false)}
					onSubmit={handleCreateUser}
					isSubmitting={createUserMutation.isPending}
					error={createError}
				/>
			) : null}
		</div>
	);
}

export { UsersListPage };
