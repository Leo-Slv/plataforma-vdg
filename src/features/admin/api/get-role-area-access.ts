import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { areaAccessSchema } from '@/features/admin/schemas/area-access.schema';
import type { AreaAccess } from '@/features/admin/model/area-access';

async function getRoleAreaAccess(roleId: string): Promise<AreaAccess[]> {
	const data = await apiFetch(`/api/access/role-area/${roleId}`);
	return z.array(areaAccessSchema).parse(data);
}

export { getRoleAreaAccess };
