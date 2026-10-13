'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { queryKeys } from '@/lib/constants/query-keys';
import { isApiError } from '@/lib/http/api-error';
import { useRequireAdmin } from '@/lib/auth/use-require-admin';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useCreateRoleMutation,
	usePermissionsQuery,
	useRoleDetailsQuery,
	useSetRolePermissionsMutation,
	useUpdateRoleMutation,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { RoleFormModal } from '@/features/admin/components/role-form-modal';
import { RolePermissionsEditor } from '@/features/admin/components/role-permissions-editor';
import { isSamePermissionSet } from '@/features/admin/lib/is-same-permission-set';
import type { RoleDetail } from '@/features/admin/model/role-detail';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';

type Draft = { roleId: string; keys: Set<string> };

function messageForError(error: unknown) {
	if (isApiError(error) && error.status === 409) {
		return 'Já existe um papel com este nome.';
	}
	if (isApiError(error) && error.status === 403) {
		return 'O papel Admin não pode ser alterado.';
	}
	return GENERIC_ERROR_MESSAGE;
}

function RolesPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequireAdmin();

	const rolesQuery = useRoleDetailsQuery({ enabled: ready });
	const permissionsQuery = usePermissionsQuery({ enabled: ready });
	const createRoleMutation = useCreateRoleMutation();
	const updateRoleMutation = useUpdateRoleMutation();
	const setPermissionsMutation = useSetRolePermissionsMutation();

	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
	const [draft, setDraft] = useState<Draft | null>(null);
	const [modal, setModal] = useState<'create' | 'edit' | null>(null);
	const [modalError, setModalError] = useState<string | null>(null);

	useEffect(() => {
		const error = rolesQuery.error ?? permissionsQuery.error;
		if (isApiError(error) && error.status === 401) {
			router.replace(appRoutes.auth.login);
		}
	}, [rolesQuery.error, permissionsQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	const roles = rolesQuery.data ?? [];
	const permissions = permissionsQuery.data ?? [];
	const selectedRole: RoleDetail | undefined =
		roles.find((role) => role.id === selectedRoleId) ?? roles[0];

	// The draft only counts for the role it was started on, so switching roles
	// never carries unsaved switches over to another one.
	const effectiveKeys: ReadonlySet<string> =
		selectedRole && draft?.roleId === selectedRole.id
			? draft.keys
			: new Set(selectedRole?.permissionKeys ?? []);
	const dirty =
		selectedRole !== undefined &&
		draft?.roleId === selectedRole.id &&
		!isSamePermissionSet(draft.keys, selectedRole.permissionKeys);

	function refreshRoles() {
		queryClient.invalidateQueries({ queryKey: queryKeys.admin.roleDetails });
		// The user screen reads the lightweight list of active roles.
		queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles });
	}

	function handleTogglePermission(key: string, granted: boolean) {
		if (!selectedRole) {
			return;
		}
		const keys = new Set(effectiveKeys);
		if (granted) {
			keys.add(key);
		} else {
			keys.delete(key);
		}
		setDraft({ roleId: selectedRole.id, keys });
	}

	function handleSavePermissions() {
		if (!selectedRole || !dirty || !draft) {
			return;
		}
		const hadMembers = selectedRole.memberCount > 0;
		setPermissionsMutation.mutate(
			{ roleId: selectedRole.id, permissionKeys: [...draft.keys] },
			{
				onSuccess: () => {
					refreshRoles();
					setDraft(null);
					toast.success(
						hadMembers
							? 'Permissões salvas. Quem tem este papel precisa entrar novamente.'
							: 'Permissões salvas.',
					);
				},
				onError: (error) => toast.error(messageForError(error)),
			},
		);
	}

	function handleCreate(values: { name: string; description: string }) {
		setModalError(null);
		createRoleMutation.mutate(values, {
			onSuccess: (created) => {
				refreshRoles();
				setSelectedRoleId(created.id);
				setDraft(null);
				setModal(null);
				toast.success('Papel criado.');
			},
			onError: (error) => setModalError(messageForError(error)),
		});
	}

	function handleEdit(values: {
		name: string;
		description: string;
		active: boolean;
	}) {
		if (!selectedRole) {
			return;
		}
		setModalError(null);
		updateRoleMutation.mutate(
			{ roleId: selectedRole.id, payload: values },
			{
				onSuccess: () => {
					refreshRoles();
					setModal(null);
					toast.success('Papel atualizado.');
				},
				onError: (error) => setModalError(messageForError(error)),
			},
		);
	}

	function openModal(kind: 'create' | 'edit') {
		setModalError(null);
		setModal(kind);
	}

	const isLoading = rolesQuery.isPending || permissionsQuery.isPending;
	const loadFailed = rolesQuery.isError || permissionsQuery.isError;

	return (
		<div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[236px_1fr]">
			<AdminSidebar active="roles" />

			<div className="p-5 sm:p-8.5">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h1 className="font-heading text-[34px] font-extralight">
							Permissões
						</h1>
						<p className="mt-2.5 max-w-xl font-sans text-[13.5px] font-light text-foreground/45">
							Crie papéis para o pessoal do backoffice e escolha o que cada um
							pode abrir. Para dar um papel a alguém, abra a pessoa em Usuários.
						</p>
					</div>
					<button
						type="button"
						onClick={() => openModal('create')}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background"
					>
						Novo papel
					</button>
				</div>

				{isLoading ? (
					<p className="mt-16 py-16 text-center font-sans text-sm font-light text-foreground/50">
						Carregando…
					</p>
				) : loadFailed ? (
					<p
						role="alert"
						className="mt-10 rounded-md border border-foreground/12 bg-surface px-4 py-3 text-[13px] font-light text-foreground/70"
					>
						Não foi possível carregar os papéis. Atualize a página.
					</p>
				) : (
					<div className="mt-8.5 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
						<ul className="flex flex-col gap-2" aria-label="Papéis">
							{roles.map((role) => (
								<li key={role.id}>
									<button
										type="button"
										onClick={() => setSelectedRoleId(role.id)}
										aria-current={role.id === selectedRole?.id}
										className={cn(
											'w-full rounded-md border p-4 text-left transition-colors',
											role.id === selectedRole?.id
												? 'border-foreground/30 bg-foreground/5'
												: 'border-foreground/10 hover:bg-foreground/3',
										)}
									>
										<div className="flex items-center justify-between gap-2">
											<span className="font-sans text-[14px] text-foreground">
												{role.name}
											</span>
											{role.isSystem ? (
												<span className="rounded-full border border-foreground/15 px-2 py-0.5 font-sans text-[10.5px] text-foreground/50">
													Sistema
												</span>
											) : !role.active ? (
												<span className="rounded-full border border-foreground/15 px-2 py-0.5 font-sans text-[10.5px] text-foreground/50">
													Inativo
												</span>
											) : null}
										</div>
										<div className="mt-1 font-sans text-[12px] font-light text-foreground/45">
											{role.memberCount}{' '}
											{role.memberCount === 1 ? 'pessoa' : 'pessoas'}
										</div>
									</button>
								</li>
							))}
						</ul>

						{selectedRole ? (
							<section aria-label={`Permissões de ${selectedRole.name}`}>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h2 className="font-heading text-[22px] font-light">
											{selectedRole.name}
										</h2>
										{selectedRole.description ? (
											<p className="mt-1.5 font-sans text-[13px] font-light text-foreground/45">
												{selectedRole.description}
											</p>
										) : null}
									</div>
									{selectedRole.isSystem ? null : (
										<button
											type="button"
											onClick={() => openModal('edit')}
											className="rounded-full border border-foreground/18 px-4.5 py-2.5 font-sans text-[12.5px] text-foreground/70"
										>
											Editar papel
										</button>
									)}
								</div>

								{selectedRole.isSystem ? (
									<p className="mt-6 rounded-md border border-foreground/12 bg-surface px-4 py-3 font-sans text-[13px] font-light text-foreground/70">
										O papel Admin tem acesso total ao painel e não pode ser
										alterado. Só quem tem este papel gerencia permissões e
										atribui papéis.
									</p>
								) : (
									<>
										<div className="mt-6">
											<RolePermissionsEditor
												permissions={permissions}
												selectedKeys={effectiveKeys}
												onToggle={handleTogglePermission}
												disabled={setPermissionsMutation.isPending}
											/>
										</div>
										<div className="mt-5 flex items-center gap-3">
											<button
												type="button"
												onClick={handleSavePermissions}
												disabled={!dirty || setPermissionsMutation.isPending}
												className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background disabled:opacity-40"
											>
												{setPermissionsMutation.isPending
													? 'Salvando...'
													: 'Salvar permissões'}
											</button>
											{dirty ? (
												<button
													type="button"
													onClick={() => setDraft(null)}
													className="font-sans text-[12.5px] text-foreground/50"
												>
													Descartar
												</button>
											) : null}
										</div>
									</>
								)}
							</section>
						) : (
							<p className="font-sans text-[13.5px] font-light text-foreground/50">
								Nenhum papel cadastrado ainda.
							</p>
						)}
					</div>
				)}
			</div>

			{modal === 'create' ? (
				<RoleFormModal
					mode="create"
					onClose={() => setModal(null)}
					onSubmit={handleCreate}
					isSubmitting={createRoleMutation.isPending}
					error={modalError}
				/>
			) : null}
			{modal === 'edit' && selectedRole ? (
				<RoleFormModal
					mode="edit"
					initialValues={{
						name: selectedRole.name,
						description: selectedRole.description,
						active: selectedRole.active,
					}}
					onClose={() => setModal(null)}
					onSubmit={handleEdit}
					isSubmitting={updateRoleMutation.isPending}
					error={modalError}
				/>
			) : null}
		</div>
	);
}

export { RolesPage };
