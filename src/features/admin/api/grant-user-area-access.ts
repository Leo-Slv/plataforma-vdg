import { apiFetch } from '@/lib/http/api-client';
import { areaAccessSchema } from '@/features/admin/schemas/area-access.schema';
import type { AreaAccess } from '@/features/admin/model/area-access';

async function grantUserAreaAccess(
	userId: string,
	areaId: string,
): Promise<AreaAccess> {
	const data = await apiFetch('/api/access/user-area', {
		method: 'POST',
		body: { userId, areaId, canView: true, canManage: false },
	});
	return areaAccessSchema.parse(data);
}

export { grantUserAreaAccess };
