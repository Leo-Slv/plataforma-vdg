import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { accessRequestSchema } from '@/features/catalog/schemas/access-request.schema';
import type { AccessRequest } from '@/features/catalog/model/access-request';

async function getMyAccessRequests(): Promise<AccessRequest[]> {
	const data = await apiFetch('/api/access/requests/mine');
	return z.array(accessRequestSchema).parse(data);
}

export { getMyAccessRequests };
