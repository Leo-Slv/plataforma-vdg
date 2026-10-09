import { apiFetch } from '@/lib/http/api-client';
import { pagedVisitorsSchema } from '@/features/admin/schemas/visitor.schema';
import type {
	PagedVisitors,
	VisitorContactFilter,
} from '@/features/admin/model/visitor';

async function getVisitors(
	page: number,
	pageSize: number,
	search: string,
	filter: VisitorContactFilter,
): Promise<PagedVisitors> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	if (search.trim().length > 0) {
		params.set('search', search.trim());
	}
	if (filter !== 'all') {
		params.set('contacted', filter === 'contacted' ? 'true' : 'false');
	}

	const data = await apiFetch(`/api/visitors?${params.toString()}`);
	return pagedVisitorsSchema.parse(data);
}

export { getVisitors };
