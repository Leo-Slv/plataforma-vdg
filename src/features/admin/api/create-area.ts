import { apiFetch } from '@/lib/http/api-client';
import { areaSchema } from '@/features/admin/schemas/area.schema';
import type { Area } from '@/features/admin/model/area';
import type { AccentColorValue } from '@/features/admin/lib/accent-color';

type CreateAreaPayload = {
	name: string;
	slug: string;
	description: string;
	displayOrder: number;
	accentColor: AccentColorValue;
};

async function createArea(payload: CreateAreaPayload): Promise<Area> {
	const data = await apiFetch('/api/areas', {
		method: 'POST',
		body: payload,
	});
	return areaSchema.parse(data);
}

export { createArea };
export type { CreateAreaPayload };
