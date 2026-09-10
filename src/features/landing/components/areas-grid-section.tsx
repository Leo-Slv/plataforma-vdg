'use client';

import { useRef } from 'react';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import type { PublicAreaSummary } from '@/features/landing/model/public-catalog-summary';

const MAX_VISIBLE = 6;

type AreasGridSectionProps = {
	areas: PublicAreaSummary[];
};

function AreaCard({
	area,
	index,
	className,
}: {
	area: PublicAreaSummary;
	index: number;
	className?: string;
}) {
	return (
		<div
			className={`flex flex-col gap-3.5 rounded-lg border border-foreground/8 bg-canvas-alt p-5 ${className ?? ''}`}
		>
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
	);
}

function AreasGridSection({ areas }: AreasGridSectionProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const isCarousel = areas.length > MAX_VISIBLE;

	function scrollByCard(direction: 1 | -1) {
		const track = trackRef.current;
		if (!track) return;

		const card = track.firstElementChild as HTMLElement | null;
		const cardWidth = card?.offsetWidth ?? track.clientWidth;
		track.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
	}

	return (
		<section className="border-t border-foreground/8 bg-canvas-alt px-5 py-11 sm:px-11 sm:py-22">
			<div className="flex items-baseline justify-between border-b border-foreground/8 pb-5">
				<h2 className="font-heading text-[26px] font-light">Áreas de ensino</h2>

				<div className="flex items-center gap-4.5">
					<Link
						href={appRoutes.catalog.index}
						className="text-[13px] text-[oklch(0.72_0.1_248)]"
					>
						Ver todas as áreas →
					</Link>

					{isCarousel ? (
						<div className="flex flex-none gap-2.5">
							<button
								type="button"
								aria-label="Área anterior"
								onClick={() => scrollByCard(-1)}
								className="flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-foreground/30 hover:text-foreground/90"
							>
								←
							</button>
							<button
								type="button"
								aria-label="Próxima área"
								onClick={() => scrollByCard(1)}
								className="flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-foreground/30 hover:text-foreground/90"
							>
								→
							</button>
						</div>
					) : null}
				</div>
			</div>

			{isCarousel ? (
				<div
					ref={trackRef}
					className="mt-7.5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
					style={{
						maskImage:
							'linear-gradient(to right, #000 0, #000 96%, transparent 100%)',
					}}
				>
					{areas.map((area, index) => (
						<AreaCard
							key={area.id}
							area={area}
							index={index}
							className="w-[45%] flex-none snap-start sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-5*1rem)/6)]"
						/>
					))}
				</div>
			) : (
				<div className="mt-7.5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
					{areas.map((area, index) => (
						<AreaCard key={area.id} area={area} index={index} />
					))}
				</div>
			)}
		</section>
	);
}

export { AreasGridSection };
