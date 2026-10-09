import { apiFetch } from '@/lib/http/api-client';

type ResetPasswordPayload = {
	token: string;
	newPassword: string;
};

async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
	await apiFetch('/api/auth/reset-password', {
		method: 'POST',
		body: payload,
	});
}

export { resetPassword };
export type { ResetPasswordPayload };
