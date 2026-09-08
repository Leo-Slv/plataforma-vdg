import type { Testimonial } from '@/features/landing/model/testimonial';

type TestimonialsSectionProps = {
	testimonials: Testimonial[];
};

function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
	return (
		<section className="border-t border-white/8 bg-[#0d0d0f] px-5 py-11 sm:px-11 sm:py-22">
			<h2 className="font-heading text-[26px] font-light text-[#f2f2f0]">
				O que os alunos dizem
			</h2>

			<div className="mt-7 grid grid-cols-1 gap-4.5 sm:mt-9 sm:grid-cols-3 sm:gap-7">
				{testimonials.map((testimonial) => (
					<div
						key={testimonial.id}
						className="flex flex-col gap-4.5 rounded-xl bg-[#141416] p-7.5"
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
							{/* eslint-disable-next-line @next/next/no-img-element -- external, unconfigured media host */}
							<img
								src={testimonial.avatarUrl ?? '/brand/viver-da-graca-mark.png'}
								alt=""
								aria-hidden
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
