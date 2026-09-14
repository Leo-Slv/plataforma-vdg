import { apiFetch } from '@/lib/http/api-client';

async function removeLessonNote(lessonId: string): Promise<void> {
	await apiFetch(`/api/notes/lessons/${lessonId}`, { method: 'DELETE' });
}

export { removeLessonNote };
