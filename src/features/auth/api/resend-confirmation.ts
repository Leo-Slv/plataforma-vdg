import { apiFetch } from '@/lib/http/api-client';

async function resendConfirmation(): Promise<void> {
	await apiFetch('/api/auth/resend-confirmation', {
		method: 'POST',
	});
}

export { resendConfirmation };
