import { apiFetch } from '@/lib/http/api-client';

type RequestPasswordResetPayload = {
	email: string;
	captchaToken: string;
};

async function requestPasswordReset(
	payload: RequestPasswordResetPayload,
): Promise<void> {
	await apiFetch('/api/auth/forgot-password', {
		method: 'POST',
		body: payload,
	});
}

export { requestPasswordReset };
export type { RequestPasswordResetPayload };
