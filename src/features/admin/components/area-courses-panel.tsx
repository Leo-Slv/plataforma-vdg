import type { Area } from '@/features/admin/model/area';

type AreaCoursesPanelProps = {
	courses: Area['courses'];
};

function AreaCoursesPanel({ courses }: AreaCoursesPanelProps) {
	if (courses.length === 0) {
		return null;
	}

	return (
		<div className="border-t border-foreground/8 pt-4.5">
			<span className="font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
				Cursos nesta área
			</span>
			<div className="mt-3.5 flex flex-col gap-2.5 font-sans text-[13px] font-light text-foreground/60">
				{courses.map((course) => (
					<div key={course.id} className="flex justify-between">
						<span>{course.title}</span>
						<span className="text-foreground/35">
							{course.published ? 'Publicado' : 'Rascunho'}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export { AreaCoursesPanel };
