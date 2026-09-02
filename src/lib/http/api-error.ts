type ApiErrorPayload = {
	statusCode: number;
	error: string;
	message: string;
	traceId: string;
	correlationId: string;
	timestamp: string;
	details: readonly string[];
};

class ApiError extends Error {
	readonly status: number;
	readonly title: string;
	readonly details: readonly string[];
	readonly traceId: string | null;
	readonly correlationId: string | null;

	constructor(
		message: string,
		status: number,
		options?: {
			title?: string;
			details?: readonly string[];
			traceId?: string | null;
			correlationId?: string | null;
		},
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.title = options?.title ?? 'Error';
		this.details = options?.details ?? [];
		this.traceId = options?.traceId ?? null;
		this.correlationId = options?.correlationId ?? null;
	}
}

function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export type { ApiErrorPayload };
export { ApiError, isApiError };
