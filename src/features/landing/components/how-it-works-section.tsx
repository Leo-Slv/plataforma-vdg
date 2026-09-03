import {
	howItWorksIntro,
	howItWorksSteps,
} from '@/features/landing/lib/landing-content';

function HowItWorksSection() {
	return (
		<section className="bg-[#f4f4f2] px-5 py-11 text-[#0a0a0b] sm:px-11 sm:py-19">
			<div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-17.5">
				<div>
					<h2 className="font-heading text-[32px] leading-[1.1] font-extralight tracking-tight sm:text-[44px]">
						Como a escola funciona
					</h2>
					<p className="mt-4 text-[15px] leading-[1.7] font-light text-pretty text-black/60 sm:mt-5 sm:text-base">
						{howItWorksIntro}
					</p>
				</div>

				<div className="flex flex-col">
					{howItWorksSteps.map((item, index) => (
						<div
							key={item.step}
							className={`flex gap-5 border-t border-black/12 py-5.5 ${
								index === howItWorksSteps.length - 1 ? 'border-b' : ''
							}`}
						>
							<span className="w-6.5 font-heading text-[15px] font-light text-black/35">
								{item.step}
							</span>
							<div>
								<div className="font-heading text-base">{item.title}</div>
								<div className="mt-1 text-[13.5px] leading-[1.6] font-light text-black/55">
									{item.description}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export { HowItWorksSection };
