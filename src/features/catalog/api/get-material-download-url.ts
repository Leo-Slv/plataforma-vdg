import { apiFetch } from '@/lib/http/api-client';
import { materialDownloadSchema } from '@/features/catalog/schemas/material-download.schema';
import type { MaterialDownload } from '@/features/catalog/model/material-download';

async function getMaterialDownloadUrl(
	materialId: string,
): Promise<MaterialDownload> {
	const data = await apiFetch(`/api/materials/${materialId}/download`);
	return materialDownloadSchema.parse(data);
}

export { getMaterialDownloadUrl };
