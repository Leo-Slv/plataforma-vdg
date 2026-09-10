/**
 * Every YouTube video has a thumbnail at this predictable URL — no API
 * call needed, unlike duration (see api/get-youtube-video-metadata.ts).
 */
function buildYouTubeThumbnailUrl(youtubeVideoId: string): string {
	return `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
}

export { buildYouTubeThumbnailUrl };
