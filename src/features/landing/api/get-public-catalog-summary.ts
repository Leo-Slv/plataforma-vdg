import { apiFetch } from '@/lib/http/api-client';
import { publicCatalogSummarySchema } from '@/features/landing/schemas/public-catalog-summary.schema';
import type { PublicCatalogSummary } from '@/features/landing/model/public-catalog-summary';

async function getPublicCatalogSummary(): Promise<PublicCatalogSummary> {
	const data = await apiFetch('/api/courses/public-summary');
	return publicCatalogSummarySchema.parse(data);
}

export { getPublicCatalogSummary };
