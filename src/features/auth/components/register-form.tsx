'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

import { env } from '@/lib/env';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import {
	setAccessToken,
	setUserEmail,
	setUserName,
} from '@/lib/auth/access-token';
import {
	registerFormSchema,
	type RegisterFormValues,
} from '@/features/auth/schemas/register-form.schema';
import { useRegisterMutation } from '@/features/auth/hooks/auth.queries';
import { RATE_LIMIT_MESSAGE } from '@/features/auth/lib/auth-messages';
import { FormField } from '@/features/auth/components/form-field';
import { PasswordField } from '@/features/auth/components/password-field';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível criar sua conta agora. Tente novamente.';
const CAPTCHA_ERROR_MESSAGE =
	'Não foi possível confirmar a verificação de segurança. Tente novamente.';

const turnstileEnabled = Boolean(env.turnstileSiteKey);

function RegisterForm() {
	const router = useRouter();
	const mutation = useRegisterMutation();
	const turnstileRef = useRef<TurnstileInstance>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerFormSchema),
		defaultValues: { name: '', email: '', password: '', captchaToken: '' },
	});

	const password = form.watch('password');
	const captchaToken = form.watch('captchaToken');
	const submitDisabled =
		mutation.isPending || (turnstileEnabled && !captchaToken);

	function onSubmit(values: RegisterFormValues) {
		setFormError(null);
		mutation.mutate(values, {
			onSuccess: (data) => {
				setAccessToken(data.token.accessToken);
				setUserEmail(data.email);
				setUserName(data.name);
				router.push(appRoutes.auth.confirmEmail);
			},
			onError: (error) => {
				if (!isApiError(error)) {
					setFormError(GENERIC_ERROR_MESSAGE);
					return;
				}

				if (error.status === 409) {
					form.setError('email', {
						message: 'Este e-mail já está cadastrado.',
					});
					return;
				}

				if (error.status === 429) {
					setFormError(RATE_LIMIT_MESSAGE);
					return;
				}

				if (
					error.status === 400 &&
					error.message.toLowerCase().includes('captcha')
				) {
					turnstileRef.current?.reset();
					form.setValue('captchaToken', '');
					setFormError(CAPTCHA_ERROR_MESSAGE);
					return;
				}

				if (error.status === 400) {
					setFormError(error.message);
					return;
				}

				setFormError(GENERIC_ERROR_MESSAGE);
			},
		});
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="mt-8.5 flex flex-col gap-4.5"
		>
			<FormField
				id="name"
				label="Nome completo"
				autoComplete="name"
				error={form.formState.errors.name?.message}
				{...form.register('name')}
			/>
			<FormField
				id="email"
				label="E-mail"
				type="email"
				autoComplete="email"
				error={form.formState.errors.email?.message}
				{...form.register('email')}
			/>
			<PasswordField
				id="password"
				label="Senha"
				autoComplete="new-password"
				value={password}
				error={form.formState.errors.password?.message}
				{...form.register('password')}
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
					className="rounded-md border border-white/12 bg-[#101012] px-4 py-3 text-[13px] font-light text-white/70"
				>
					{formError}
				</div>
			) : null}

			<p className="text-[12.5px] font-light text-white/42">
				Ao criar a conta você aceita os{' '}
				<a href="#" className="underline">
					termos de uso
				</a>{' '}
				e a política de privacidade.
			</p>

			<button
				type="submit"
				disabled={submitDisabled}
				className="mt-1 rounded-full bg-[#f4f4f2] py-4.25 text-center text-[15px] text-[#0a0a0b] disabled:opacity-50"
			>
				{mutation.isPending ? 'Criando conta...' : 'Criar conta'}
			</button>
		</form>
	);
}

export { RegisterForm };
