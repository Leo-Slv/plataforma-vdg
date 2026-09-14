import { apiFetch } from '@/lib/http/api-client';
import { videoSchema } from '@/features/admin/schemas/video.schema';
import type { Video } from '@/features/admin/model/video';

type ReplaceLessonVideoPayload = {
	title: string;
	description: string;
	storageProvider: 'YouTube' | 'S3';
	storageKey: string;
	thumbnailUrl: string | null;
	durationSeconds: number;
	sizeBytes: number;
};

async function replaceLessonVideo(
	lessonId: string,
	payload: ReplaceLessonVideoPayload,
): Promise<Video> {
	const data = await apiFetch(`/api/videos/lessons/${lessonId}`, {
		method: 'PUT',
		body: payload,
	});
	return videoSchema.parse(data);
}

export { replaceLessonVideo };
export type { ReplaceLessonVideoPayload };
