import { apiFetch } from '@/lib/http/api-client';

async function deleteLessonVideo(lessonId: string): Promise<void> {
	await apiFetch(`/api/videos/lessons/${lessonId}`, { method: 'DELETE' });
}

export { deleteLessonVideo };
