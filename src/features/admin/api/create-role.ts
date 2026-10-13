import { apiFetch } from '@/lib/http/api-client';
import { roleDetailSchema } from '@/features/admin/schemas/role-detail.schema';
import type { RoleDetail } from '@/features/admin/model/role-detail';

type CreateRolePayload = { name: string; description: string };

async function createRole(payload: CreateRolePayload): Promise<RoleDetail> {
	const data = await apiFetch('/api/admin/roles', {
		method: 'POST',
		body: payload,
	});
	return roleDetailSchema.parse(data);
}

export { createRole };
export type { CreateRolePayload };
