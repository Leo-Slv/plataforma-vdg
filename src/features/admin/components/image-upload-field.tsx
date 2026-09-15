'use client';

import { useState } from 'react';

import { uploadFileToStorage } from '@/features/admin/lib/upload-file-to-storage';

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp';
const UPLOAD_ERROR_MESSAGE =
	'Não foi possível enviar a imagem agora. Tente novamente.';

type ImageUploadFieldProps = {
	label: string;
	imageUrl: string | null;
	onRequestUpload: (
		file: File,
	) => Promise<{ uploadUrl: string; publicUrl: string }>;
	onUploaded: (publicUrl: string) => void;
	disabled?: boolean;
	disabledHint?: string;
};

/**
 * A file-only image field: picking a file immediately requests a presigned
 * upload URL, PUTs the file straight to storage, then reports the resulting
 * public URL back to the caller's form state — there is no free-text URL
 * input, matching the same "upload only" treatment video/material fields
 * already got.
 */
function ImageUploadField({
	label,
	imageUrl,
	onRequestUpload,
	onUploaded,
	disabled,
	disabledHint,
}: ImageUploadFieldProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadPercent, setUploadPercent] = useState<number | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0] ?? null;
		event.target.value = '';

		if (!file) {
			return;
		}

		setUploadError(null);
		setIsUploading(true);
		setUploadPercent(0);
		try {
			const { uploadUrl, publicUrl } = await onRequestUpload(file);
			await uploadFileToStorage(uploadUrl, file, {
				onProgress: setUploadPercent,
			});
			onUploaded(publicUrl);
		} catch {
			setUploadError(UPLOAD_ERROR_MESSAGE);
		} finally {
			setIsUploading(false);
		}
	}

	return (
		<div>
			<span className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
				{label}
			</span>

			{disabled ? (
				<p className="text-[12.5px] font-light text-foreground/40">
					{disabledHint}
				</p>
			) : (
				<div className="flex items-center gap-3.5">
					{imageUrl ? (
						<div
							className="size-16 flex-none overflow-hidden rounded-md bg-surface bg-cover bg-center"
							style={{ backgroundImage: `url(${imageUrl})` }}
						/>
					) : (
						<div
							className="size-16 flex-none rounded-md bg-surface"
							style={{
								backgroundImage:
									'repeating-linear-gradient(135deg, var(--surface-2) 0 6px, var(--stripe-2) 6px 12px)',
							}}
						/>
					)}

					<div className="flex-1">
						<input
							type="file"
							accept={ACCEPTED_IMAGE_TYPES}
							onChange={handleFileChange}
							disabled={isUploading}
							className="w-full rounded-md border border-foreground/12 bg-surface-2 px-4 py-3.25 font-sans text-[13px] font-light text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3.5 file:py-1.5 file:font-sans file:text-[12px] file:text-background disabled:opacity-60"
						/>
						{isUploading ? (
							<div className="mt-2.5 flex items-center gap-2.5">
								<span className="block h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/14">
									<span
										className="block h-[3px] bg-[oklch(0.72_0.1_248)]"
										style={{ width: `${uploadPercent ?? 0}%` }}
									/>
								</span>
								<span className="font-sans text-[11px] font-light text-foreground/45">
									{uploadPercent ?? 0}%
								</span>
							</div>
						) : null}
						{uploadError ? (
							<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
								{uploadError}
							</p>
						) : null}
					</div>
				</div>
			)}
		</div>
	);
}

export { ImageUploadField };
