'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import {
	setAccessToken,
	setUserEmail,
	setUserName,
} from '@/lib/auth/access-token';
import {
	loginFormSchema,
	type LoginFormValues,
} from '@/features/auth/schemas/login-form.schema';
import { useLoginMutation } from '@/features/auth/hooks/auth.queries';
import { RATE_LIMIT_MESSAGE } from '@/features/auth/lib/auth-messages';
import { FormField } from '@/features/auth/components/form-field';
import { PasswordField } from '@/features/auth/components/password-field';

const GENERIC_ERROR_MESSAGE = 'Não foi possível entrar agora. Tente novamente.';
const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha incorretos.';

function LoginForm() {
	const router = useRouter();
	const mutation = useLoginMutation();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: { email: '', password: '' },
	});

	const password = form.watch('password');

	function onSubmit(values: LoginFormValues) {
		setFormError(null);
		mutation.mutate(values, {
			onSuccess: (data) => {
				setAccessToken(data.token.accessToken);
				setUserEmail(data.email);
				setUserName(data.name);
				router.push(appRoutes.catalog.index);
			},
			onError: (error) => {
				if (!isApiError(error)) {
					setFormError(GENERIC_ERROR_MESSAGE);
					return;
				}

				if (error.status === 401) {
					setFormError(INVALID_CREDENTIALS_MESSAGE);
					return;
				}

				if (error.status === 429) {
					setFormError(RATE_LIMIT_MESSAGE);
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
			className="mt-9 flex flex-col gap-5"
		>
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
				autoComplete="current-password"
				value={password}
				error={form.formState.errors.password?.message}
				showStrength={false}
				labelExtra={
					<Link
						href={appRoutes.auth.forgotPassword}
						className="font-sans text-[11px] text-white/50"
					>
						Esqueci
					</Link>
				}
				{...form.register('password')}
			/>

			<div className="flex items-center gap-2.5 font-sans text-[13px] font-light text-white/55">
				<span className="size-4 rounded-[3px] border border-white/25" />
				Continuar conectado neste aparelho
			</div>

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
				disabled={mutation.isPending}
				className="mt-1.5 rounded-full bg-[#f4f4f2] py-4.25 text-center text-[15px] text-[#0a0a0b] disabled:opacity-50"
			>
				{mutation.isPending ? 'Entrando...' : 'Entrar'}
			</button>

			<p className="border-t border-white/8 pt-5.5 text-[12.5px] font-light text-white/38">
				{RATE_LIMIT_MESSAGE}
			</p>
		</form>
	);
}

export { LoginForm };
