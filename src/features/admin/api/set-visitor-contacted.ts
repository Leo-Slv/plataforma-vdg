import { apiFetch } from '@/lib/http/api-client';
import { visitorSchema } from '@/features/admin/schemas/visitor.schema';
import type { Visitor } from '@/features/admin/model/visitor';

async function setVisitorContacted(
	visitorId: string,
	contacted: boolean,
): Promise<Visitor> {
	const data = await apiFetch(`/api/visitors/${visitorId}/contacted`, {
		method: 'PUT',
		body: { contacted },
	});
	return visitorSchema.parse(data);
}

export { setVisitorContacted };
