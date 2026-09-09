import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { featuredFormationCopy } from '@/features/landing/lib/landing-content';
import { formatDuration } from '@/features/landing/lib/format-duration';
import { resolveLivePriceLabel } from '@/features/landing/lib/resolve-live-price-label';
import type { PublicFeaturedCourse } from '@/features/landing/model/public-catalog-summary';

type FeaturedFormationSectionProps = {
	course: PublicFeaturedCourse;
};

function FeaturedFormationSection({ course }: FeaturedFormationSectionProps) {
	const detailHref = appRoutes.courses.detail(course.slug);
	const statsLine = [
		course.areaName,
		`${course.moduleCount} módulos`,
		`${course.lessonCount} aulas`,
		formatDuration(course.durationSeconds),
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<section className="border-t border-white/8 px-5 py-11 sm:px-11 sm:py-22">
			<div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-[#141416] sm:grid-cols-2 sm:gap-16">
				<div className="relative aspect-4/3">
					{course.thumbnailUrl ? (
						// eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host
						<img
							src={course.thumbnailUrl}
							alt=""
							className="absolute inset-0 size-full object-cover opacity-50"
						/>
					) : (
						<div
							className="absolute inset-0 opacity-50"
							style={{
								backgroundImage:
									'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
							}}
						/>
					)}
					<div className="absolute inset-0 bg-gradient-to-r from-[#141416] via-transparent to-transparent" />
				</div>
				<div className="px-5 pb-8 sm:px-0 sm:pr-14 sm:pb-0">
					<div className="inline-flex rounded-full border border-[oklch(0.45_0.07_248)] px-4 py-2.5 font-heading text-[11px] tracking-[0.2em] text-[oklch(0.75_0.1_248)] uppercase">
						{featuredFormationCopy.eyebrow}
					</div>
					<h3 className="mt-5.5 font-heading text-[32px] leading-[1.15] font-extralight tracking-tight text-[#f2f2f0]">
						{course.title}
					</h3>
					<p className="mt-3 font-heading text-[11px] tracking-[0.1em] text-white/45 uppercase">
						{statsLine} · {resolveLivePriceLabel(course)}
					</p>
					<p className="mt-4 text-[14.5px] leading-[1.7] font-light text-white/55">
						{course.description}
					</p>
					<div className="mt-7 flex gap-3.5">
						<Link
							href={detailHref}
							className="rounded-full bg-[#f4f4f2] px-6 py-3.5 text-[13.5px] text-[#0a0a0b]"
						>
							{featuredFormationCopy.primaryCtaLabel}
						</Link>
						<Link
							href={detailHref}
							className="px-1 py-3.5 text-[13.5px] text-white/70"
						>
							{featuredFormationCopy.secondaryCtaLabel}
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

export { FeaturedFormationSection };
