import { CourseCard } from '@/features/catalog/components/course-card';
import type { AreaGroup } from '@/features/catalog/lib/filter-courses';

type AreaSectionProps = {
	group: AreaGroup;
	position: number;
	onSelectArea: (areaId: string) => void;
};

function AreaSection({ group, position, onSelectArea }: AreaSectionProps) {
	const { area, courses } = group;
	const label = String(position).padStart(2, '0');

	return (
		<section className="mt-12 first:mt-0">
			<div className="flex items-baseline justify-between border-b border-white/10 pb-3.5">
				<div>
					<div className="font-heading text-[9.5px] tracking-[0.18em] text-white/40 uppercase">
						Área {label}
					</div>
					<h2 className="mt-2.75 font-heading text-2xl font-light">
						{area.name}
					</h2>
				</div>
				<button
					type="button"
					onClick={() => onSelectArea(area.id)}
					className="font-sans text-[12.5px] font-light text-white/45"
				>
					{courses.length} cursos →
				</button>
			</div>

			<div
				className="mt-6 flex gap-7 overflow-x-auto pb-1"
				style={{
					maskImage:
						'linear-gradient(to right, #000 0, #000 92%, transparent 100%)',
				}}
			>
				{courses.map((course) => (
					<CourseCard key={course.id} course={course} area={area} />
				))}
			</div>
		</section>
	);
}

export { AreaSection };
