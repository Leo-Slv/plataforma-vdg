import { apiFetch } from '@/lib/http/api-client';
import { uploadUrlSchema } from '@/features/admin/schemas/upload-url.schema';
import type { UploadUrl } from '@/features/admin/model/upload-url';

type RequestAreaImageUploadUrlInput = {
	areaId: string;
	fileName: string;
	contentType: string;
	sizeBytes: number;
};

async function requestAreaImageUploadUrl(
	input: RequestAreaImageUploadUrlInput,
): Promise<UploadUrl> {
	const data = await apiFetch(`/api/areas/${input.areaId}/image-upload-url`, {
		method: 'POST',
		body: {
			fileName: input.fileName,
			contentType: input.contentType,
			sizeBytes: input.sizeBytes,
		},
	});
	return uploadUrlSchema.parse(data);
}

export { requestAreaImageUploadUrl };
