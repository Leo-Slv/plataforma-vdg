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
		<div className="border-l border-white/8 px-6 py-6.5">
			<div className="font-heading text-[10.5px] tracking-[0.16em] text-white/42 uppercase">
				Conteúdo
			</div>

			{details.modules.map((module, moduleIndex) => (
				<div key={module.id} className={moduleIndex > 0 ? 'mt-5.5' : 'mt-5'}>
					<div className="font-heading text-[13.5px] text-white/85">
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
										'flex items-center gap-2.75 rounded-md px-3 py-2.75 font-sans text-[13px] leading-[1.35]',
										isCurrent
											? 'bg-white/6 text-[#f2f2f0]'
											: 'font-light text-white/55',
									)}
								>
									{isCurrent ? (
										<span
											aria-hidden
											className="flex size-4 flex-none items-center justify-center rounded-full border border-[oklch(0.72_0.1_248)] text-[7px] text-[oklch(0.75_0.1_248)]"
										>
											▶
										</span>
									) : isCompleted ? (
										<span
											aria-hidden
											className="flex size-4 flex-none items-center justify-center rounded-full bg-[oklch(0.72_0.1_248)] text-[9px] text-[#0a0a0b]"
										>
											✓
										</span>
									) : (
										<span
											aria-hidden
											className="size-4 flex-none rounded-full border border-white/20"
										/>
									)}
									{lesson.title}
								</Link>
							);
						})}
					</div>
				</div>
			))}

			<div className="mt-5.5 border-t border-white/9 pt-5 font-sans text-[11.5px] leading-[1.6] font-light text-white/35">
				A aula é marcada como concluída quando você assiste 90% do vídeo.
			</div>
		</div>
	);
}

export { LessonSidebar };
