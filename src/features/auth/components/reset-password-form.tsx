'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import {
	resetPasswordFormSchema,
	type ResetPasswordFormValues,
} from '@/features/auth/schemas/reset-password-form.schema';
import { useResetPasswordMutation } from '@/features/auth/hooks/auth.queries';
import { RATE_LIMIT_MESSAGE } from '@/features/auth/lib/auth-messages';
import { FormField } from '@/features/auth/components/form-field';
import { PasswordField } from '@/features/auth/components/password-field';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível redefinir a senha agora. Tente novamente.';
const INVALID_TOKEN_MESSAGE =
	'Código inválido ou expirado. Peça um novo link de redefinição.';

function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const mutation = useResetPasswordMutation();
	const [formError, setFormError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordFormSchema),
		// The e-mail link carries ?token=…, so most people never type the code.
		defaultValues: {
			token: searchParams.get('token') ?? '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	const newPassword = form.watch('newPassword');

	function onSubmit(values: ResetPasswordFormValues) {
		setFormError(null);
		mutation.mutate(
			{ token: values.token, newPassword: values.newPassword },
			{
				onSuccess: () => setDone(true),
				onError: (error) => {
					if (!isApiError(error)) {
						setFormError(GENERIC_ERROR_MESSAGE);
						return;
					}

					if (error.status === 429) {
						setFormError(RATE_LIMIT_MESSAGE);
						return;
					}

					if (error.status === 400) {
						const message = error.message.toLowerCase();
						const isPasswordProblem =
							message.includes('password') || message.includes('senha');

						if (isPasswordProblem) {
							form.setError('newPassword', { message: error.message });
						} else {
							form.setError('token', { message: INVALID_TOKEN_MESSAGE });
						}
						return;
					}

					setFormError(GENERIC_ERROR_MESSAGE);
				},
			},
		);
	}

	if (done) {
		return (
			<div className="mt-8.5 flex flex-col gap-5">
				<div
					role="status"
					className="rounded-md border border-foreground/12 bg-surface px-4 py-4 text-[14px] leading-[1.7] font-light text-foreground/70"
				>
					Senha redefinida. Entre com a nova senha.
				</div>
				<Link
					href={appRoutes.auth.login}
					className="rounded-full bg-foreground py-4.25 text-center text-[15px] text-background"
				>
					Ir para o login
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
				id="token"
				label="Código de redefinição"
				autoComplete="one-time-code"
				error={form.formState.errors.token?.message}
				{...form.register('token')}
			/>
			<PasswordField
				id="newPassword"
				label="Nova senha"
				autoComplete="new-password"
				value={newPassword}
				error={form.formState.errors.newPassword?.message}
				{...form.register('newPassword')}
			/>
			<PasswordField
				id="confirmPassword"
				label="Confirmar nova senha"
				autoComplete="new-password"
				value={form.watch('confirmPassword')}
				error={form.formState.errors.confirmPassword?.message}
				showStrength={false}
				{...form.register('confirmPassword')}
			/>

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
				disabled={mutation.isPending}
				className="mt-1 rounded-full bg-foreground py-4.25 text-center text-[15px] text-background disabled:opacity-50"
			>
				{mutation.isPending ? 'Salvando...' : 'Redefinir senha'}
			</button>

			<Link
				href={appRoutes.auth.forgotPassword}
				className="text-center text-[13px] text-foreground/55 underline"
			>
				Pedir um novo link
			</Link>
		</form>
	);
}

export { ResetPasswordForm };
