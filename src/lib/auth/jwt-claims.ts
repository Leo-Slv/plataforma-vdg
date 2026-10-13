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

const ADMIN_ROLE_NAME = 'Admin';

// The backend writes roles under the .NET `ClaimTypes.Role` URI (the JWT is
// built without the short-name outbound mapping), so that is the real key.
// The short `role` is accepted too in case that mapping is ever enabled.
const ROLE_CLAIM_KEYS = [
	'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
	'role',
] as const;

function claimIncludes(value: unknown, expected: string) {
	if (typeof value === 'string') {
		return value === expected;
	}
	if (Array.isArray(value)) {
		return value.includes(expected);
	}
	return false;
}

/**
 * True for the main administrator (the `Admin` role). The backend's policies
 * let this role through every permission check, so the UI mirrors that.
 */
function isAdmin(claims: Record<string, unknown> | null) {
	return ROLE_CLAIM_KEYS.some((key) =>
		claimIncludes(claims?.[key], ADMIN_ROLE_NAME),
	);
}

function hasPermission(
	claims: Record<string, unknown> | null,
	permission: string,
) {
	return isAdmin(claims) || claimIncludes(claims?.permission, permission);
}

export { decodeAccessTokenClaims, decodeJwtPayload, hasPermission, isAdmin };
