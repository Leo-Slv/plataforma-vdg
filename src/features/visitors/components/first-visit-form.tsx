'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

import { env } from '@/lib/env';
import { isApiError } from '@/lib/http/api-error';
import {
	firstVisitFormSchema,
	type FirstVisitFormValues,
} from '@/features/visitors/schemas/first-visit-form.schema';
import { useRegisterVisitorMutation } from '@/features/visitors/hooks/visitors.queries';
import { maskPhone } from '@/features/visitors/lib/phone-mask';
import {
	ADDRESS_TOO_LONG_MESSAGE,
	CAPTCHA_ERROR_MESSAGE,
	FORM_INVALID_MESSAGE,
	GENERIC_ERROR_MESSAGE,
	RATE_LIMIT_MESSAGE,
} from '@/features/visitors/lib/first-visit-messages';
import { VisitorInputField } from '@/features/visitors/components/visitor-input-field';
import { FirstVisitSuccess } from '@/features/visitors/components/first-visit-success';

const turnstileEnabled = Boolean(env.turnstileSiteKey);

const EMPTY_VALUES: FirstVisitFormValues = {
	name: '',
	phone: '',
	email: '',
	address: '',
	captchaToken: '',
};

type SubmittedVisitor = { name: string; phone: string };

type FirstVisitFormProps = {
	onSubmittedChange?: (submitted: boolean) => void;
};

function FirstVisitForm({ onSubmittedChange }: FirstVisitFormProps) {
	const mutation = useRegisterVisitorMutation();
	const turnstileRef = useRef<TurnstileInstance>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState<SubmittedVisitor | null>(null);

	const form = useForm<FirstVisitFormValues>({
		resolver: zodResolver(firstVisitFormSchema),
		defaultValues: EMPTY_VALUES,
	});

	const { errors } = form.formState;
	const captchaToken = form.watch('captchaToken');
	const submitDisabled =
		mutation.isPending || (turnstileEnabled && !captchaToken);
	const validationMessage =
		errors.name || errors.phone || errors.email
			? FORM_INVALID_MESSAGE
			: errors.address
				? ADDRESS_TOO_LONG_MESSAGE
				: null;
	const errorMessage = validationMessage ?? formError;

	function onSubmit(values: FirstVisitFormValues) {
		setFormError(null);
		mutation.mutate(
			{
				name: values.name,
				phone: values.phone,
				email: values.email,
				address: values.address || null,
				captchaToken: values.captchaToken,
			},
			{
				onSuccess: () => {
					setSubmitted({ name: values.name, phone: values.phone });
					onSubmittedChange?.(true);
				},
				onError: (error) => {
					if (!isApiError(error)) {
						setFormError(GENERIC_ERROR_MESSAGE);
						return;
					}

					if (error.status === 429) {
						setFormError(RATE_LIMIT_MESSAGE);
						return;
					}

					// ApiErrorResponse has no machine-readable code; CourseCore's
					// literal text is "Captcha is invalid." (same as /register).
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
						setFormError(FORM_INVALID_MESSAGE);
						return;
					}

					setFormError(GENERIC_ERROR_MESSAGE);
				},
			},
		);
	}

	function onReset() {
		form.reset(EMPTY_VALUES);
		mutation.reset();
		setFormError(null);
		setSubmitted(null);
		turnstileRef.current?.reset();
		onSubmittedChange?.(false);
	}

	if (submitted) {
		return (
			<FirstVisitSuccess
				name={submitted.name}
				phone={submitted.phone}
				onReset={onReset}
			/>
		);
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="mt-7.5 flex flex-col gap-4.5 lg:mt-0 lg:gap-5.5"
		>
			<div className="hidden lg:block">
				<h2 className="font-heading text-[24px] leading-[1.2] font-light">
					Seus dados
				</h2>
				<p className="mt-1.5 text-[13px] leading-normal font-light text-foreground/45">
					Usamos apenas para entrar em contato.
				</p>
			</div>

			<VisitorInputField
				label="Nome completo"
				placeholder="Como podemos chamar você?"
				autoComplete="name"
				invalid={Boolean(errors.name)}
				{...form.register('name')}
			/>

			<div className="flex flex-col gap-4.5 lg:grid lg:grid-cols-2 lg:gap-4">
				<VisitorInputField
					label="Telefone"
					type="tel"
					inputMode="tel"
					placeholder="(00) 00000-0000"
					autoComplete="tel-national"
					invalid={Boolean(errors.phone)}
					{...form.register('phone', {
						// RHF validates the raw keystroke before this runs, so
						// re-validate the masked value once errors are visible.
						onChange: (event: ChangeEvent<HTMLInputElement>) =>
							form.setValue('phone', maskPhone(event.target.value), {
								shouldValidate: form.formState.isSubmitted,
							}),
					})}
				/>
				<VisitorInputField
					label="E-mail"
					type="email"
					placeholder="voce@email.com"
					autoComplete="email"
					invalid={Boolean(errors.email)}
					{...form.register('email')}
				/>
			</div>

			<VisitorInputField
				label="Endereço"
				hint="opcional"
				placeholder="Rua, número, bairro, cidade"
				autoComplete="street-address"
				invalid={Boolean(errors.address)}
				{...form.register('address')}
			/>

			{turnstileEnabled ? (
				<Turnstile
					ref={turnstileRef}
					siteKey={env.turnstileSiteKey}
					options={{ theme: 'dark', appearance: 'interaction-only' }}
					onSuccess={(token) =>
						form.setValue('captchaToken', token, { shouldValidate: true })
					}
					onExpire={() => form.setValue('captchaToken', '')}
					onError={() => form.setValue('captchaToken', '')}
				/>
			) : null}

			{errorMessage ? (
				<p
					role="alert"
					className="text-[13px] leading-[1.4] text-[oklch(0.75_0.12_30)]"
				>
					{errorMessage}
				</p>
			) : null}

			<button
				type="submit"
				disabled={submitDisabled}
				className="mt-2.5 rounded-full bg-foreground p-4.5 text-[15px] leading-none font-medium text-background disabled:opacity-50 lg:mt-1 lg:px-7.5 lg:py-4.25"
			>
				{mutation.isPending ? 'Enviando...' : 'Enviar'}
			</button>

			<p className="text-center text-[12px] leading-normal font-light text-foreground/40 lg:hidden">
				Usamos seus dados apenas para entrar em contato.
			</p>
		</form>
	);
}

export { FirstVisitForm };
