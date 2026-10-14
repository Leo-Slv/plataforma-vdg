import Image from 'next/image';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { CoverImage } from '@/components/cover-image';
import { formatDuration } from '@/features/landing/lib/format-duration';
import { resolveLivePriceLabel } from '@/features/landing/lib/resolve-live-price-label';
import type { PublicFeaturedCourse } from '@/features/landing/model/public-catalog-summary';

function FeaturedCourseCard({ course }: { course: PublicFeaturedCourse }) {
	const priceLabel = resolveLivePriceLabel(course);
	const isFree = course.pricingModel === 'Free';
	const durationLabel = formatDuration(course.durationSeconds);
	const meta = [course.areaName, `${course.moduleCount} módulos`]
		.filter(Boolean)
		.join(' · ');

	return (
		<Link href={appRoutes.courses.detail(course.slug)}>
			<div className="hidden text-foreground sm:block">
				<div className="relative aspect-video overflow-hidden rounded-[10px]">
					<CoverImage src={course.thumbnailUrl ?? null} />
					<span className="absolute right-2.5 bottom-2.5 rounded bg-background/85 px-1.75 py-1 font-sans text-[11.5px] font-medium whitespace-nowrap">
						{course.lessonCount} aulas · {durationLabel}
					</span>
					<span
						className={`absolute top-2.5 left-2.5 rounded-full px-2.25 py-1.25 font-heading text-[9.5px] tracking-[0.14em] whitespace-nowrap uppercase ${
							isFree
								? 'bg-background/85 text-[oklch(0.75_0.1_248)]'
								: 'bg-foreground text-background'
						}`}
					>
						{priceLabel}
					</span>
				</div>
				<div className="mt-3.5 flex gap-3">
					<Image
						src="/brand/viver-da-graca-mark.png"
						alt=""
						aria-hidden
						width={36}
						height={36}
						className="size-9 flex-none rounded-full object-cover"
					/>
					<div className="min-w-0 flex-1">
						<div className="font-heading text-[15.5px]">{course.title}</div>
						<div className="mt-1.75 text-[12.5px] leading-[1.6] font-light text-foreground/45">
							{meta}
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-3.5 sm:hidden">
				<div className="relative h-16 w-22 flex-none overflow-hidden rounded-md">
					<CoverImage src={course.thumbnailUrl ?? null} />
				</div>
				<div>
					<div
						className={`font-heading text-[10px] tracking-[0.14em] uppercase ${
							isFree ? 'text-[oklch(0.75_0.1_248)]' : 'text-foreground/80'
						}`}
					>
						{priceLabel}
					</div>
					<div className="mt-1.5 font-heading text-base">{course.title}</div>
					<div className="mt-1.25 text-xs font-light text-foreground/45">
						{course.moduleCount} módulos · {course.lessonCount} aulas
					</div>
				</div>
			</div>
		</Link>
	);
}

export { FeaturedCourseCard };
