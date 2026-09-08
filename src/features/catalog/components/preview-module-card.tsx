import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { formatDuration } from '@/features/catalog/lib/format-duration';
import type { CourseModule } from '@/features/catalog/model/course-details';

type PreviewModuleCardProps = {
	module: CourseModule;
	position: number;
	slug: string;
};

function PreviewModuleCard({ module, position, slug }: PreviewModuleCardProps) {
	const label = String(position).padStart(2, '0');
	const lessonCount = module.lessons.length;
	const lessonWord = lessonCount === 1 ? 'aula' : 'aulas';
	const freeLessons = module.lessons.filter((lesson) => lesson.freePreview);
	const knownDurationSeconds = freeLessons.reduce(
		(total, lesson) => total + (lesson.durationSeconds ?? 0),
		0,
	);
	const hasFreeLesson = freeLessons.length > 0;
	const firstFreeLessonId = freeLessons[0]?.id;

	return (
		<div
			className={cn(
				'overflow-hidden rounded-[10px] border border-white/10 bg-[#101012] text-[#f2f2f0]',
				!hasFreeLesson && 'opacity-60',
			)}
		>
			<div
				className="aspect-video"
				style={{
					backgroundImage:
						'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
				}}
			/>
			<div className="p-5">
				<div
					className={cn(
						'font-heading text-[10px] tracking-[0.14em] uppercase',
						hasFreeLesson ? 'text-[oklch(0.75_0.1_248)]' : 'text-white/45',
					)}
				>
					Módulo {label} · {lessonCount} {lessonWord}
				</div>
				<h3 className="mt-3 font-heading text-[18px] font-normal">
					{module.title}
				</h3>
				<div className="mt-2.25 text-[13px] leading-[1.5] font-light text-white/45">
					{hasFreeLesson
						? `${formatDuration(knownDurationSeconds)} · ${freeLessons.length} ${freeLessons.length === 1 ? 'aula grátis' : 'aulas grátis'}`
						: 'Requer inscrição'}
				</div>

				{hasFreeLesson && firstFreeLessonId ? (
					<Link
						href={appRoutes.courses.lesson(slug, firstFreeLessonId)}
						className="mt-5 block rounded-full bg-[#f4f4f2] py-3.25 text-center font-sans text-[13px] text-[#0a0a0b]"
					>
						Assistir aula grátis
					</Link>
				) : (
					<span className="mt-5 block rounded-full border border-white/14 py-3.25 text-center font-sans text-[13px] text-white/50">
						Bloqueado
					</span>
				)}
			</div>
		</div>
	);
}

export { PreviewModuleCard };
