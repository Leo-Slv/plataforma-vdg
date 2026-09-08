import { appRoutes } from '@/lib/routes/app-routes';
import { clearAccessToken } from '@/lib/auth/access-token';

async function performLogout(logout: () => Promise<unknown>) {
	try {
		await logout();
	} catch {
		// Best-effort: the refresh-token cookie may already be gone, or the
		// request may fail outright, but the user must still be able to log
		// out locally either way.
	}

	clearAccessToken();
	// Full page navigation, not router.push: guarantees every cached query
	// and in-memory auth state resets, not just the URL.
	window.location.href = appRoutes.auth.login;
}

export { performLogout };
