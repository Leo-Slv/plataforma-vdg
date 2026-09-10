'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { appRoutes } from '@/lib/routes/app-routes';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { LoadingScreen } from '@/components/loading-screen';
import { useCurrentUserQuery } from '@/features/auth/hooks/auth.queries';
import { useCourseDetailsQuery } from '@/features/catalog/hooks/catalog.queries';
import { getInitials } from '@/features/catalog/lib/user-display';
import { useSubmitTestimonialMutation } from '@/features/testimonials/hooks/testimonials.queries';
import { TestimonialQuoteField } from '@/features/testimonials/components/testimonial-quote-field';
import {
	submitTestimonialFormSchema,
	type SubmitTestimonialFormValues,
} from '@/features/testimonials/schemas/submit-testimonial-form.schema';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível enviar seu depoimento agora. Tente novamente.';
const COURSE_NOT_FOUND_MESSAGE = 'Este curso não foi encontrado.';

function SubmitTestimonialPage() {
	const ready = useRequireAuth();
	const searchParams = useSearchParams();
	const courseId = searchParams.get('courseId');

	const currentUserQuery = useCurrentUserQuery({ enabled: ready });
	const courseDetailsQuery = useCourseDetailsQuery(courseId ?? '', {
		enabled: ready && Boolean(courseId),
	});
	const submitMutation = useSubmitTestimonialMutation();

	const [formError, setFormError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	const form = useForm<SubmitTestimonialFormValues>({
		resolver: zodResolver(submitTestimonialFormSchema),
		defaultValues: { quote: '' },
	});

	if (!ready) {
		return <LoadingScreen />;
	}

	const user = currentUserQuery.data;
	const courseTitle = courseDetailsQuery.data?.title ?? null;
	const initials = getInitials(user?.name ?? null);

	function handleSubmit(values: SubmitTestimonialFormValues) {
		setFormError(null);
		submitMutation.mutate(
			{ quote: values.quote, courseId },
			{
				onSuccess: () => {
					setSubmitted(true);
					toast.success('Depoimento enviado.');
				},
				onError: (error) => {
					const message =
						isApiError(error) && error.status === 404
							? COURSE_NOT_FOUND_MESSAGE
							: GENERIC_ERROR_MESSAGE;
					setFormError(message);
					toast.error(message);
				},
			},
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-5 py-11 text-[#f2f2f0] sm:px-6">
			<div className="w-full max-w-[520px] px-6 pt-9 pb-8 sm:px-0">
				<Link
					href={appRoutes.myCourses.index}
					className="font-sans text-[13px] font-light text-white/50"
				>
					← Voltar
				</Link>

				<h1 className="mt-4 font-heading text-[26px] leading-[1.15] font-extralight">
					Deixar um depoimento
				</h1>

				{submitted ? (
					<p className="mt-5 font-sans text-[14px] leading-[1.7] font-light text-white/60">
						Obrigado! Seu depoimento foi enviado e passa por uma breve revisão
						antes de aparecer no site.
					</p>
				) : (
					<>
						<p className="mt-3.5 font-sans text-[13.5px] leading-[1.6] font-light text-white/50">
							{courseTitle ? (
								<>
									Conte como o curso{' '}
									<strong className="font-normal text-[#f2f2f0]">
										{courseTitle}
									</strong>{' '}
									impactou sua caminhada.
								</>
							) : (
								'Conte como sua experiência na escola impactou sua caminhada.'
							)}{' '}
							Seu depoimento passa por uma breve revisão antes de aparecer no
							site.
						</p>

						<div className="mt-6.5 flex items-center gap-3 border-b border-white/8 pb-5.5">
							{user?.avatarUrl ? (
								// eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host
								<img
									src={user.avatarUrl}
									alt=""
									className="size-10 flex-none rounded-full object-cover"
								/>
							) : (
								<span className="flex size-10 flex-none items-center justify-center rounded-full bg-[#22222a] font-heading text-xs">
									{initials}
								</span>
							)}
							<div>
								<div className="font-sans text-[13.5px] text-[#f2f2f0]">
									{user?.name ?? '…'}
								</div>
								<div className="font-sans text-[11.5px] font-light text-white/42">
									Publicado com seu nome e foto de perfil
								</div>
							</div>
						</div>

						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							noValidate
							className="mt-6 flex flex-col gap-4.5"
						>
							{courseTitle ? (
								<div>
									<div className="mb-2.25 font-heading text-[11px] tracking-[0.14em] text-white/45 uppercase">
										Curso
									</div>
									<div className="border-b border-white/18 py-3 font-sans text-[15px] font-light text-white/50">
										{courseTitle}
									</div>
								</div>
							) : null}

							<TestimonialQuoteField
								id="quote"
								label="Seu depoimento"
								placeholder="Escreva livremente sobre sua experiência com o curso..."
								error={form.formState.errors.quote?.message}
								{...form.register('quote')}
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
								disabled={submitMutation.isPending}
								className="rounded-full bg-[#f4f4f2] py-4.25 text-center text-[15px] text-[#0a0a0b] disabled:opacity-50"
							>
								{submitMutation.isPending ? 'Enviando...' : 'Enviar depoimento'}
							</button>
						</form>
					</>
				)}
			</div>
		</div>
	);
}

export { SubmitTestimonialPage };
