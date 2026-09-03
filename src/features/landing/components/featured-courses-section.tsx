import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { featuredCourses } from '@/features/landing/lib/landing-content';
import { FeaturedCourseCard } from '@/features/landing/components/featured-course-card';

function FeaturedCoursesSection() {
	return (
		<section className="px-5 pb-11 sm:px-11 sm:pb-22">
			<div className="flex items-baseline justify-between border-b border-white/8 pb-3.5 font-heading text-[13px] tracking-[0.16em] text-white/40 uppercase sm:hidden">
				Comece por aqui
			</div>
			<div className="hidden items-baseline justify-between border-b border-white/8 pb-5 sm:flex">
				<h2 className="font-heading text-[26px] font-light">Comece por aqui</h2>
				<Link
					href={appRoutes.catalog.index}
					className="text-[13px] text-[oklch(0.72_0.1_248)]"
				>
					Todos os cursos →
				</Link>
			</div>

			<div className="mt-4.5 grid grid-cols-1 gap-3.5 sm:mt-7.5 sm:grid-cols-3 sm:gap-7">
				{featuredCourses.map((course) => (
					<FeaturedCourseCard key={course.slug} course={course} />
				))}
			</div>
		</section>
	);
}

export { FeaturedCoursesSection };
