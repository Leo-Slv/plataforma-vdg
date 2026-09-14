import { CourseCard } from '@/features/catalog/components/course-card';
import type { AreaGroup } from '@/features/catalog/lib/filter-courses';

type AreaSectionProps = {
	group: AreaGroup;
	onSelectArea: (areaId: string) => void;
};

function AreaSection({ group, onSelectArea }: AreaSectionProps) {
	const { area, courses } = group;

	return (
		<section className="mt-12 first:mt-0">
			<div className="flex items-baseline justify-between border-b border-foreground/10 pb-3.5">
				<div>
					<h2 className="font-heading text-2xl font-light">{area.name}</h2>
					{area.description ? (
						<p className="mt-2 max-w-[420px] text-[13px] font-light text-foreground/45">
							{area.description}
						</p>
					) : null}
				</div>
				<button
					type="button"
					onClick={() => onSelectArea(area.id)}
					className="font-sans text-[12.5px] font-light text-foreground/45"
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
