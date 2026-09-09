import { apiFetch } from '@/lib/http/api-client';

async function assignUserRole(userId: string, roleId: string): Promise<void> {
	await apiFetch(`/api/users/${userId}/roles/${roleId}`, { method: 'POST' });
}

export { assignUserRole };
