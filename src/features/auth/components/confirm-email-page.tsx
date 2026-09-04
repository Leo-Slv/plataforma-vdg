'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { getAccessToken, getUserEmail } from '@/lib/auth/access-token';
import { ConfirmEmailForm } from '@/features/auth/components/confirm-email-form';

const CONFIRMED_REDIRECT_DELAY_MS = 900;

type GateState =
	{ status: 'checking' } | { status: 'ready'; email: string | null };

function ConfirmEmailPage() {
	const router = useRouter();
	const [gate, setGate] = useState<GateState>({ status: 'checking' });
	const [confirmed, setConfirmed] = useState(false);

	useEffect(() => {
		if (!getAccessToken()) {
			router.replace(appRoutes.auth.login);
			return;
		}

		// localStorage doesn't exist during SSR, so this read (and the auth
		// gate above) can only happen after mount — deferring it to render
		// instead would make the server/client first paint disagree.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setGate({ status: 'ready', email: getUserEmail() });
	}, [router]);

	function handleConfirmed() {
		setConfirmed(true);
		setTimeout(() => {
			router.push(appRoutes.catalog.index);
		}, CONFIRMED_REDIRECT_DELAY_MS);
	}

	if (gate.status !== 'ready') {
		return <div className="min-h-full bg-[#0a0a0b]" />;
	}

	const { email } = gate;

	return (
		<div className="flex min-h-full items-center justify-center bg-[#0a0a0b] px-5 py-11 text-[#f2f2f0] sm:px-6">
			<div className="w-full max-w-[520px] px-6 pt-9 pb-8 sm:px-0">
				<div className="flex size-14 items-center justify-center rounded-full border border-[oklch(0.5_0.08_248)] font-heading text-[22px] font-extralight text-[oklch(0.75_0.1_248)]">
					✉
				</div>

				<h1 className="mt-6.5 font-heading text-[32px] leading-[1.18] font-extralight">
					Confirme seu e-mail para liberar as aulas
				</h1>
				<p className="mt-3.5 text-[15px] leading-[1.7] font-light text-pretty text-white/55">
					Enviamos um código para{' '}
					{email ? (
						<span className="text-[#f2f2f0]">{email}</span>
					) : (
						'seu e-mail'
					)}
					. Até você confirmar, o catálogo fica visível mas nenhuma aula abre —
					inclusive nos cursos gratuitos.
				</p>

				<div className="mt-7.5 rounded-lg border border-white/12 bg-[#101012] p-5">
					<div className="font-heading text-[10px] tracking-[0.16em] text-white/40 uppercase">
						Status da conta
					</div>
					<div className="mt-4 flex flex-col gap-3 text-[13.5px] font-light">
						<div className="flex justify-between">
							<span className="text-white/60">Conta criada</span>
							<span className="text-[oklch(0.75_0.1_248)]">✓ concluído</span>
						</div>
						<div className="flex justify-between">
							<span className="text-white/60">E-mail confirmado</span>
							<span
								className={
									confirmed ? 'text-[oklch(0.75_0.1_248)]' : 'text-white/40'
								}
							>
								{confirmed ? '✓ concluído' : 'pendente'}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-white/60">Acesso às aulas</span>
							<span
								className={
									confirmed ? 'text-[oklch(0.75_0.1_248)]' : 'text-white/40'
								}
							>
								{confirmed ? '✓ liberado' : 'bloqueado'}
							</span>
						</div>
					</div>
				</div>

				<ConfirmEmailForm onConfirmed={handleConfirmed} />

				<p className="mt-4 text-[12px] leading-[1.6] font-light text-white/35">
					Você pode pedir um novo código a cada 2 minutos.
				</p>
			</div>
		</div>
	);
}

export { ConfirmEmailPage };
