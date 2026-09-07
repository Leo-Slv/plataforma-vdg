import Link from 'next/link';

import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes/app-routes';
import { sortCoursesByDisplayOrder } from '@/features/admin/lib/sort-courses';
import { formatCurrencyBrl } from '@/features/admin/lib/format-currency-brl';
import type { Course } from '@/features/admin/model/course';
import type { Area } from '@/features/admin/model/area';

type CoursesTableProps = {
	courses: Course[];
	areas: Area[];
};

const COLUMNS = 'grid-cols-[2.2fr_1.1fr_0.9fr_0.9fr_0.6fr]';

function pricingLabel(course: Course) {
	if (course.pricingModel === 'Free') {
		return 'Gratuito';
	}
	if (course.pricingModel === 'EnrollmentControlled') {
		return 'Por inscrição';
	}
	return course.priceAmount !== null
		? formatCurrencyBrl(course.priceAmount)
		: '—';
}

function areaNames(course: Course, areas: Area[]) {
	const names = course.areaIds
		.map((areaId) => areas.find((area) => area.id === areaId)?.name)
		.filter((name): name is string => Boolean(name));

	return names.length > 0 ? names.join(', ') : '—';
}

function CoursesTable({ courses, areas }: CoursesTableProps) {
	if (courses.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-white/45">
				Nenhum curso cadastrado.
			</p>
		);
	}

	const sorted = sortCoursesByDisplayOrder(courses);

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-white/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase',
					COLUMNS,
				)}
			>
				<span>Curso</span>
				<span>Áreas</span>
				<span>Cobrança</span>
				<span>Status</span>
				<span>Ordem</span>
			</div>

			{sorted.map((course) => (
				<Link
					key={course.id}
					href={appRoutes.admin.courseEdit(course.id)}
					className={cn(
						'grid items-center gap-4 border-b border-white/7 py-4.5 font-sans text-[13.5px] text-white/75 hover:bg-white/3',
						COLUMNS,
					)}
				>
					<div>
						<div className="font-heading text-[15px] text-[#f2f2f0]">
							{course.title}
						</div>
						<div className="mt-1.5 font-mono text-[10.5px] text-white/30">
							/{course.slug}
						</div>
					</div>
					<span className="text-white/55">{areaNames(course, areas)}</span>
					<span>{pricingLabel(course)}</span>
					<span
						className={cn(
							course.published ? 'text-[oklch(0.75_0.1_248)]' : 'text-white/45',
						)}
					>
						{course.published ? 'Publicado' : 'Rascunho'}
					</span>
					<span className="text-white/40">{course.displayOrder}</span>
				</Link>
			))}
		</div>
	);
}

export { CoursesTable };
