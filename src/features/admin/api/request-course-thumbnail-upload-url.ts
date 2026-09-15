import { apiFetch } from '@/lib/http/api-client';
import { imageUploadUrlSchema } from '@/features/admin/schemas/image-upload-url.schema';
import type { ImageUploadUrl } from '@/features/admin/model/image-upload-url';

type RequestCourseThumbnailUploadUrlInput = {
	courseId: string;
	fileName: string;
	contentType: string;
	sizeBytes: number;
};

async function requestCourseThumbnailUploadUrl(
	input: RequestCourseThumbnailUploadUrlInput,
): Promise<ImageUploadUrl> {
	const data = await apiFetch(
		`/api/courses/${input.courseId}/thumbnail-upload-url`,
		{
			method: 'POST',
			body: {
				fileName: input.fileName,
				contentType: input.contentType,
				sizeBytes: input.sizeBytes,
			},
		},
	);
	return imageUploadUrlSchema.parse(data);
}

export { requestCourseThumbnailUploadUrl };
