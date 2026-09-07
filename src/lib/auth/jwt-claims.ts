import { getAccessToken } from '@/lib/auth/access-token';

function base64UrlDecode(segment: string) {
	const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalized.padEnd(
		normalized.length + ((4 - (normalized.length % 4)) % 4),
		'=',
	);
	return atob(padded);
}

/**
 * Decodes a JWT's payload for UI gating only — no signature verification.
 * The backend's own policies remain the real authorization boundary (see
 * CLAUDE.md, "Auth"). Returns `null` for anything malformed rather than
 * throwing, so callers can treat "no claims" and "bad token" the same way.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
	const segments = token.split('.');
	if (segments.length !== 3) {
		return null;
	}

	try {
		const payload = JSON.parse(base64UrlDecode(segments[1])) as unknown;
		return typeof payload === 'object' && payload !== null
			? (payload as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

function decodeAccessTokenClaims(): Record<string, unknown> | null {
	const token = getAccessToken();
	return token ? decodeJwtPayload(token) : null;
}

function hasPermission(
	claims: Record<string, unknown> | null,
	permission: string,
) {
	const value = claims?.permission;
	if (typeof value === 'string') {
		return value === permission;
	}
	if (Array.isArray(value)) {
		return value.includes(permission);
	}
	return false;
}

export { decodeAccessTokenClaims, decodeJwtPayload, hasPermission };
