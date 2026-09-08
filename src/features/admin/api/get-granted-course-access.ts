import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { accessRequestSchema } from '@/features/admin/schemas/access-request.schema';
import type { AccessRequest } from '@/features/admin/model/access-request';

async function getGrantedCourseAccess(
	userId: string,
): Promise<AccessRequest[]> {
	const data = await apiFetch(`/api/access/requests/users/${userId}/granted`);
	return z.array(accessRequestSchema).parse(data);
}

export { getGrantedCourseAccess };
