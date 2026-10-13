import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { roleDetailSchema } from '@/features/admin/schemas/role-detail.schema';
import type { RoleDetail } from '@/features/admin/model/role-detail';

async function getRoleDetails(): Promise<RoleDetail[]> {
	const data = await apiFetch('/api/admin/roles');
	return z.array(roleDetailSchema).parse(data);
}

export { getRoleDetails };
