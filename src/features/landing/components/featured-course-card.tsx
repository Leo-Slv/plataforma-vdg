import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { appRoutes } from '@/lib/routes/app-routes';
import { CoverImage } from '@/components/cover-image';
import { formatDuration } from '@/features/landing/lib/format-duration';
import { resolveLivePriceLabel } from '@/features/landing/lib/resolve-live-price-label';
import type { FeaturedCourse } from '@/features/landing/model/featured-course';
import type { PublicFeaturedCourse } from '@/features/landing/model/public-catalog-summary';

type LiveCourseInfo = PublicFeaturedCourse;

function priceLabel(price: FeaturedCourse['price']) {
	return price === 'free' ? 'Gratuito' : price.amountLabel;
}

type ResolvedCard = {
	title: string;
	category: string;
	moduleCount: number;
	lessonCount: number;
	durationLabel: string;
	priceLabel: string;
	isFree: boolean;
	statusLabel: string;
};

function resolveCard(
	course: FeaturedCourse,
	live?: LiveCourseInfo,
): ResolvedCard {
	if (!live) {
		return {
			title: course.title,
			category: course.category,
			moduleCount: course.moduleCount,
			lessonCount: course.lessonCount,
			durationLabel: course.durationLabel,
			priceLabel: priceLabel(course.price),
			isFree: course.price === 'free',
			statusLabel: course.statusLabel,
		};
	}

	return {
		title: live.title,
		category: live.areaName ?? course.category,
		moduleCount: live.moduleCount,
		lessonCount: live.lessonCount,
		durationLabel: formatDuration(live.durationSeconds),
		priceLabel: resolveLivePriceLabel(live),
		isFree: live.pricingModel === 'Free',
		statusLabel: course.statusLabel,
	};
}

function CardWrapper({
	live,
	children,
}: {
	live?: LiveCourseInfo;
	children: ReactNode;
}) {
	if (live) {
		return <Link href={appRoutes.courses.detail(live.slug)}>{children}</Link>;
	}
	return <>{children}</>;
}

function FeaturedCourseCard({
	course,
	live,
}: {
	course: FeaturedCourse;
	live?: LiveCourseInfo;
}) {
	const resolved = resolveCard(course, live);

	return (
		<CardWrapper live={live}>
			<div className="hidden text-foreground sm:block">
				<div className="relative aspect-video overflow-hidden rounded-[10px]">
					<CoverImage src={live?.thumbnailUrl ?? null} />
					<span className="absolute right-2.5 bottom-2.5 rounded bg-background/85 px-1.75 py-1 font-sans text-[11.5px] font-medium whitespace-nowrap">
						{resolved.lessonCount} aulas · {resolved.durationLabel}
					</span>
					<span
						className={`absolute top-2.5 left-2.5 rounded-full px-2.25 py-1.25 font-heading text-[9.5px] tracking-[0.14em] whitespace-nowrap uppercase ${
							resolved.isFree
								? 'bg-background/85 text-[oklch(0.75_0.1_248)]'
								: 'bg-foreground text-background'
						}`}
					>
						{resolved.priceLabel}
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
						<div className="font-heading text-[15.5px]">{resolved.title}</div>
						<div className="mt-1.75 text-[12.5px] leading-[1.6] font-light text-foreground/45">
							{resolved.category} · {resolved.moduleCount} módulos
							<br />
							{resolved.statusLabel}
						</div>
					</div>
					<span aria-hidden className="px-0.5 pt-0.5 text-[15px] text-foreground/35">
						⋮
					</span>
				</div>
			</div>

			<div className="flex items-center gap-3.5 sm:hidden">
				<div className="relative h-16 w-22 flex-none overflow-hidden rounded-md">
					<CoverImage src={live?.thumbnailUrl ?? null} />
				</div>
				<div>
					<div
						className={`font-heading text-[10px] tracking-[0.14em] uppercase ${
							resolved.isFree ? 'text-[oklch(0.75_0.1_248)]' : 'text-foreground/80'
						}`}
					>
						{resolved.priceLabel}
					</div>
					<div className="mt-1.5 font-heading text-base">{resolved.title}</div>
					<div className="mt-1.25 text-xs font-light text-foreground/45">
						{resolved.moduleCount} módulos · {resolved.lessonCount} aulas
					</div>
				</div>
			</div>
		</CardWrapper>
	);
}

export { FeaturedCourseCard };
