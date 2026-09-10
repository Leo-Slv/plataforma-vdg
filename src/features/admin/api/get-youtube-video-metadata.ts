import { apiFetch } from '@/lib/http/api-client';
import { youTubeVideoMetadataSchema } from '@/features/admin/schemas/youtube-video-metadata.schema';
import type { YouTubeVideoMetadata } from '@/features/admin/model/youtube-video-metadata';

async function getYouTubeVideoMetadata(
	videoId: string,
): Promise<YouTubeVideoMetadata> {
	const data = await apiFetch(
		`/api/videos/youtube-metadata?videoId=${encodeURIComponent(videoId)}`,
	);
	return youTubeVideoMetadataSchema.parse(data);
}

export { getYouTubeVideoMetadata };
