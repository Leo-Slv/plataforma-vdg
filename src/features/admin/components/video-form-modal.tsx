'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import {
	videoFormSchema,
	type VideoFormValues,
	type VideoSubmitValues,
} from '@/features/admin/schemas/video-form.schema';
import {
	useRequestVideoUploadUrlMutation,
	useYouTubeVideoMetadataMutation,
} from '@/features/admin/hooks/admin.queries';
import { uploadFileToStorage } from '@/features/admin/lib/upload-file-to-storage';
import { readVideoFileDuration } from '@/features/admin/lib/read-video-file-duration';
import { buildYouTubeThumbnailUrl } from '@/features/admin/lib/youtube-thumbnail-url';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';

const METADATA_ERROR_MESSAGE =
	'Não foi possível buscar a duração pelo ID. Confira o ID ou informe a duração manualmente.';
const UPLOAD_ERROR_MESSAGE =
	'Não foi possível enviar o arquivo agora. Tente novamente.';
const ACCEPTED_VIDEO_TYPES =
	'video/mp4,video/quicktime,video/webm,video/x-matroska';

type VideoFormModalProps = {
	mode: 'add' | 'replace';
	lessonId: string;
	defaultValues: VideoFormValues;
	onClose: () => void;
	onSubmit: (values: VideoSubmitValues) => void;
	isSubmitting: boolean;
};

function VideoFormModal({
	mode,
	lessonId,
	defaultValues,
	onClose,
	onSubmit,
	isSubmitting,
}: VideoFormModalProps) {
	const form = useForm<VideoFormValues>({
		resolver: zodResolver(videoFormSchema),
		defaultValues,
	});
	const metadataMutation = useYouTubeVideoMetadataMutation();
	const requestUploadUrlMutation = useRequestVideoUploadUrlMutation();
	const [metadataError, setMetadataError] = useState<string | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadPercent, setUploadPercent] = useState<number | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const storageProvider = form.watch('storageProvider');
	const youtubeVideoId =
		storageProvider === 'YouTube' ? form.watch('youtubeVideoId') : '';

	function handleSelectProvider(provider: 'YouTube' | 'S3') {
		if (provider === storageProvider) {
			return;
		}
		const current = form.getValues();
		form.reset(
			provider === 'YouTube'
				? {
						storageProvider: 'YouTube',
						title: current.title,
						description: current.description,
						youtubeVideoId: '',
						durationMinutes: current.durationMinutes,
					}
				: {
						storageProvider: 'S3',
						title: current.title,
						description: current.description,
						file: null,
						durationMinutes: current.durationMinutes,
					},
		);
		setMetadataError(null);
		setUploadError(null);
	}

	function handleFetchDuration() {
		setMetadataError(null);
		metadataMutation.mutate(youtubeVideoId.trim(), {
			onSuccess: (metadata) => {
				form.setValue(
					'durationMinutes',
					String(Math.round(metadata.durationSeconds / 60)),
					{ shouldValidate: true },
				);
			},
			onError: () => setMetadataError(METADATA_ERROR_MESSAGE),
		});
	}

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0] ?? null;
		form.setValue('file', file, { shouldValidate: true });

		if (!file) {
			return;
		}

		try {
			const duration = await readVideoFileDuration(file);
			form.setValue('durationMinutes', String(Math.round(duration / 60)), {
				shouldValidate: true,
			});
		} catch {
			// Duration couldn't be read client-side (unsupported codec, etc.) —
			// the admin can still enter it manually.
		}
	}

	async function handleFormSubmit(values: VideoFormValues) {
		setUploadError(null);

		if (values.storageProvider === 'YouTube') {
			onSubmit({
				title: values.title,
				description: values.description,
				storageProvider: 'YouTube',
				storageKey: values.youtubeVideoId,
				thumbnailUrl: buildYouTubeThumbnailUrl(values.youtubeVideoId),
				durationSeconds: Number(values.durationMinutes) * 60,
				sizeBytes: 0,
			});
			return;
		}

		const file = values.file;
		if (!file) {
			return;
		}

		setIsUploading(true);
		setUploadPercent(0);
		try {
			const uploadUrl = await requestUploadUrlMutation.mutateAsync({
				lessonId,
				fileName: file.name,
				contentType: file.type,
				sizeBytes: file.size,
			});
			await uploadFileToStorage(uploadUrl.uploadUrl, file, {
				onProgress: setUploadPercent,
			});
			onSubmit({
				title: values.title,
				description: values.description,
				storageProvider: 'S3',
				storageKey: uploadUrl.storageKey,
				thumbnailUrl: null,
				durationSeconds: Number(values.durationMinutes) * 60,
				sizeBytes: file.size,
			});
		} catch {
			setUploadError(UPLOAD_ERROR_MESSAGE);
		} finally {
			setIsUploading(false);
		}
	}

	const file = storageProvider === 'S3' ? form.watch('file') : null;
	const errors = form.formState.errors as Partial<
		Record<
			'title' | 'description' | 'youtubeVideoId' | 'file' | 'durationMinutes',
			{ message?: string }
		>
	>;
	const submitDisabled = isSubmitting || isUploading;

	return (
		<AdminModal
			title={mode === 'add' ? 'Adicionar vídeo' : 'Substituir vídeo'}
			onClose={onClose}
		>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<div>
					<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
						Origem do vídeo
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => handleSelectProvider('YouTube')}
							className={cn(
								'flex-1 rounded-md border px-4 py-2.75 font-sans text-[13px]',
								storageProvider === 'YouTube'
									? 'border-foreground/30 bg-foreground/7 text-foreground'
									: 'border-foreground/12 text-foreground/50',
							)}
						>
							YouTube
						</button>
						<button
							type="button"
							onClick={() => handleSelectProvider('S3')}
							className={cn(
								'flex-1 rounded-md border px-4 py-2.75 font-sans text-[13px]',
								storageProvider === 'S3'
									? 'border-foreground/30 bg-foreground/7 text-foreground'
									: 'border-foreground/12 text-foreground/50',
							)}
						>
							Armazenamento interno
						</button>
					</div>
				</div>

				<AdminField
					label="Título do vídeo"
					error={errors.title?.message}
					{...form.register('title')}
				/>
				<AdminTextareaField
					label="Descrição"
					error={errors.description?.message}
					{...form.register('description')}
				/>

				{storageProvider === 'YouTube' ? (
					<AdminField
						label="ID do vídeo no YouTube"
						error={errors.youtubeVideoId?.message}
						{...form.register('youtubeVideoId')}
					/>
				) : (
					<div>
						<label className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
							Arquivo de vídeo
						</label>
						<input
							type="file"
							accept={ACCEPTED_VIDEO_TYPES}
							onChange={handleFileChange}
							className="w-full rounded-md border border-foreground/12 bg-surface-2 px-4 py-3.25 font-sans text-[13px] font-light text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3.5 file:py-1.5 file:font-sans file:text-[12px] file:text-background"
						/>
						{file ? (
							<p className="mt-2 font-mono text-[11px] text-foreground/40">
								{file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
							</p>
						) : null}
						{errors.file?.message ? (
							<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
								{errors.file?.message}
							</p>
						) : null}
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
					</div>
				)}

				<div>
					<AdminField
						label="Duração (minutos)"
						inputMode="numeric"
						error={errors.durationMinutes?.message}
						{...form.register('durationMinutes')}
					/>
					{storageProvider === 'YouTube' ? (
						<button
							type="button"
							onClick={handleFetchDuration}
							disabled={
								youtubeVideoId.trim().length === 0 || metadataMutation.isPending
							}
							className="mt-2.5 font-sans text-[12.5px] text-[oklch(0.72_0.1_248)] disabled:opacity-50"
						>
							{metadataMutation.isPending
								? 'Buscando...'
								: 'Buscar duração pelo ID'}
						</button>
					) : null}
					{metadataError ? (
						<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
							{metadataError}
						</p>
					) : null}
				</div>

				{uploadError ? (
					<p className="text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
						{uploadError}
					</p>
				) : null}

				<div className="mt-1.5 flex justify-end gap-2.5">
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-foreground/18 px-5 py-3 font-sans text-[13px] text-foreground/60"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={submitDisabled}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background disabled:opacity-60"
					>
						{isUploading
							? 'Enviando...'
							: isSubmitting
								? 'Salvando...'
								: 'Salvar'}
					</button>
				</div>
			</form>
		</AdminModal>
	);
}

export { VideoFormModal };
