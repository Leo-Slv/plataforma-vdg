import Link from 'next/link';
import { motion } from 'motion/react';

import { appRoutes } from '@/lib/routes/app-routes';
import { cardScrollRevealAnimation } from '@/lib/motion/card-reveal';
import { PreviewModuleCard } from '@/features/catalog/components/preview-module-card';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { formatDuration } from '@/features/catalog/lib/format-duration';
import { getLockedCta } from '@/features/catalog/lib/locked-cta';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseDetails } from '@/features/catalog/model/course-details';

type LockedActionProps = {
	/** False when the user's e-mail is still unconfirmed (defaults to true). */
	emailVerified?: boolean;
	/** Starts the Stripe checkout for a purchasable course. */
	onBuy?: () => void;
	isBuying?: boolean;
	buyError?: string | null;
	/** Asks the church team for access (enrollment-controlled courses). */
	onRequestAccess?: () => void;
	isRequestingAccess?: boolean;
	requestAccessError?: string | null;
	/** Status of the user's latest access request for this course, if any. */
	requestStatus?: string | null;
};

type CourseDetailLockedProps = LockedActionProps & {
	course: CourseCatalogItem;
	areaName: string | null;
	details?: CourseDetails;
	/** The content preview failed to load (e.g. the e-mail is unconfirmed). */
	detailsUnavailable?: boolean;
};

const primaryButtonClass =
	'mt-5.5 block w-full rounded-full bg-foreground py-4.25 text-center font-sans text-[15px] text-background disabled:opacity-60';

function PriceLine({
	course,
}: {
	course: Pick<CourseCatalogItem, 'pricingModel' | 'priceAmount'>;
}) {
	if (course.pricingModel === 'Free') {
		return (
			<span className="font-heading text-[32px] font-extralight">Gratuito</span>
		);
	}

	if (course.pricingModel === 'EnrollmentControlled') {
		return (
			<span className="font-heading text-[26px] font-extralight">
				Por inscrição
			</span>
		);
	}

	if (course.priceAmount === null) {
		return null;
	}

	return (
		<span className="font-heading text-[38px] font-extralight">
			{formatCurrencyBrl(course.priceAmount)}
		</span>
	);
}

function AccessBadge({ course }: { course: CourseCatalogItem }) {
	if (course.hasAccess) {
		return null;
	}

	if (course.pricingModel === 'Free') {
		return (
			<span className="mt-6 inline-block rounded-full bg-surface px-4 py-2 font-heading text-[11px] tracking-[0.14em] text-[oklch(0.75_0.1_248)] uppercase">
				Gratuito
			</span>
		);
	}

	if (course.pricingModel === 'EnrollmentControlled') {
		return (
			<span className="mt-6 inline-block rounded-full bg-surface px-4 py-2 font-heading text-[11px] tracking-[0.14em] text-[oklch(0.75_0.1_248)] uppercase">
				Por inscrição
			</span>
		);
	}

	if (course.priceAmount === null) {
		return (
			<span className="mt-6 inline-block rounded-full bg-surface px-4 py-2 font-heading text-[11px] tracking-[0.14em] text-[oklch(0.75_0.1_248)] uppercase">
				Pago
			</span>
		);
	}

	return (
		<span className="mt-6 inline-block rounded-full bg-foreground px-4 py-2 font-heading text-[11px] tracking-[0.14em] text-background uppercase">
			{formatCurrencyBrl(course.priceAmount)}
		</span>
	);
}

function Note({ children }: { children: string }) {
	return (
		<p className="mt-3 text-center text-[11.5px] font-light text-foreground/40">
			{children}
		</p>
	);
}

function ErrorText({ children }: { children: string }) {
	return (
		<p
			role="alert"
			className="mt-3 text-[12.5px] text-[oklch(0.704_0.191_22.216)]"
		>
			{children}
		</p>
	);
}

function LockedAction({
	course,
	emailVerified = true,
	onBuy,
	isBuying = false,
	buyError = null,
	onRequestAccess,
	isRequestingAccess = false,
	requestAccessError = null,
	requestStatus = null,
}: LockedActionProps & { course: CourseCatalogItem }) {
	const cta = getLockedCta(course, { emailVerified, requestStatus });

	switch (cta.kind) {
		case 'verify-email':
			return (
				<div className="mt-5.5">
					<p className="text-[13px] leading-[1.6] font-light text-foreground/60">
						Confirme seu e-mail para liberar este curso. Até lá, nenhuma aula
						abre.
					</p>
					<Link
						href={appRoutes.auth.confirmEmail}
						className="mt-3.5 block w-full rounded-full bg-foreground py-4.25 text-center font-sans text-[15px] text-background"
					>
						Confirmar e-mail
					</Link>
				</div>
			);

		case 'buy':
			return (
				<>
					<button
						type="button"
						onClick={onBuy}
						disabled={!onBuy || isBuying}
						className={primaryButtonClass}
					>
						{isBuying ? 'Redirecionando para o pagamento…' : 'Comprar agora'}
					</button>
					{buyError ? <ErrorText>{buyError}</ErrorText> : null}
					<Note>Pagamento seguro processado pelo Stripe.</Note>
				</>
			);

		case 'request':
		case 'request-rejected':
			return (
				<>
					{cta.kind === 'request-rejected' ? (
						<p className="mt-5.5 text-[12.5px] font-light text-foreground/55">
							Sua última solicitação não foi aprovada. Você pode pedir de novo.
						</p>
					) : null}
					<button
						type="button"
						onClick={onRequestAccess}
						disabled={!onRequestAccess || isRequestingAccess}
						className={primaryButtonClass}
					>
						{isRequestingAccess
							? 'Enviando solicitação…'
							: cta.kind === 'request-rejected'
								? 'Solicitar novamente'
								: 'Solicitar acesso'}
					</button>
					{requestAccessError ? (
						<ErrorText>{requestAccessError}</ErrorText>
					) : null}
					<Note>A equipe da igreja analisa o pedido e libera o acesso.</Note>
				</>
			);

		case 'request-pending':
			return (
				<div className="mt-5.5 rounded-lg border border-foreground/12 px-4 py-3.5 text-center">
					<div className="font-sans text-[14px] text-foreground">
						Solicitação enviada
					</div>
					<p className="mt-1.5 text-[12.5px] font-light text-foreground/50">
						Aguardando a equipe liberar o seu acesso.
					</p>
				</div>
			);

		case 'members-only':
			return (
				<p className="mt-5.5 rounded-lg border border-foreground/12 px-4 py-3.5 text-[13px] leading-[1.6] font-light text-foreground/60">
					Este curso é gratuito, mas o acesso é liberado pela equipe da igreja.
					Fale com a secretaria para ser incluído.
				</p>
			);
	}
}

function PriceCard({
	course,
	...actionProps
}: { course: CourseCatalogItem } & LockedActionProps) {
	return (
		<div className="overflow-hidden rounded-[10px] border border-foreground/12 bg-surface sm:sticky sm:top-5">
			<div
				className="flex h-[200px] items-center justify-center"
				style={{
					backgroundImage:
						'repeating-linear-gradient(135deg, var(--stripe-1) 0 8px, var(--stripe-2) 8px 16px)',
				}}
			>
				<span className="font-mono text-[10px] text-foreground/35">
					trailer do curso
				</span>
			</div>
			<div className="p-6.5">
				<PriceLine course={course} />
				<LockedAction course={course} {...actionProps} />
				<div className="mt-6.5 flex flex-col gap-3 border-t border-foreground/9 pt-5.5 text-[13px] font-light text-foreground/55">
					<div>Acesso vitalício ao conteúdo</div>
					{course.certificateIssued ? (
						<div>Certificado ao concluir 100%</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

function CourseDetailLocked({
	course,
	areaName,
	details,
	detailsUnavailable = false,
	...actionProps
}: CourseDetailLockedProps) {
	const moduleWord = course.moduleCount === 1 ? 'módulo' : 'módulos';
	const lessonWord = course.lessonCount === 1 ? 'aula' : 'aulas';

	return (
		<div className="px-5 py-11 sm:px-10">
			<div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_380px] sm:gap-14">
				<div className="min-w-0">
					{areaName ? (
						<div className="font-heading text-[11px] tracking-[0.18em] text-foreground/45 uppercase">
							{areaName}
						</div>
					) : null}
					<h1 className="mt-4 font-heading text-[40px] leading-[1.06] font-extralight tracking-tight sm:text-[52px]">
						{course.title}
					</h1>
					<p className="mt-5 max-w-[600px] text-[16px] leading-[1.7] font-light text-pretty text-foreground/60">
						{course.description}
					</p>

					<AccessBadge course={course} />

					<div className="mt-8.5 flex flex-wrap gap-9 border-t border-b border-foreground/9 py-5.5 font-sans text-[13px] font-light text-foreground/45">
						<div>
							<div className="mb-1.25 font-heading text-xl font-light text-foreground">
								{course.moduleCount}
							</div>
							{moduleWord}
						</div>
						<div>
							<div className="mb-1.25 font-heading text-xl font-light text-foreground">
								{course.lessonCount}
							</div>
							{lessonWord}
						</div>
						<div>
							<div className="mb-1.25 font-heading text-xl font-light text-foreground">
								{formatDuration(course.durationSeconds)}
							</div>
							de vídeo
						</div>
						<div>
							<div className="mb-1.25 font-heading text-xl font-light text-foreground">
								{course.certificateIssued ? 'Sim' : 'Não'}
							</div>
							certificado
						</div>
					</div>

					<h2 className="mt-11 font-heading text-2xl font-light">
						Conteúdo do curso
					</h2>

					{details ? (
						<div className="mt-6 grid grid-cols-1 gap-5.5 sm:grid-cols-2">
							{details.modules.map((module, index) => (
								<motion.div
									key={module.id}
									{...cardScrollRevealAnimation(index)}
								>
									<PreviewModuleCard
										module={module}
										position={index + 1}
										slug={course.slug}
									/>
								</motion.div>
							))}
						</div>
					) : detailsUnavailable ? (
						<p className="mt-4 font-sans text-sm font-light text-foreground/45">
							A prévia do conteúdo não está disponível agora.
						</p>
					) : (
						<p className="mt-4 font-sans text-sm font-light text-foreground/45">
							Carregando conteúdo…
						</p>
					)}
				</div>

				<div>
					<PriceCard course={course} {...actionProps} />
				</div>
			</div>
		</div>
	);
}

export { CourseDetailLocked };
