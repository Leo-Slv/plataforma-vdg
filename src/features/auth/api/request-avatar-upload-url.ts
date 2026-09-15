import { apiFetch } from '@/lib/http/api-client';
import { avatarUploadUrlSchema } from '@/features/auth/schemas/avatar-upload-url.schema';
import type { AvatarUploadUrl } from '@/features/auth/model/avatar-upload-url';

type RequestAvatarUploadUrlInput = {
	fileName: string;
	contentType: string;
	sizeBytes: number;
};

async function requestAvatarUploadUrl(
	input: RequestAvatarUploadUrlInput,
): Promise<AvatarUploadUrl> {
	const data = await apiFetch('/api/auth/me/avatar-upload-url', {
		method: 'POST',
		body: {
			fileName: input.fileName,
			contentType: input.contentType,
			sizeBytes: input.sizeBytes,
		},
	});
	return avatarUploadUrlSchema.parse(data);
}

export { requestAvatarUploadUrl };
