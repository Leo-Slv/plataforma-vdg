import Image from 'next/image';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import type { CourseCatalogItem } from '@/features/catalog/model/course-catalog';
import type { CourseCardState } from '@/features/catalog/lib/my-courses';

type OwnedCourseCardProps = {
	course: CourseCatalogItem;
	areaName: string | null;
	slug: string;
	state: CourseCardState | { kind: 'loading' };
};

function moduleCountLabel(moduleCount: number) {
	return moduleCount === 1 ? '1 módulo' : `${moduleCount} módulos`;
}

function OwnedCourseCard({
	course,
	areaName,
	slug,
	state,
}: OwnedCourseCardProps) {
	const percent =
		state.kind === 'completed'
			? 100
			: state.kind === 'active'
				? state.percent
				: null;
	const lessonId = state.kind === 'loading' ? undefined : state.lessonId;

	const content = (
		<>
			<div
				className="relative aspect-video overflow-hidden rounded-[10px]"
				style={{
					backgroundImage:
						'repeating-linear-gradient(135deg, var(--stripe-1) 0 8px, var(--stripe-2) 8px 16px)',
				}}
			>
				{state.kind === 'completed' ? (
					<span className="absolute right-2.5 bottom-2.25 rounded bg-background/85 px-1.75 py-1 font-sans text-[11.5px] font-medium whitespace-nowrap text-foreground">
						{moduleCountLabel(state.moduleCount)}
					</span>
				) : null}
				{percent !== null ? (
					<span className="absolute inset-x-0 bottom-0 block h-1 bg-foreground/28">
						<span
							className="block h-1 bg-[oklch(0.72_0.1_248)]"
							style={{ width: `${percent}%` }}
						/>
					</span>
				) : null}
			</div>
			<div className="mt-3.5 flex gap-3">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt=""
					aria-hidden
					width={36}
					height={36}
					className="size-9 flex-none rounded-full object-cover"
				/>
				<div className="min-w-0 flex-1">
					<div className="font-heading text-[15.5px]">{course.title}</div>
					{state.kind === 'completed' ? (
						<div className="mt-1.75 text-[12.5px] leading-[1.6] font-light text-foreground/45">
							{areaName ? `${areaName} · ` : ''}
							{moduleCountLabel(state.moduleCount)}
						</div>
					) : state.kind === 'active' ? (
						<div className="mt-1.75 text-[12.5px] leading-[1.6] font-light text-foreground/45">
							{areaName ? `${areaName} · ` : ''}
							Módulo {String(state.modulePosition).padStart(2, '0')}
							{state.lessonTitle ? (
								<>
									<br />
									{state.lessonTitle}
								</>
							) : null}
						</div>
					) : null}
					{state.kind === 'completed' ? (
						<div className="mt-2 font-sans text-xs font-normal text-[oklch(0.75_0.1_248)]">
							100% concluído · rever
						</div>
					) : state.kind === 'active' ? (
						<div className="mt-2 font-sans text-xs font-normal text-[oklch(0.75_0.1_248)]">
							{Math.round(state.percent)}% concluído ·{' '}
							{state.percent === 0 ? 'começar' : 'continuar'}
						</div>
					) : null}
				</div>
				<span aria-hidden className="px-0.5 pt-0.5 text-[15px] text-foreground/35">
					⋮
				</span>
			</div>
		</>
	);

	return (
		<div className="text-foreground">
			{lessonId ? (
				<Link href={appRoutes.courses.lesson(slug, lessonId)} className="block">
					{content}
				</Link>
			) : (
				content
			)}
			{state.kind === 'completed' ? (
				<Link
					href={appRoutes.testimonials.new(course.id)}
					className="mt-1.5 inline-block font-sans text-[11.5px] font-light text-foreground/40 underline underline-offset-2"
				>
					Deixar um depoimento
				</Link>
			) : null}
		</div>
	);
}

export { OwnedCourseCard };
