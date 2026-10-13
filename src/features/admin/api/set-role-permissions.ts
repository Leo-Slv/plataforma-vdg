import { apiFetch } from '@/lib/http/api-client';
import { roleDetailSchema } from '@/features/admin/schemas/role-detail.schema';
import type { RoleDetail } from '@/features/admin/model/role-detail';

async function setRolePermissions(
	roleId: string,
	permissionKeys: string[],
): Promise<RoleDetail> {
	const data = await apiFetch(`/api/admin/roles/${roleId}/permissions`, {
		method: 'PUT',
		body: { permissionKeys },
	});
	return roleDetailSchema.parse(data);
}

export { setRolePermissions };
