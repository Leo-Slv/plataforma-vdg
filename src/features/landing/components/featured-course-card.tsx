import Image from 'next/image';

import type { FeaturedCourse } from '@/features/landing/model/featured-course';

function priceLabel(price: FeaturedCourse['price']) {
	return price === 'free' ? 'Gratuito' : price.amountLabel;
}

function FeaturedCourseCard({ course }: { course: FeaturedCourse }) {
	const price = priceLabel(course.price);
	const isFree = course.price === 'free';

	return (
		<>
			<div className="hidden text-[#f2f2f0] sm:block">
				<div
					className="relative aspect-video overflow-hidden rounded-[10px]"
					style={{
						backgroundImage:
							'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
					}}
				>
					<span className="absolute right-2.5 bottom-2.5 rounded bg-[#0a0a0b]/85 px-1.75 py-1 font-sans text-[11.5px] font-medium whitespace-nowrap">
						{course.lessonCount} aulas · {course.durationLabel}
					</span>
					<span
						className={`absolute top-2.5 left-2.5 rounded-full px-2.25 py-1.25 font-heading text-[9.5px] tracking-[0.14em] whitespace-nowrap uppercase ${
							isFree
								? 'bg-[#0a0a0b]/85 text-[oklch(0.75_0.1_248)]'
								: 'bg-[#f4f4f2] text-[#0a0a0b]'
						}`}
					>
						{price}
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
						<div className="mt-1.75 text-[12.5px] leading-[1.6] font-light text-white/45">
							{course.category} · {course.moduleCount} módulos
							<br />
							{course.statusLabel}
						</div>
					</div>
					<span aria-hidden className="px-0.5 pt-0.5 text-[15px] text-white/35">
						⋮
					</span>
				</div>
			</div>

			<div className="flex items-center gap-3.5 sm:hidden">
				<div
					className="h-16 w-22 flex-none rounded-md"
					style={{
						backgroundImage:
							'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
					}}
				/>
				<div>
					<div
						className={`font-heading text-[10px] tracking-[0.14em] uppercase ${
							isFree ? 'text-[oklch(0.75_0.1_248)]' : 'text-white/80'
						}`}
					>
						{price}
					</div>
					<div className="mt-1.5 font-heading text-base">{course.title}</div>
					<div className="mt-1.25 text-xs font-light text-white/45">
						{course.moduleCount} módulos · {course.lessonCount} aulas
					</div>
				</div>
			</div>
		</>
	);
}

export { FeaturedCourseCard };
