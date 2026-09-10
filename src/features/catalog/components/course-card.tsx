import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { CoverImage } from '@/components/cover-image';
import { appRoutes } from '@/lib/routes/app-routes';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import type {
	AreaSummary,
	CourseCatalogItem,
} from '@/features/catalog/model/course-catalog';

type CourseCardProps = {
	course: CourseCatalogItem;
	area: AreaSummary;
};

function accessBadge(
	course: Pick<CourseCatalogItem, 'hasAccess' | 'pricingModel'>,
) {
	if (course.hasAccess) {
		return null;
	}

	return course.pricingModel === 'Free' ? 'Gratuito' : 'Pago';
}

function AccessBadge({
	course,
}: {
	course: Pick<CourseCatalogItem, 'hasAccess' | 'pricingModel' | 'priceAmount'>;
}) {
	if (course.hasAccess) {
		return null;
	}

	if (course.pricingModel !== 'Free' && course.priceAmount !== null) {
		return (
			<span className="absolute top-2.5 left-2.5 rounded-full bg-[#f4f4f2] px-2.25 py-1.25 font-heading text-[9.5px] tracking-[0.14em] whitespace-nowrap text-[#0a0a0b] uppercase">
				{formatCurrencyBrl(course.priceAmount)}
			</span>
		);
	}

	const badge = accessBadge(course);

	if (!badge) {
		return null;
	}

	return (
		<span className="absolute top-2.5 left-2.5 rounded-full bg-[#0a0a0b]/85 px-2.25 py-1.25 font-heading text-[9.5px] tracking-[0.14em] whitespace-nowrap text-[oklch(0.75_0.1_248)] uppercase">
			{badge}
		</span>
	);
}

function CourseCard({ course, area }: CourseCardProps) {
	return (
		<Link
			href={appRoutes.courses.detail(course.slug)}
			className={cn(
				'block w-[340px] flex-none text-[#f2f2f0]',
				!course.hasAccess && 'opacity-55',
			)}
		>
			<div className="relative aspect-video overflow-hidden rounded-[10px]">
				<CoverImage src={course.thumbnailUrl} />
				<AccessBadge course={course} />
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
					<div className="mt-1.75 line-clamp-2 text-[12.5px] leading-[1.6] font-light text-white/45">
						{area.name} · {course.description}
					</div>
				</div>
				<span aria-hidden className="px-0.5 pt-0.5 text-[15px] text-white/35">
					⋮
				</span>
			</div>
		</Link>
	);
}

export { CourseCard, accessBadge };
