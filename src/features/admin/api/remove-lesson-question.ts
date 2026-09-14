import { apiFetch } from '@/lib/http/api-client';

async function removeLessonQuestion(questionId: string): Promise<void> {
	await apiFetch(`/api/questions/${questionId}`, { method: 'DELETE' });
}

export { removeLessonQuestion };
