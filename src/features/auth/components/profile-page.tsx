'use client';

import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { performLogout } from '@/lib/auth/logout';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useCurrentUserQuery,
	useLogoutMutation,
} from '@/features/auth/hooks/auth.queries';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';

function ProfilePage() {
	const ready = useRequireAuth();
	const currentUserQuery = useCurrentUserQuery({ enabled: ready });
	const logoutMutation = useLogoutMutation();

	if (!ready) {
		return <LoadingScreen />;
	}

	const user = currentUserQuery.data;
	const displayName = getDisplayName(user?.name ?? null);
	const initials = getInitials(user?.name ?? null);

	function handleLogout() {
		performLogout(() => logoutMutation.mutateAsync());
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
					<span className="flex size-14 flex-none items-center justify-center rounded-full bg-[#22222a] font-heading text-lg">
						{initials}
					</span>
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
						<div className="mt-4 flex flex-col gap-3 text-[13.5px] font-light">
							<div className="flex justify-between gap-4">
								<span className="text-white/60">Nome</span>
								<span className="truncate text-[#f2f2f0]">
									{displayName || '…'}
								</span>
							</div>
							<div className="flex justify-between gap-4">
								<span className="text-white/60">E-mail</span>
								<span className="flex items-center gap-2 truncate text-[#f2f2f0]">
									{user?.email ?? '…'}
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
								</span>
							</div>
						</div>
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
