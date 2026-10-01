import { cn } from '@/lib/utils';

type FirstVisitHeroProps = {
	// Mockup 1b replaces the heading/lede with the thank-you state on
	// mobile; on desktop the hero always stays next to the card.
	hideIntroOnMobile?: boolean;
};

function FirstVisitHero({ hideIntroOnMobile = false }: FirstVisitHeroProps) {
	return (
		<div className="relative flex flex-col">
			<div className="self-start rounded-full border border-[oklch(0.45_0.07_248)] px-3.25 py-2 font-heading text-[10px] leading-none tracking-[0.2em] text-[oklch(0.72_0.1_248)] uppercase lg:px-4 lg:py-2.25 lg:text-[11px]">
				Primeira vez aqui
			</div>
			<div className={cn(hideIntroOnMobile && 'hidden lg:block')}>
				<h1 className="mt-5.5 font-heading text-[40px] leading-[1.06] font-extralight tracking-[-0.01em] lg:mt-7 lg:text-[68px] lg:leading-[1.04] lg:tracking-[-0.015em]">
					Que bom ter <br className="hidden lg:block" />
					você <span className="font-normal">com a gente.</span>
				</h1>
				<p className="mt-4 max-w-110 text-[15px] leading-[1.6] font-light text-pretty text-foreground/60 lg:mt-6.5 lg:leading-[1.65]">
					Deixe seus dados para nossa equipe de recepção entrar em contato nos
					próximos dias.
				</p>
			</div>
		</div>
	);
}

export { FirstVisitHero };
