import { apiFetch } from '@/lib/http/api-client';
import { courseCatalogSchema } from '@/features/catalog/schemas/course-catalog.schema';
import type { CourseCatalog } from '@/features/catalog/model/course-catalog';

async function getCourseCatalog(): Promise<CourseCatalog> {
	const data = await apiFetch('/api/courses/available');
	return courseCatalogSchema.parse(data);
}

export { getCourseCatalog };
