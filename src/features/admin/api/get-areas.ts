import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { areaSchema } from '@/features/admin/schemas/area.schema';
import type { Area } from '@/features/admin/model/area';

async function getAreas(): Promise<Area[]> {
	const data = await apiFetch('/api/areas');
	return z.array(areaSchema).parse(data);
}

export { getAreas };
