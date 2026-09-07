import { apiFetch } from '@/lib/http/api-client';
import { areaSchema } from '@/features/admin/schemas/area.schema';
import type { Area } from '@/features/admin/model/area';

async function getArea(areaId: string): Promise<Area> {
	const data = await apiFetch(`/api/areas/${areaId}`);
	return areaSchema.parse(data);
}

export { getArea };
