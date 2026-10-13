import { apiFetch } from '@/lib/http/api-client';
import { roleDetailSchema } from '@/features/admin/schemas/role-detail.schema';
import type { RoleDetail } from '@/features/admin/model/role-detail';

type UpdateRolePayload = {
	name: string;
	description: string;
	active: boolean;
};

async function updateRole(
	roleId: string,
	payload: UpdateRolePayload,
): Promise<RoleDetail> {
	const data = await apiFetch(`/api/admin/roles/${roleId}`, {
		method: 'PUT',
		body: payload,
	});
	return roleDetailSchema.parse(data);
}

export { updateRole };
export type { UpdateRolePayload };
