import { apiFetch } from '@/lib/http/api-client';
import { areaSchema } from '@/features/admin/schemas/area.schema';
import type { Area } from '@/features/admin/model/area';
import type { AccentColorValue } from '@/features/admin/lib/accent-color';

type UpdateAreaPayload = {
	name: string;
	slug: string;
	description: string;
	displayOrder: number;
	active: boolean;
	accentColor: AccentColorValue;
};

async function updateArea(
	areaId: string,
	payload: UpdateAreaPayload,
): Promise<Area> {
	const data = await apiFetch(`/api/areas/${areaId}`, {
		method: 'PUT',
		body: payload,
	});
	return areaSchema.parse(data);
}

export { updateArea };
export type { UpdateAreaPayload };
