import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { permissionSchema } from '@/features/admin/schemas/role-detail.schema';
import type { Permission } from '@/features/admin/model/role-detail';

async function getPermissions(): Promise<Permission[]> {
	const data = await apiFetch('/api/admin/permissions');
	return z.array(permissionSchema).parse(data);
}

export { getPermissions };
