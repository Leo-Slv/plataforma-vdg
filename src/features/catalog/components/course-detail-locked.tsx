import { PreviewModuleCard } from '@/features/catalog/components/preview-module-card';
import {
	formatCurrencyBrl,
	formatCurrencyBrlWithCents,
} from '@/features/catalog/lib/format-currency-brl';
import { formatDuration } from '@/features/catalog/lib/format-duration';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseDetails } from '@/features/catalog/model/course-details';

const INSTALLMENTS = 3;

type CourseDetailLockedProps = {
	course: CourseCatalogItem;
	areaName: string | null;
	details?: CourseDetails;
};

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
		<div className="flex items-baseline gap-2">
			<span className="font-heading text-[38px] font-extralight">
				{formatCurrencyBrl(course.priceAmount)}
			</span>
			<span className="text-[13px] font-light text-foreground/45">
				ou {INSTALLMENTS}× de{' '}
				{formatCurrencyBrlWithCents(course.priceAmount / INSTALLMENTS)}
			</span>
		</div>
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

function PriceCard({ course }: { course: CourseCatalogItem }) {
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
				<button
					type="button"
					className="mt-5.5 block w-full rounded-full bg-foreground py-4.25 text-center font-sans text-[15px] text-background"
				>
					Inscrever-se agora
				</button>
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
								<PreviewModuleCard
									key={module.id}
									module={module}
									position={index + 1}
									slug={course.slug}
								/>
							))}
						</div>
					) : (
						<p className="mt-4 font-sans text-sm font-light text-foreground/45">
							Carregando conteúdo…
						</p>
					)}
				</div>

				<div>
					<PriceCard course={course} />
				</div>
			</div>
		</div>
	);
}

export { CourseDetailLocked };
