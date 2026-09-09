import { apiFetch } from '@/lib/http/api-client';
import { videoSchema } from '@/features/admin/schemas/video.schema';
import type { Video } from '@/features/admin/model/video';

async function activateVideo(videoId: string): Promise<Video> {
	const data = await apiFetch(`/api/videos/${videoId}/activate`, {
		method: 'POST',
	});
	return videoSchema.parse(data);
}

export { activateVideo };
