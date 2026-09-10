import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import type { PublicAreaSummary } from '@/features/landing/model/public-catalog-summary';

type AreasGridSectionProps = {
	areas: PublicAreaSummary[];
};

function AreasGridSection({ areas }: AreasGridSectionProps) {
	return (
		<section className="border-t border-foreground/8 bg-canvas-alt px-5 py-11 sm:px-11 sm:py-22">
			<div className="flex items-baseline justify-between border-b border-foreground/8 pb-5">
				<h2 className="font-heading text-[26px] font-light">Áreas de ensino</h2>
				<Link
					href={appRoutes.catalog.index}
					className="text-[13px] text-[oklch(0.72_0.1_248)]"
				>
					Ver todas as áreas →
				</Link>
			</div>

			<div className="mt-7.5 grid grid-cols-1 gap-px overflow-hidden bg-foreground/8 sm:grid-cols-3 lg:grid-cols-6">
				{areas.map((area, index) => (
					<div key={area.id} className="flex flex-col gap-3.5 bg-canvas-alt p-5">
						<span className="font-heading text-[30px] font-extralight text-foreground/25">
							{String(index + 1).padStart(2, '0')}
						</span>
						<div>
							<div className="font-heading text-[15px] text-foreground">
								{area.name}
							</div>
							<div className="mt-1.5 text-xs font-light text-foreground/40">
								{area.publishedCourseCount === 1
									? '1 curso'
									: `${area.publishedCourseCount} cursos`}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export { AreasGridSection };
