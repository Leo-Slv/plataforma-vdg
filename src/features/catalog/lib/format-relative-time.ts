const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Matches the mockup's own labels ("há 2h", "ontem") — no library, no
 * existing relative-time helper in this codebase to reuse.
 */
function formatRelativeTime(iso: string, now: Date): string {
	const diffMs = now.getTime() - new Date(iso).getTime();

	if (diffMs < HOUR_MS) {
		const minutes = Math.max(1, Math.floor(diffMs / MINUTE_MS));
		return `há ${minutes}min`;
	}

	if (diffMs < DAY_MS) {
		const hours = Math.floor(diffMs / HOUR_MS);
		return `há ${hours}h`;
	}

	if (diffMs < 2 * DAY_MS) {
		return 'ontem';
	}

	return new Date(iso).toLocaleDateString('pt-BR');
}

export { formatRelativeTime };
