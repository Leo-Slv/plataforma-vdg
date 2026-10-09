import { buildApiUrl } from '@/lib/http/build-api-url';
import { clearAccessToken, setAccessToken } from '@/lib/auth/access-token';

/**
 * Endpoints where a 401 means "wrong credentials / bad token", not "your
 * session expired", so a silent refresh makes no sense (and could loop).
 */
const NO_REFRESH_PATHS = [
	'/api/auth/login',
	'/api/auth/register',
	'/api/auth/refresh-token',
	'/api/auth/logout',
	'/api/auth/forgot-password',
	'/api/auth/reset-password',
];

function isRefreshablePath(path: string): boolean {
	const normalized = path.split('?')[0];
	return !NO_REFRESH_PATHS.includes(normalized);
}

let inFlight: Promise<boolean> | null = null;

/**
 * Exchanges the httpOnly refresh-token cookie for a new access token.
 * Concurrent callers share one request (the backend rotates refresh tokens,
 * so two parallel refreshes would invalidate each other).
 */
function refreshSession(): Promise<boolean> {
	inFlight ??= (async () => {
		try {
			const response = await fetch(buildApiUrl('/api/auth/refresh-token'), {
				method: 'POST',
				credentials: 'include',
				cache: 'no-store',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: '{}',
			});

			if (!response.ok) {
				return false;
			}

			const data = (await response.json()) as {
				token?: { accessToken?: unknown };
			};
			const accessToken = data?.token?.accessToken;

			if (typeof accessToken !== 'string' || accessToken.length === 0) {
				return false;
			}

			setAccessToken(accessToken);
			return true;
		} catch {
			return false;
		} finally {
			inFlight = null;
		}
	})();

	return inFlight;
}

/** Called when the refresh failed: the user really is logged out. */
function endExpiredSession(loginPath: string) {
	clearAccessToken();

	if (typeof window !== 'undefined' && window.location.pathname !== loginPath) {
		window.location.assign(loginPath);
	}
}

export { isRefreshablePath, refreshSession, endExpiredSession };
