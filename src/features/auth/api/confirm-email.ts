import { apiFetch } from '@/lib/http/api-client';

async function confirmEmail(token: string): Promise<void> {
	await apiFetch('/api/auth/confirm-email', {
		method: 'POST',
		body: { token },
	});
}

export { confirmEmail };
