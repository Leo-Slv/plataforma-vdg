import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseCardState } from '@/features/catalog/lib/my-courses';

type MyCoursesHeroProps = {
	course: CourseCatalogItem;
	slug: string;
	state: Extract<CourseCardState, { kind: 'active' }>;
};

function MyCoursesHero({ course, slug, state }: MyCoursesHeroProps) {
	return (
		<div className="overflow-hidden rounded-[10px] border border-white/12 bg-[#101012] sm:flex">
			<div
				className="aspect-video sm:aspect-auto sm:w-[300px] sm:flex-none"
				style={{
					backgroundImage:
						'repeating-linear-gradient(135deg, #17171a 0 8px, #1e1e22 8px 16px)',
				}}
			/>
			<div className="flex-1 p-7.5">
				<div className="font-heading text-[10.5px] tracking-[0.16em] text-[oklch(0.75_0.1_248)] uppercase">
					Em andamento
				</div>
				<h2 className="mt-3.5 font-heading text-[28px] leading-[1.2] font-light">
					{course.title}
				</h2>
				<div className="mt-2.5 font-sans text-[13.5px] font-light text-white/50">
					Módulo {String(state.modulePosition).padStart(2, '0')} ·{' '}
					{state.lessonTitle}
				</div>
				<div className="mt-6 flex items-center gap-4">
					<span className="block h-1 flex-1 overflow-hidden rounded-full bg-white/13">
						<span
							className="block h-1 bg-[oklch(0.72_0.1_248)]"
							style={{ width: `${state.percent}%` }}
						/>
					</span>
					<span className="font-sans text-[12.5px] font-light text-white/55">
						{Math.round(state.percent)}%
					</span>
				</div>
				{state.lessonId ? (
					<Link
						href={appRoutes.courses.lesson(slug, state.lessonId)}
						className="mt-6.5 inline-block rounded-full bg-[#f4f4f2] px-7 py-3.75 font-sans text-[14px] text-[#0a0a0b]"
					>
						Retomar aula
					</Link>
				) : null}
			</div>
		</div>
	);
}

export { MyCoursesHero };
