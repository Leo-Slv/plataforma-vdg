import { cn } from '@/lib/utils';
import { resolveCourseTitle } from '@/features/admin/lib/resolve-course-title';
import { formatRelativeTime } from '@/features/admin/lib/format-relative-time';
import type { Testimonial } from '@/features/admin/model/testimonial';
import type { Course } from '@/features/admin/model/course';

type TestimonialsTableProps = {
	testimonials: Testimonial[];
	courses: Course[];
	pendingId: string | null;
	onPublish: (testimonialId: string) => void;
	onUnpublish: (testimonialId: string) => void;
};

const COLUMNS = 'grid-cols-[1.3fr_2.4fr_1fr_0.9fr]';

function TestimonialsTable({
	testimonials,
	courses,
	pendingId,
	onPublish,
	onUnpublish,
}: TestimonialsTableProps) {
	if (testimonials.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-foreground/45">
				Nenhum depoimento encontrado.
			</p>
		);
	}

	const now = new Date();

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-foreground/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase',
					COLUMNS,
				)}
			>
				<span>Aluno · curso</span>
				<span>Depoimento</span>
				<span>Status</span>
				<span>Ações</span>
			</div>

			{testimonials.map((testimonial) => {
				const isPending = pendingId === testimonial.id;

				return (
					<div
						key={testimonial.id}
						className={cn(
							'grid items-center gap-4 border-b border-foreground/7 py-4.5 font-sans text-[13px] text-foreground/75',
							COLUMNS,
						)}
					>
						<div>
							<div className="font-heading text-[14px] text-foreground">
								{testimonial.authorName}
							</div>
							<div className="mt-1 text-[11.5px] font-light text-foreground/40">
								{resolveCourseTitle(testimonial.courseId, courses)}
							</div>
						</div>
						<span className="line-clamp-2 text-foreground/60">
							&quot;{testimonial.quote}&quot;
						</span>
						<span
							className={cn(
								testimonial.published
									? 'text-[oklch(0.75_0.1_248)]'
									: 'text-foreground/55',
							)}
						>
							{testimonial.published ? 'Publicado' : 'Pendente'}
						</span>
						{testimonial.published ? (
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => onUnpublish(testimonial.id)}
									disabled={isPending}
									className="font-sans text-[11.5px] text-foreground/40 underline underline-offset-2 disabled:opacity-50"
								>
									Despublicar
								</button>
								<span className="text-[11.5px] font-light text-foreground/40">
									{formatRelativeTime(testimonial.updatedAt, now)}
								</span>
							</div>
						) : (
							<button
								type="button"
								onClick={() => onPublish(testimonial.id)}
								disabled={isPending}
								className="w-fit rounded-full bg-foreground px-3.25 py-2 font-sans text-[11.5px] text-background disabled:opacity-50"
							>
								{isPending ? 'Publicando...' : 'Publicar'}
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
}

export { TestimonialsTable };
