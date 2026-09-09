import { apiFetch } from '@/lib/http/api-client';
import { pagedVideosSchema } from '@/features/admin/schemas/video.schema';
import type { PagedVideos } from '@/features/admin/model/video';

async function getVideos(page: number, pageSize: number): Promise<PagedVideos> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});

	const data = await apiFetch(`/api/videos?${params.toString()}`);
	return pagedVideosSchema.parse(data);
}

export { getVideos };
