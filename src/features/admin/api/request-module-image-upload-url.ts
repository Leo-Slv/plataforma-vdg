import { apiFetch } from '@/lib/http/api-client';
import { uploadUrlSchema } from '@/features/admin/schemas/upload-url.schema';
import type { UploadUrl } from '@/features/admin/model/upload-url';

type RequestModuleImageUploadUrlInput = {
	courseId: string;
	moduleId: string;
	fileName: string;
	contentType: string;
	sizeBytes: number;
};

async function requestModuleImageUploadUrl(
	input: RequestModuleImageUploadUrlInput,
): Promise<UploadUrl> {
	const data = await apiFetch(
		`/api/courses/${input.courseId}/modules/${input.moduleId}/image-upload-url`,
		{
			method: 'POST',
			body: {
				fileName: input.fileName,
				contentType: input.contentType,
				sizeBytes: input.sizeBytes,
			},
		},
	);
	return uploadUrlSchema.parse(data);
}

export { requestModuleImageUploadUrl };
