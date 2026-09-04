import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
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

function CourseCard({ course, area }: CourseCardProps) {
	const badge = accessBadge(course);

	return (
		<Link
			href={appRoutes.courses.detail(course.slug)}
			className={cn(
				'block w-[340px] flex-none text-[#f2f2f0]',
				!course.hasAccess && 'opacity-55',
			)}
		>
			<div
				className="relative aspect-video overflow-hidden rounded-[10px]"
				style={
					course.thumbnailUrl
						? undefined
						: {
								backgroundImage:
									'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
							}
				}
			>
				{course.thumbnailUrl ? (
					// eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host
					<img
						src={course.thumbnailUrl}
						alt=""
						className="size-full object-cover"
					/>
				) : null}
				{badge ? (
					<span className="absolute top-2.5 left-2.5 rounded-full bg-[#0a0a0b]/85 px-2.25 py-1.25 font-heading text-[9.5px] tracking-[0.14em] whitespace-nowrap text-[oklch(0.75_0.1_248)] uppercase">
						{badge}
					</span>
				) : null}
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
