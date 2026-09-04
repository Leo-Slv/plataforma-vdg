'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import {
	confirmEmailFormSchema,
	type ConfirmEmailFormValues,
} from '@/features/auth/schemas/confirm-email-form.schema';
import {
	useConfirmEmailMutation,
	useResendConfirmationMutation,
} from '@/features/auth/hooks/auth.queries';
import { RESEND_RATE_LIMIT_MESSAGE } from '@/features/auth/lib/auth-messages';
import { FormField } from '@/features/auth/components/form-field';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível confirmar agora. Tente novamente.';
const INVALID_TOKEN_MESSAGE =
	'Código inválido ou expirado. Peça um novo código.';

type ConfirmEmailFormProps = {
	onConfirmed: () => void;
};

function ConfirmEmailForm({ onConfirmed }: ConfirmEmailFormProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const confirmMutation = useConfirmEmailMutation();
	const resendMutation = useResendConfirmationMutation();
	const [formError, setFormError] = useState<string | null>(null);
	const [resendMessage, setResendMessage] = useState<{
		tone: 'success' | 'error';
		text: string;
	} | null>(null);
	const autoSubmitted = useRef(false);

	const form = useForm<ConfirmEmailFormValues>({
		resolver: zodResolver(confirmEmailFormSchema),
		defaultValues: { token: '' },
	});

	function submitToken(values: ConfirmEmailFormValues) {
		setFormError(null);
		confirmMutation.mutate(values.token, {
			onSuccess: onConfirmed,
			onError: (error) => {
				if (!isApiError(error)) {
					setFormError(GENERIC_ERROR_MESSAGE);
					return;
				}

				if (error.status === 400) {
					form.setError('token', { message: INVALID_TOKEN_MESSAGE });
					return;
				}

				if (error.status === 401) {
					router.replace(appRoutes.auth.login);
					return;
				}

				setFormError(GENERIC_ERROR_MESSAGE);
			},
		});
	}

	useEffect(() => {
		const tokenFromUrl = searchParams.get('token');
		if (!tokenFromUrl || autoSubmitted.current) {
			return;
		}

		autoSubmitted.current = true;
		form.setValue('token', tokenFromUrl);
		submitToken({ token: tokenFromUrl });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	function handleResend() {
		setResendMessage(null);
		resendMutation.mutate(undefined, {
			onSuccess: () => {
				setResendMessage({ tone: 'success', text: 'Novo código enviado.' });
			},
			onError: (error) => {
				if (!isApiError(error)) {
					setResendMessage({ tone: 'error', text: GENERIC_ERROR_MESSAGE });
					return;
				}

				if (error.status === 409) {
					onConfirmed();
					return;
				}

				if (error.status === 429) {
					setResendMessage({ tone: 'error', text: RESEND_RATE_LIMIT_MESSAGE });
					return;
				}

				if (error.status === 401 || error.status === 404) {
					router.replace(appRoutes.auth.login);
					return;
				}

				setResendMessage({ tone: 'error', text: GENERIC_ERROR_MESSAGE });
			},
		});
	}

	return (
		<div className="mt-8.5 flex flex-col gap-4.5">
			<form
				onSubmit={form.handleSubmit(submitToken)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<FormField
					id="token"
					label="Código de confirmação"
					autoComplete="one-time-code"
					error={form.formState.errors.token?.message}
					{...form.register('token')}
				/>

				{formError ? (
					<div
						role="alert"
						className="rounded-md border border-white/12 bg-[#101012] px-4 py-3 text-[13px] font-light text-white/70"
					>
						{formError}
					</div>
				) : null}

				<button
					type="submit"
					disabled={confirmMutation.isPending}
					className="rounded-full bg-[#f4f4f2] py-4.25 text-center text-[15px] text-[#0a0a0b] disabled:opacity-50"
				>
					{confirmMutation.isPending ? 'Confirmando...' : 'Confirmar e-mail'}
				</button>
			</form>

			{resendMessage ? (
				<div
					role="status"
					className={cn(
						'rounded-md border px-4 py-3 text-[13px] font-light',
						resendMessage.tone === 'success'
							? 'border-[oklch(0.45_0.07_248)] text-[oklch(0.75_0.1_248)]'
							: 'border-white/12 text-white/70',
					)}
				>
					{resendMessage.text}
				</div>
			) : null}

			<div className="flex gap-3">
				<button
					type="button"
					onClick={handleResend}
					disabled={resendMutation.isPending}
					className="flex-1 rounded-full border border-white/20 py-4 text-center text-[14px] text-[#f2f2f0] disabled:opacity-50"
				>
					{resendMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
				</button>
				<Link
					href={appRoutes.auth.changeEmail}
					className="flex-1 rounded-full border border-white/20 py-4 text-center text-[14px] text-[#f2f2f0]"
				>
					Trocar e-mail
				</Link>
			</div>
		</div>
	);
}

export { ConfirmEmailForm };
