import { apiFetch } from '@/lib/http/api-client';

type ChangePasswordPayload = {
	currentPassword: string;
	newPassword: string;
};

async function changePassword(payload: ChangePasswordPayload): Promise<void> {
	await apiFetch('/api/auth/change-password', {
		method: 'POST',
		body: payload,
	});
}

export { changePassword };
export type { ChangePasswordPayload };
