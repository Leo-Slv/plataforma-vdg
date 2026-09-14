import { apiFetch } from '@/lib/http/api-client';
import { uploadUrlSchema } from '@/features/admin/schemas/upload-url.schema';
import type { UploadUrl } from '@/features/admin/model/upload-url';

type RequestMaterialUploadUrlInput = {
	lessonId: string;
	fileName: string;
	contentType: string;
	sizeBytes: number;
};

async function requestMaterialUploadUrl(
	input: RequestMaterialUploadUrlInput,
): Promise<UploadUrl> {
	const data = await apiFetch('/api/materials/upload-url', {
		method: 'POST',
		body: {
			lessonId: input.lessonId,
			fileName: input.fileName,
			contentType: input.contentType,
			sizeBytes: input.sizeBytes,
			storageProvider: 'S3',
		},
	});
	return uploadUrlSchema.parse(data);
}

export { requestMaterialUploadUrl };
