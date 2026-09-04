import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import type { CourseModule } from '@/features/catalog/model/course-details';

type ModuleCardProps = {
	module: CourseModule;
	position: number;
	slug: string;
};

function ModuleCard({ module, position, slug }: ModuleCardProps) {
	const label = String(position).padStart(2, '0');
	const lessonCount = module.lessons.length;
	const lessonWord = lessonCount === 1 ? 'aula' : 'aulas';
	const firstLessonId = module.lessons[0]?.id;

	const content = (
		<>
			<div
				className="aspect-video"
				style={{
					backgroundImage:
						'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
				}}
			/>
			<div className="p-5">
				<div className="font-heading text-[10px] tracking-[0.14em] text-[oklch(0.75_0.1_248)] uppercase">
					Módulo {label} · {lessonCount} {lessonWord}
				</div>
				<h3 className="mt-3 font-heading text-[18px] font-normal">
					{module.title}
				</h3>
				<p className="mt-2.25 text-[13px] leading-[1.5] font-light text-white/45">
					{module.description}
				</p>
			</div>
		</>
	);

	if (!firstLessonId) {
		return (
			<div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#101012] text-[#f2f2f0]">
				{content}
			</div>
		);
	}

	return (
		<Link
			href={appRoutes.courses.lesson(slug, firstLessonId)}
			className="block overflow-hidden rounded-[10px] border border-white/10 bg-[#101012] text-[#f2f2f0]"
		>
			{content}
		</Link>
	);
}

export { ModuleCard };
