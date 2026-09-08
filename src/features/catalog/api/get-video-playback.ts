import { apiFetch } from '@/lib/http/api-client';
import { videoPlaybackSchema } from '@/features/catalog/schemas/video-playback.schema';
import type { VideoPlayback } from '@/features/catalog/model/video-playback';

async function getVideoPlayback(videoId: string): Promise<VideoPlayback> {
	const data = await apiFetch(`/api/videos/${videoId}/playback`);
	return videoPlaybackSchema.parse(data);
}

export { getVideoPlayback };
