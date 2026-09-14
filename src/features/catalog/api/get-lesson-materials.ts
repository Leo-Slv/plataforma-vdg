import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { lessonMaterialSchema } from '@/features/catalog/schemas/lesson-material.schema';
import type { LessonMaterial } from '@/features/catalog/model/lesson-material';

async function getLessonMaterials(lessonId: string): Promise<LessonMaterial[]> {
	const data = await apiFetch(`/api/materials/lessons/${lessonId}`);
	return z.array(lessonMaterialSchema).parse(data);
}

export { getLessonMaterials };
