import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';

type EmailVerificationBannerProps = {
	/** True only once the current user is known and has not confirmed the e-mail. */
	unverified: boolean;
};

/**
 * Until the e-mail is confirmed the backend locks every course (free ones
 * too), so the app says why and points to the way out instead of leaving a
 * silently locked catalog.
 */
function EmailVerificationBanner({ unverified }: EmailVerificationBannerProps) {
	if (!unverified) {
		return null;
	}

	return (
		<div
			role="status"
			className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 bg-surface px-5 py-3 sm:px-10"
		>
			<p className="font-sans text-[13px] font-light text-foreground/70">
				Confirme seu e-mail para liberar as aulas — até lá, todos os cursos
				ficam bloqueados.
			</p>
			<Link
				href={appRoutes.auth.confirmEmail}
				className="rounded-full bg-foreground px-4.5 py-2 font-sans text-[12.5px] text-background"
			>
				Confirmar e-mail
			</Link>
		</div>
	);
}

export { EmailVerificationBanner };
