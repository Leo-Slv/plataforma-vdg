import { apiFetch } from '@/lib/http/api-client';

type RegisterLessonProgressInput = {
	lessonId: string;
	watchedSeconds: number;
	/** Where the player is now, so the next visit resumes there. */
	positionSeconds?: number;
};

async function registerLessonProgress(
	input: RegisterLessonProgressInput,
): Promise<void> {
	await apiFetch('/api/progress/lessons', {
		method: 'POST',
		body: {
			lessonId: input.lessonId,
			watchedSeconds: input.watchedSeconds,
			positionSeconds: input.positionSeconds,
		},
	});
}

export { registerLessonProgress };
