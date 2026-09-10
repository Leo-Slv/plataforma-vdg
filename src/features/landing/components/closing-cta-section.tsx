import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { closingCtaContent } from '@/features/landing/lib/landing-content';

function ClosingCtaSection() {
	return (
		<section className="border-t border-foreground/8 px-5 py-13 text-center sm:py-24">
			<h2 className="font-heading text-[34px] leading-[1.1] font-extralight tracking-tight text-foreground sm:text-[46px]">
				{closingCtaContent.headline}
			</h2>
			<p className="mx-auto mt-4.5 max-w-[480px] text-[15px] leading-[1.65] font-light text-foreground/55 sm:text-[15.5px]">
				{closingCtaContent.subtext}
			</p>
			<div className="mt-8.5 flex flex-col justify-center gap-2.5 sm:flex-row sm:gap-3.5">
				<Link
					href={appRoutes.auth.register}
					className="rounded-full bg-foreground px-7.5 py-4 text-[14px] text-background"
				>
					{closingCtaContent.primaryCtaLabel}
				</Link>
				<Link
					href={appRoutes.catalog.index}
					className="rounded-full border border-foreground/20 px-7.5 py-4 text-[14px] text-foreground"
				>
					{closingCtaContent.secondaryCtaLabel}
				</Link>
			</div>
		</section>
	);
}

export { ClosingCtaSection };
