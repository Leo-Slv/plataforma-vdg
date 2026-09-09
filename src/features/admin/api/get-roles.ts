import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { roleSchema } from '@/features/admin/schemas/role.schema';
import type { Role } from '@/features/admin/model/role';

async function getRoles(): Promise<Role[]> {
	const data = await apiFetch('/api/roles');
	return z.array(roleSchema).parse(data);
}

export { getRoles };
