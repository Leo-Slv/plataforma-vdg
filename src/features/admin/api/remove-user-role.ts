import { apiFetch } from '@/lib/http/api-client';

async function removeUserRole(userId: string, roleId: string): Promise<void> {
	await apiFetch(`/api/users/${userId}/roles/${roleId}`, { method: 'DELETE' });
}

export { removeUserRole };
