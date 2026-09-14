import { apiFetch } from '@/lib/http/api-client';

async function removeLessonMaterial(materialId: string): Promise<void> {
	await apiFetch(`/api/materials/${materialId}`, { method: 'DELETE' });
}

export { removeLessonMaterial };
