import Image from 'next/image';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { heroContent } from '@/features/landing/lib/landing-content';

function LandingHero() {
	return (
		<section className="relative overflow-hidden px-5 py-11 sm:px-11 sm:py-26">
			<Image
				src="/brand/viver-da-graca-mark.png"
				alt=""
				aria-hidden
				width={520}
				height={520}
				className="pointer-events-none absolute -top-10 -right-30 size-[300px] rounded-full object-cover opacity-13 sm:size-[520px] sm:opacity-14"
			/>

			<div className="relative max-w-[720px]">
				<div className="inline-flex items-center gap-2.5 rounded-full border border-[oklch(0.45_0.07_248)] px-4 py-2.5 font-heading text-[10px] tracking-[0.2em] text-[oklch(0.75_0.1_248)] uppercase sm:text-[11px]">
					{heroContent.eyebrow}
				</div>

				<h1 className="mt-4.5 font-heading text-[42px] leading-[1.06] font-extralight tracking-tight sm:mt-7 sm:text-[78px] sm:leading-[1.02]">
					<span className="sm:hidden">{heroContent.headlineMobile}</span>
					<span className="hidden sm:inline">
						{heroContent.headlineLines[0]}
						<br />
						{heroContent.headlineLines[1]}
						<br />
						<span className="font-normal">{heroContent.headlineLines[2]}</span>
					</span>
				</h1>

				<p className="mt-4.5 max-w-[470px] text-[15px] leading-[1.65] font-light text-pretty text-white/58 sm:mt-6.5 sm:text-[17px] sm:text-white/60">
					<span className="sm:hidden">{heroContent.subtextMobile}</span>
					<span className="hidden sm:inline">{heroContent.subtext}</span>
				</p>

				<div className="mt-7 flex flex-col gap-2.5 sm:mt-10 sm:flex-row sm:gap-3.5">
					<Link
						href={appRoutes.auth.register}
						className="rounded-full bg-[#f4f4f2] px-7.5 py-4.5 text-center text-[15px] text-[#0a0a0b] sm:py-4 sm:text-[14px]"
					>
						{heroContent.primaryCtaLabel}
					</Link>
					<Link
						href={appRoutes.catalog.index}
						className="rounded-full border border-white/20 px-7.5 py-4.5 text-center text-[15px] text-[#f2f2f0] sm:py-4 sm:text-[14px]"
					>
						{heroContent.secondaryCtaLabel}
					</Link>
				</div>

				<div className="mt-15 hidden gap-11 text-[13px] text-white/45 sm:flex">
					{heroContent.stats.map((stat) => (
						<div key={stat.label}>
							<div className="font-heading text-[34px] font-extralight text-[#f2f2f0]">
								{stat.value}
							</div>
							{stat.label}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export { LandingHero };
