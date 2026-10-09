'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

import { env } from '@/lib/env';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import {
	forgotPasswordFormSchema,
	type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgot-password-form.schema';
import { useRequestPasswordResetMutation } from '@/features/auth/hooks/auth.queries';
import { RATE_LIMIT_MESSAGE } from '@/features/auth/lib/auth-messages';
import { FormField } from '@/features/auth/components/form-field';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível enviar as instruções agora. Tente novamente.';
const CAPTCHA_ERROR_MESSAGE =
	'Não foi possível confirmar a verificação de segurança. Tente novamente.';

const turnstileEnabled = Boolean(env.turnstileSiteKey);

function ForgotPasswordForm() {
	const mutation = useRequestPasswordResetMutation();
	const turnstileRef = useRef<TurnstileInstance>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [sentTo, setSentTo] = useState<string | null>(null);

	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordFormSchema),
		defaultValues: { email: '', captchaToken: '' },
	});

	const captchaToken = form.watch('captchaToken');
	const submitDisabled =
		mutation.isPending || (turnstileEnabled && !captchaToken);

	function onSubmit(values: ForgotPasswordFormValues) {
		setFormError(null);
		mutation.mutate(values, {
			// The backend answers 204 whether or not the e-mail has an account, so
			// the confirmation below deliberately doesn't say which.
			onSuccess: () => setSentTo(values.email),
			onError: (error) => {
				if (isApiError(error) && error.status === 429) {
					setFormError(RATE_LIMIT_MESSAGE);
					return;
				}

				if (
					isApiError(error) &&
					error.status === 400 &&
					error.message.toLowerCase().includes('captcha')
				) {
					turnstileRef.current?.reset();
					form.setValue('captchaToken', '');
					setFormError(CAPTCHA_ERROR_MESSAGE);
					return;
				}

				setFormError(
					isApiError(error) && error.status === 400
						? error.message
						: GENERIC_ERROR_MESSAGE,
				);
			},
		});
	}

	if (sentTo) {
		return (
			<div className="mt-8.5 flex flex-col gap-5">
				<div
					role="status"
					className="rounded-md border border-foreground/12 bg-surface px-4 py-4 text-[14px] leading-[1.7] font-light text-foreground/70"
				>
					Se existir uma conta com{' '}
					<strong className="font-normal">{sentTo}</strong>, enviamos as
					instruções para redefinir a senha. Confira também a caixa de spam.
				</div>
				<Link
					href={appRoutes.auth.resetPassword}
					className="rounded-full bg-foreground py-4.25 text-center text-[15px] text-background"
				>
					Já tenho o código
				</Link>
				<Link
					href={appRoutes.auth.login}
					className="text-center text-[13px] text-foreground/55 underline"
				>
					Voltar para o login
				</Link>
			</div>
		);
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="mt-8.5 flex flex-col gap-5"
		>
			<FormField
				id="email"
				label="E-mail"
				type="email"
				autoComplete="email"
				error={form.formState.errors.email?.message}
				{...form.register('email')}
			/>

			{turnstileEnabled ? (
				<Turnstile
					ref={turnstileRef}
					siteKey={env.turnstileSiteKey}
					options={{ theme: 'dark' }}
					onSuccess={(token) =>
						form.setValue('captchaToken', token, { shouldValidate: true })
					}
					onExpire={() => form.setValue('captchaToken', '')}
					onError={() => form.setValue('captchaToken', '')}
				/>
			) : null}

			{formError ? (
				<div
					role="alert"
					className="rounded-md border border-foreground/12 bg-surface px-4 py-3 text-[13px] font-light text-foreground/70"
				>
					{formError}
				</div>
			) : null}

			<button
				type="submit"
				disabled={submitDisabled}
				className="mt-1 rounded-full bg-foreground py-4.25 text-center text-[15px] text-background disabled:opacity-50"
			>
				{mutation.isPending ? 'Enviando...' : 'Enviar instruções'}
			</button>

			<Link
				href={appRoutes.auth.login}
				className="text-center text-[13px] text-foreground/55 underline"
			>
				Voltar para o login
			</Link>
		</form>
	);
}

export { ForgotPasswordForm };
