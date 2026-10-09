import { formatCourseAccessSource } from '@/features/admin/lib/course-access-source';
import type { Course } from '@/features/admin/model/course';
import type { UserCourseAccess } from '@/features/admin/model/user-course-access';

type GrantedCoursesPanelProps = {
	grants: UserCourseAccess[];
	courses: Course[];
	onGrant: () => void;
	onRevoke: (courseId: string) => void;
	revokingCourseId?: string | null;
};

function GrantedCoursesPanel({
	grants,
	courses,
	onGrant,
	onRevoke,
	revokingCourseId = null,
}: GrantedCoursesPanelProps) {
	const rows = grants
		.map((grant) => ({
			grant,
			title: courses.find((course) => course.id === grant.courseId)?.title,
		}))
		.filter((row): row is typeof row & { title: string } => Boolean(row.title));

	return (
		<div className="rounded-[8px] border border-foreground/10 p-4.5">
			<div className="font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
				Cursos liberados
			</div>
			<div className="mt-3.5 flex flex-col gap-2.5 font-sans text-[13px] text-foreground/60">
				{rows.length === 0 ? (
					<span className="text-foreground/35">
						Nenhum curso liberado individualmente.
					</span>
				) : (
					rows.map(({ grant, title }) => (
						<div
							key={grant.courseId}
							className="flex items-center justify-between gap-3"
						>
							<span className="min-w-0 truncate">{title}</span>
							<span className="flex shrink-0 items-center gap-3">
								<span className="text-foreground/35">
									{formatCourseAccessSource(grant.source)}
								</span>
								<button
									type="button"
									onClick={() => onRevoke(grant.courseId)}
									disabled={revokingCourseId === grant.courseId}
									aria-label={`Revogar acesso a ${title}`}
									className="text-[12px] text-[oklch(0.704_0.191_22.216)] disabled:opacity-50"
								>
									{revokingCourseId === grant.courseId
										? 'Revogando…'
										: 'Revogar'}
								</button>
							</span>
						</div>
					))
				)}
			</div>
			<button
				type="button"
				onClick={onGrant}
				className="mt-3.5 inline-block font-sans text-[12px] text-[oklch(0.72_0.1_248)]"
			>
				+ Conceder acesso a um curso
			</button>
		</div>
	);
}

export { GrantedCoursesPanel };
