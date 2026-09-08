import { apiFetch } from '@/lib/http/api-client';

async function logoutUser(): Promise<void> {
	await apiFetch<null>('/api/auth/logout', { method: 'POST' });
}

export { logoutUser };
