'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { appRoutes } from '@/lib/routes/app-routes';
import { queryKeys } from '@/lib/constants/query-keys';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { performLogout } from '@/lib/auth/logout';
import { clearAccessToken, setUserName } from '@/lib/auth/access-token';
import { isApiError } from '@/lib/http/api-error';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useCurrentUserQuery,
	useLogoutMutation,
	useUpdateProfileMutation,
	useChangePasswordMutation,
} from '@/features/auth/hooks/auth.queries';
import { getInitials } from '@/features/catalog/lib/user-display';
import { FormField } from '@/features/auth/components/form-field';
import { PasswordField } from '@/features/auth/components/password-field';
import { RATE_LIMIT_MESSAGE } from '@/features/auth/lib/auth-messages';
import {
	profileFormSchema,
	type ProfileFormValues,
} from '@/features/auth/schemas/profile-form.schema';
import {
	changePasswordFormSchema,
	type ChangePasswordFormValues,
} from '@/features/auth/schemas/change-password-form.schema';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';
const PASSWORD_CHANGED_MESSAGE =
	'Senha alterada. Você será desconectado de todos os aparelhos, incluindo este.';
const PASSWORD_LOGOUT_DELAY_MS = 1800;

function ProfilePage() {
	const ready = useRequireAuth();
	const queryClient = useQueryClient();
	const currentUserQuery = useCurrentUserQuery({ enabled: ready });
	const logoutMutation = useLogoutMutation();
	const updateProfileMutation = useUpdateProfileMutation();
	const changePasswordMutation = useChangePasswordMutation();

	const [profileError, setProfileError] = useState<string | null>(null);
	const [profileSaved, setProfileSaved] = useState(false);
	const [avatarFailed, setAvatarFailed] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordChanged, setPasswordChanged] = useState(false);

	const user = currentUserQuery.data;
	const initials = getInitials(user?.name ?? null);

	const profileForm = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		values: user
			? {
					name: user.name,
					phone: user.phone ?? '',
					avatarUrl: user.avatarUrl ?? '',
				}
			: undefined,
	});

	const passwordForm = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordFormSchema),
		defaultValues: { currentPassword: '', newPassword: '' },
	});
	const newPassword = passwordForm.watch('newPassword');

	if (!ready) {
		return <LoadingScreen />;
	}

	function handleLogout() {
		performLogout(() => logoutMutation.mutateAsync());
	}

	function handleProfileSubmit(values: ProfileFormValues) {
		setProfileError(null);
		setProfileSaved(false);
		updateProfileMutation.mutate(
			{
				name: values.name,
				phone: values.phone.length > 0 ? values.phone : null,
				avatarUrl: values.avatarUrl.length > 0 ? values.avatarUrl : null,
			},
			{
				onSuccess: (updated) => {
					queryClient.setQueryData(queryKeys.auth.currentUser, updated);
					setUserName(updated.name);
					setProfileSaved(true);
					setAvatarFailed(false);
					toast.success('Perfil atualizado.');
				},
				onError: () => {
					setProfileError(GENERIC_ERROR_MESSAGE);
					toast.error(GENERIC_ERROR_MESSAGE);
				},
			},
		);
	}

	function handlePasswordSubmit(values: ChangePasswordFormValues) {
		setPasswordError(null);
		changePasswordMutation.mutate(values, {
			onSuccess: () => {
				setPasswordChanged(true);
				toast.success('Senha alterada.');
				// The backend revokes every session on a password change,
				// including this one's access token (TokenVersion bump) — the
				// current session is no longer valid, so this must behave like
				// a real logout rather than staying on the form.
				setTimeout(() => {
					clearAccessToken();
					window.location.href = appRoutes.auth.login;
				}, PASSWORD_LOGOUT_DELAY_MS);
			},
			onError: (error) => {
				if (isApiError(error) && error.status === 401) {
					const message = 'Senha atual incorreta.';
					passwordForm.setError('currentPassword', { message });
					toast.error(message);
					return;
				}
				if (isApiError(error) && error.status === 429) {
					setPasswordError(RATE_LIMIT_MESSAGE);
					toast.error(RATE_LIMIT_MESSAGE);
					return;
				}
				if (isApiError(error) && error.status === 400) {
					setPasswordError(error.message);
					toast.error(error.message);
					return;
				}
				setPasswordError(GENERIC_ERROR_MESSAGE);
				toast.error(GENERIC_ERROR_MESSAGE);
			},
		});
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5 py-11 text-[#f2f2f0] sm:px-6">
			<div className="w-full max-w-[560px] px-6 pt-9 pb-8 sm:px-0">
				<Link
					href={appRoutes.catalog.index}
					className="font-sans text-[13px] font-light text-white/50"
				>
					← Voltar
				</Link>

				<div className="mt-6.5 flex items-center gap-4">
					{user?.avatarUrl && !avatarFailed ? (
						// eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host
						<img
							key={user.avatarUrl}
							src={user.avatarUrl}
							alt=""
							className="size-14 flex-none rounded-full object-cover"
							onError={() => setAvatarFailed(true)}
						/>
					) : (
						<span className="flex size-14 flex-none items-center justify-center rounded-full bg-[#22222a] font-heading text-lg">
							{initials}
						</span>
					)}
					<h1 className="font-heading text-[28px] leading-[1.2] font-extralight">
						Perfil
					</h1>
				</div>

				<div className="mt-7.5 rounded-lg border border-white/12 bg-[#101012] p-5">
					<div className="font-heading text-[10px] tracking-[0.16em] text-white/40 uppercase">
						Dados da conta
					</div>

					{currentUserQuery.isError ? (
						<div className="mt-4 flex flex-col items-start gap-3">
							<p className="font-sans text-[13.5px] font-light text-white/55">
								Não foi possível carregar seus dados agora.
							</p>
							<button
								type="button"
								onClick={() => currentUserQuery.refetch()}
								className="rounded-full border border-white/20 px-4 py-2 font-sans text-[12.5px] text-[#f2f2f0]"
							>
								Tentar novamente
							</button>
						</div>
					) : (
						<form
							onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
							noValidate
							className="mt-4 flex flex-col gap-4.5"
						>
							<FormField
								id="name"
								label="Nome completo"
								autoComplete="name"
								error={profileForm.formState.errors.name?.message}
								{...profileForm.register('name')}
							/>

							<div>
								<div className="mb-2.25 font-heading text-[11px] tracking-[0.14em] text-white/45 uppercase">
									E-mail
								</div>
								<div className="flex items-center gap-2 border-b border-white/10 py-3 font-sans text-[15px] font-light text-white/50">
									<span className="truncate">{user?.email ?? '…'}</span>
									{user ? (
										<span
											className={
												user.emailVerifiedAt
													? 'font-heading text-[9.5px] tracking-[0.12em] text-[oklch(0.75_0.1_248)] uppercase'
													: 'font-heading text-[9.5px] tracking-[0.12em] text-white/40 uppercase'
											}
										>
											{user.emailVerifiedAt ? 'Confirmado' : 'Pendente'}
										</span>
									) : null}
								</div>
							</div>

							<FormField
								id="phone"
								label="Telefone"
								autoComplete="tel"
								placeholder="(11) 98765-4321"
								error={profileForm.formState.errors.phone?.message}
								{...profileForm.register('phone')}
							/>

							<div>
								<FormField
									id="avatarUrl"
									label="URL da foto"
									autoComplete="off"
									placeholder="https://..."
									error={profileForm.formState.errors.avatarUrl?.message}
									{...profileForm.register('avatarUrl')}
								/>
								<p className="mt-2 text-[11.5px] font-light text-white/35">
									Use o link direto do arquivo de imagem (terminando em .jpg,
									.png etc.), não o link de uma página.
								</p>
							</div>

							{profileError ? (
								<div
									role="alert"
									className="rounded-md border border-white/12 bg-[#141416] px-4 py-3 text-[13px] font-light text-white/70"
								>
									{profileError}
								</div>
							) : null}

							<div className="flex items-center gap-3">
								<button
									type="submit"
									disabled={updateProfileMutation.isPending}
									className="rounded-full bg-[#f4f4f2] px-6 py-3.25 font-sans text-[13.5px] text-[#0a0a0b] disabled:opacity-60"
								>
									{updateProfileMutation.isPending
										? 'Salvando...'
										: 'Salvar alterações'}
								</button>
								{profileSaved ? (
									<span className="font-sans text-[12.5px] font-light text-[oklch(0.75_0.1_248)]">
										Salvo.
									</span>
								) : null}
							</div>
						</form>
					)}
				</div>

				<div className="mt-5 rounded-lg border border-white/12 bg-[#101012] p-5">
					<div className="font-heading text-[10px] tracking-[0.16em] text-white/40 uppercase">
						Alterar senha
					</div>

					{passwordChanged ? (
						<p className="mt-4 font-sans text-[13.5px] font-light text-white/60">
							{PASSWORD_CHANGED_MESSAGE}
						</p>
					) : (
						<form
							onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
							noValidate
							className="mt-4 flex flex-col gap-4.5"
						>
							<PasswordField
								id="currentPassword"
								label="Senha atual"
								autoComplete="current-password"
								value={passwordForm.watch('currentPassword')}
								showStrength={false}
								error={passwordForm.formState.errors.currentPassword?.message}
								{...passwordForm.register('currentPassword')}
							/>
							<PasswordField
								id="newPassword"
								label="Nova senha"
								autoComplete="new-password"
								value={newPassword}
								error={passwordForm.formState.errors.newPassword?.message}
								{...passwordForm.register('newPassword')}
							/>

							{passwordError ? (
								<div
									role="alert"
									className="rounded-md border border-white/12 bg-[#141416] px-4 py-3 text-[13px] font-light text-white/70"
								>
									{passwordError}
								</div>
							) : null}

							<button
								type="submit"
								disabled={changePasswordMutation.isPending}
								className="rounded-full border border-white/20 px-6 py-3.25 font-sans text-[13.5px] text-[#f2f2f0] disabled:opacity-60"
							>
								{changePasswordMutation.isPending
									? 'Alterando...'
									: 'Alterar senha'}
							</button>
						</form>
					)}
				</div>

				<button
					type="button"
					onClick={handleLogout}
					disabled={logoutMutation.isPending}
					className="mt-6 font-sans text-[13px] font-light text-white/50 underline underline-offset-4 disabled:opacity-50"
				>
					{logoutMutation.isPending ? 'Saindo...' : 'Sair da conta'}
				</button>
			</div>
		</div>
	);
}

export { ProfilePage };
