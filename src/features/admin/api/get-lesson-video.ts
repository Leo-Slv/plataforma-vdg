import { apiFetch } from '@/lib/http/api-client';
import { videoSchema } from '@/features/admin/schemas/video.schema';
import type { Video } from '@/features/admin/model/video';

async function getLessonVideo(lessonId: string): Promise<Video> {
	const data = await apiFetch(`/api/videos/lessons/${lessonId}`);
	return videoSchema.parse(data);
}

export { getLessonVideo };
