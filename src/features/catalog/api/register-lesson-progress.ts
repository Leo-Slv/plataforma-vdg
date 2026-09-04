import { apiFetch } from '@/lib/http/api-client';

type RegisterLessonProgressInput = {
	lessonId: string;
	watchedSeconds: number;
};

async function registerLessonProgress(
	input: RegisterLessonProgressInput,
): Promise<void> {
	await apiFetch('/api/progress/lessons', {
		method: 'POST',
		body: { lessonId: input.lessonId, watchedSeconds: input.watchedSeconds },
	});
}

export { registerLessonProgress };
