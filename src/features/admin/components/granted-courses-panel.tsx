import type { Course } from '@/features/admin/model/course';

type GrantedCoursesPanelProps = {
	grantedCourseIds: string[];
	courses: Course[];
	onGrant: () => void;
};

function GrantedCoursesPanel({
	grantedCourseIds,
	courses,
	onGrant,
}: GrantedCoursesPanelProps) {
	const grantedTitles = grantedCourseIds
		.map((courseId) => courses.find((course) => course.id === courseId)?.title)
		.filter((title): title is string => Boolean(title));

	return (
		<div className="rounded-[8px] border border-foreground/10 p-4.5">
			<div className="font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
				Cursos pagos concedidos
			</div>
			<div className="mt-3.5 flex flex-col gap-2.5 font-sans text-[13px] text-foreground/60">
				{grantedTitles.length === 0 ? (
					<span className="text-foreground/35">Nenhum curso pago concedido.</span>
				) : (
					grantedTitles.map((title) => (
						<div key={title} className="flex justify-between">
							<span>{title}</span>
							<span className="text-foreground/35">Comprado</span>
						</div>
					))
				)}
			</div>
			<button
				type="button"
				onClick={onGrant}
				className="mt-3.5 inline-block font-sans text-[12px] text-[oklch(0.72_0.1_248)]"
			>
				+ Conceder acesso a um curso pago
			</button>
		</div>
	);
}

export { GrantedCoursesPanel };
