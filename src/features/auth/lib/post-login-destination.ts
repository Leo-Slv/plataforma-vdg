import { appRoutes } from '@/lib/routes/app-routes';

/**
 * Where to send someone who just logged in. Until the e-mail is confirmed the
 * backend locks every course, so those users land on the confirmation screen
 * instead of a catalog where nothing opens. When the account state couldn't
 * be read (`undefined`) we fall back to the catalog, which carries its own
 * "confirm your e-mail" banner.
 */
function postLoginDestination(
	emailVerifiedAt: string | null | undefined,
): string {
	return emailVerifiedAt === null
		? appRoutes.auth.confirmEmail
		: appRoutes.catalog.index;
}

export { postLoginDestination };
