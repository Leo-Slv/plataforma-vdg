'use client';

import { useRef } from 'react';

import { AvatarImage } from '@/components/avatar-image';
import type { Testimonial } from '@/features/landing/model/testimonial';

type TestimonialsSectionProps = {
	testimonials: Testimonial[];
};

function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
	const trackRef = useRef<HTMLDivElement>(null);

	function scrollByCard(direction: 1 | -1) {
		const track = trackRef.current;
		if (!track) return;

		const card = track.firstElementChild as HTMLElement | null;
		const cardWidth = card?.offsetWidth ?? track.clientWidth;
		track.scrollBy({ left: direction * (cardWidth + 28), behavior: 'smooth' });
	}

	return (
		<section className="border-t border-foreground/8 bg-canvas-alt px-5 py-11 sm:px-11 sm:py-22">
			<div className="flex items-center justify-between gap-4">
				<h2 className="font-heading text-[26px] font-light text-foreground">
					O que os alunos dizem
				</h2>

				{testimonials.length > 1 ? (
					<div className="flex flex-none gap-2.5">
						<button
							type="button"
							aria-label="Depoimento anterior"
							onClick={() => scrollByCard(-1)}
							className="flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-foreground/30 hover:text-foreground/90"
						>
							←
						</button>
						<button
							type="button"
							aria-label="Próximo depoimento"
							onClick={() => scrollByCard(1)}
							className="flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/60 transition-colors hover:border-foreground/30 hover:text-foreground/90"
						>
							→
						</button>
					</div>
				) : null}
			</div>

			<div
				ref={trackRef}
				className="mt-7 flex snap-x snap-mandatory gap-4.5 overflow-x-auto pb-2 sm:mt-9 sm:gap-7"
				style={{
					maskImage:
						'linear-gradient(to right, #000 0, #000 96%, transparent 100%)',
				}}
			>
				{testimonials.map((testimonial) => (
					<div
						key={testimonial.id}
						className="flex w-[86%] flex-none snap-start flex-col gap-4.5 rounded-xl bg-surface-2 p-7.5 sm:w-[calc((100%-3.5rem)/3)]"
					>
						<span
							aria-hidden
							className="font-serif text-[40px] leading-none text-foreground/20"
						>
							&quot;
						</span>
						<p className="text-[14.5px] leading-[1.65] font-light text-foreground/70">
							{testimonial.quote}
						</p>
						<div className="mt-1.5 flex items-center gap-2.5">
							<AvatarImage
								src={testimonial.avatarUrl}
								fallbackSrc="/brand/viver-da-graca-mark.png"
								alt=""
								className="size-8 rounded-full object-cover"
							/>
							<div className="font-sans text-[12.5px] text-foreground">
								{testimonial.authorName}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export { TestimonialsSection };
