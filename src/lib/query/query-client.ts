import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/http/api-error';

const MAX_RETRIES = 1;

/**
 * Retry only failures that can plausibly fix themselves (network, timeout,
 * 5xx). A 4xx — 403 for a locked course, 404, 409 — is the server's answer,
 * not a glitch, so retrying just keeps the screen on "Carregando…" for
 * nothing.
 */
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
	if (failureCount >= MAX_RETRIES) {
		return false;
	}

	if (isApiError(error) && error.status >= 400 && error.status < 500) {
		return error.status === 408;
	}

	return true;
}

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				retry: shouldRetryQuery,
			},
		},
	});
}

export { createQueryClient, shouldRetryQuery };
