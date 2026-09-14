import { apiFetch } from '@/lib/http/api-client';
import { lessonMaterialSchema } from '@/features/admin/schemas/lesson-material.schema';
import type { LessonMaterial } from '@/features/admin/model/lesson-material';

type CreateLessonMaterialPayload = {
	title: string;
	fileName: string;
	contentType: string;
	storageProvider: 'S3';
	storageKey: string;
	sizeBytes: number;
};

async function createLessonMaterial(
	lessonId: string,
	payload: CreateLessonMaterialPayload,
): Promise<LessonMaterial> {
	const data = await apiFetch(`/api/materials/lessons/${lessonId}`, {
		method: 'POST',
		body: payload,
	});
	return lessonMaterialSchema.parse(data);
}

export { createLessonMaterial };
export type { CreateLessonMaterialPayload };
