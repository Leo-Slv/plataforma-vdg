import Image from 'next/image';
import Link from 'next/link';

import { env } from '@/lib/env';
import { getSupportHref } from '@/lib/support-link';
import { footerContent } from '@/features/landing/lib/landing-content';

const configuredSupportHref = getSupportHref({
	email: env.supportEmail,
	whatsapp: env.supportWhatsapp,
});

type LandingFooterProps = {
	/** Overrides the NEXT_PUBLIC_SUPPORT_* link (used by tests). */
	supportHref?: string | null;
};

function LandingFooter({
	supportHref = configuredSupportHref,
}: LandingFooterProps) {
	return (
		<footer className="flex flex-col items-start gap-6 border-t border-foreground/8 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-11 sm:py-16">
			<div className="flex items-center gap-3.5">
				<Image
					src="/brand/viver-da-graca-mark.png"
					alt=""
					aria-hidden
					width={44}
					height={44}
					className="size-11 rounded-full object-cover"
				/>
				<div className="text-xs leading-[1.7] font-light text-foreground/40">
					{footerContent.orgName}
					<br />
					{footerContent.schoolName}
				</div>
			</div>

			<div className="text-xs leading-[1.7] font-light text-foreground/40 sm:text-right">
				<nav
					aria-label="Links do rodapé"
					className="flex flex-wrap gap-x-3 sm:justify-end"
				>
					{footerContent.links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="underline-offset-4 hover:text-foreground/70 hover:underline"
						>
							{link.label}
						</Link>
					))}
					{supportHref ? (
						<a
							href={supportHref}
							target={supportHref.startsWith('https:') ? '_blank' : undefined}
							rel={supportHref.startsWith('https:') ? 'noreferrer' : undefined}
							className="underline-offset-4 hover:text-foreground/70 hover:underline"
						>
							Suporte
						</a>
					) : null}
				</nav>
				© {footerContent.copyrightYear}
			</div>
		</footer>
	);
}

export { LandingFooter };
