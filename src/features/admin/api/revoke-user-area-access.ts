import { apiFetch } from '@/lib/http/api-client';

async function revokeUserAreaAccess(
	userId: string,
	areaId: string,
): Promise<void> {
	await apiFetch(`/api/access/user-area/${userId}/${areaId}`, {
		method: 'DELETE',
	});
}

export { revokeUserAreaAccess };
