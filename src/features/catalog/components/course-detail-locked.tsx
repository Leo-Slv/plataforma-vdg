import { accessBadge } from '@/features/catalog/components/course-card';
import {
	formatCurrencyBrl,
	formatCurrencyBrlWithCents,
} from '@/features/catalog/lib/format-currency-brl';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';

const INSTALLMENTS = 3;

type CourseDetailLockedProps = {
	course: CourseCatalogItem;
	areaName: string | null;
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
			<span className="text-[13px] font-light text-white/45">
				ou {INSTALLMENTS}× de{' '}
				{formatCurrencyBrlWithCents(course.priceAmount / INSTALLMENTS)}
			</span>
		</div>
	);
}

function CourseDetailLocked({ course, areaName }: CourseDetailLockedProps) {
	const badge = accessBadge(course);

	return (
		<div className="px-5 py-11 sm:px-10">
			<div className="max-w-[640px]">
				{areaName ? (
					<div className="font-heading text-[11px] tracking-[0.18em] text-white/45 uppercase">
						{areaName}
					</div>
				) : null}
				<h1 className="mt-4 font-heading text-[40px] leading-[1.06] font-extralight tracking-tight sm:text-[52px]">
					{course.title}
				</h1>
				<p className="mt-5 text-[16px] leading-[1.7] font-light text-pretty text-white/60">
					{course.description}
				</p>

				{badge ? (
					<span className="mt-6 inline-block rounded-full bg-[#101012] px-4 py-2 font-heading text-[11px] tracking-[0.14em] text-[oklch(0.75_0.1_248)] uppercase">
						{badge}
					</span>
				) : null}

				<div className="mt-7 max-w-[380px] overflow-hidden rounded-[10px] border border-white/12 bg-[#101012]">
					<div
						className="flex h-[200px] items-center justify-center"
						style={{
							backgroundImage:
								'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
						}}
					>
						<span className="font-mono text-[10px] text-white/35">
							trailer do curso
						</span>
					</div>
					<div className="p-6.5">
						<PriceLine course={course} />
						<button
							type="button"
							className="mt-5.5 block w-full rounded-full bg-[#f4f4f2] py-4.25 text-center font-sans text-[15px] text-[#0a0a0b]"
						>
							Inscrever-se agora
						</button>
						<div className="mt-6.5 flex flex-col gap-3 border-t border-white/9 pt-5.5 text-[13px] font-light text-white/55">
							<div>Acesso vitalício ao conteúdo</div>
							{course.certificateIssued ? (
								<div>Certificado ao concluir 100%</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export { CourseDetailLocked };
