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
		<section className="border-t border-white/8 bg-[#0d0d0f] px-5 py-11 sm:px-11 sm:py-22">
			<div className="flex items-center justify-between gap-4">
				<h2 className="font-heading text-[26px] font-light text-[#f2f2f0]">
					O que os alunos dizem
				</h2>

				{testimonials.length > 1 ? (
					<div className="flex flex-none gap-2.5">
						<button
							type="button"
							aria-label="Depoimento anterior"
							onClick={() => scrollByCard(-1)}
							className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:text-white/90"
						>
							←
						</button>
						<button
							type="button"
							aria-label="Próximo depoimento"
							onClick={() => scrollByCard(1)}
							className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:text-white/90"
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
						className="flex w-[86%] flex-none snap-start flex-col gap-4.5 rounded-xl bg-[#141416] p-7.5 sm:w-[calc((100%-3.5rem)/3)]"
					>
						<span
							aria-hidden
							className="font-serif text-[40px] leading-none text-white/20"
						>
							&quot;
						</span>
						<p className="text-[14.5px] leading-[1.65] font-light text-white/70">
							{testimonial.quote}
						</p>
						<div className="mt-1.5 flex items-center gap-2.5">
							<AvatarImage
								src={testimonial.avatarUrl}
								fallbackSrc="/brand/viver-da-graca-mark.png"
								alt=""
								className="size-8 rounded-full object-cover"
							/>
							<div className="font-sans text-[12.5px] text-[#f2f2f0]">
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
