import { accessBadge } from '@/features/catalog/components/course-card';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';

type CourseDetailLockedProps = {
	course: CourseCatalogItem;
	areaName: string | null;
};

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

				<button
					type="button"
					className="mt-7 block w-full max-w-[280px] rounded-full bg-[#f4f4f2] py-4 text-center font-sans text-[15px] text-[#0a0a0b]"
				>
					Inscrever-se
				</button>
			</div>
		</div>
	);
}

export { CourseDetailLocked };
