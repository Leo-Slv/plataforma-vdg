import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import type { CourseDetails } from '@/features/catalog/model/course-details';
import type { CourseProgress } from '@/features/catalog/model/course-progress';

type LessonSidebarProps = {
	details: CourseDetails;
	progress: CourseProgress | undefined;
	currentLessonId: string;
	slug: string;
};

function LessonSidebar({
	details,
	progress,
	currentLessonId,
	slug,
}: LessonSidebarProps) {
	return (
		<div className="border-l border-foreground/8 px-6 py-6.5">
			<div className="font-heading text-[10.5px] tracking-[0.16em] text-foreground/42 uppercase">
				Conteúdo
			</div>

			{details.modules.map((module, moduleIndex) => (
				<div key={module.id} className={moduleIndex > 0 ? 'mt-5.5' : 'mt-5'}>
					<div className="font-heading text-[13.5px] text-foreground/85">
						{String(moduleIndex + 1).padStart(2, '0')} · {module.title}
					</div>
					<div className="mt-3.5 flex flex-col gap-0.5">
						{module.lessons.map((lesson) => {
							const isCurrent = lesson.id === currentLessonId;
							const isCompleted =
								!isCurrent &&
								progress?.lessons.some(
									(entry) => entry.lessonId === lesson.id && entry.completed,
								);

							return (
								<Link
									key={lesson.id}
									href={appRoutes.courses.lesson(slug, lesson.id)}
									className={cn(
										'flex items-start gap-2.75 rounded-md px-3 py-2.75 font-sans text-[13px] leading-[1.35]',
										isCurrent
											? 'bg-foreground/6 text-foreground'
											: 'font-light text-foreground/55',
									)}
								>
									{isCurrent ? (
										<span
											aria-hidden
											className="mt-0.5 flex size-4 flex-none items-center justify-center rounded-full border border-[oklch(0.72_0.1_248)] text-[7px] text-[oklch(0.75_0.1_248)]"
										>
											▶
										</span>
									) : isCompleted ? (
										<span
											aria-hidden
											className="mt-0.5 flex size-4 flex-none items-center justify-center rounded-full bg-[oklch(0.72_0.1_248)] text-[9px] text-background"
										>
											✓
										</span>
									) : (
										<span
											aria-hidden
											className="mt-0.5 size-4 flex-none rounded-full border border-foreground/20"
										/>
									)}
									<div className="min-w-0 flex-1">
										<div>{lesson.title}</div>
										{lesson.description ? (
											<div className="mt-0.5 line-clamp-1 text-[11.5px] font-light text-foreground/40">
												{lesson.description}
											</div>
										) : null}
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			))}

			<div className="mt-5.5 border-t border-foreground/9 pt-5 font-sans text-[11.5px] leading-[1.6] font-light text-foreground/35">
				A aula é marcada como concluída quando você assiste 90% do vídeo.
			</div>
		</div>
	);
}

export { LessonSidebar };
