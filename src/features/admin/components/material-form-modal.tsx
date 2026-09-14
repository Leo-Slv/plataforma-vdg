'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	materialFormSchema,
	type MaterialFormValues,
} from '@/features/admin/schemas/material-form.schema';
import { useRequestMaterialUploadUrlMutation } from '@/features/admin/hooks/admin.queries';
import { uploadFileToStorage } from '@/features/admin/lib/upload-file-to-storage';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';
import type { CreateLessonMaterialPayload } from '@/features/admin/api/create-lesson-material';

const UPLOAD_ERROR_MESSAGE =
	'Não foi possível enviar o arquivo agora. Tente novamente.';
const ACCEPTED_MATERIAL_TYPES =
	'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,image/png,image/jpeg';

type MaterialFormModalProps = {
	lessonId: string;
	onClose: () => void;
	onSubmit: (payload: CreateLessonMaterialPayload) => void;
	isSubmitting: boolean;
};

function MaterialFormModal({
	lessonId,
	onClose,
	onSubmit,
	isSubmitting,
}: MaterialFormModalProps) {
	const form = useForm<MaterialFormValues>({
		resolver: zodResolver(materialFormSchema),
		defaultValues: { title: '', file: null },
	});
	const requestUploadUrlMutation = useRequestMaterialUploadUrlMutation();
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadPercent, setUploadPercent] = useState<number | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const file = form.watch('file');

	async function handleFormSubmit(values: MaterialFormValues) {
		setUploadError(null);
		const selectedFile = values.file;
		if (!selectedFile) {
			return;
		}

		setIsUploading(true);
		setUploadPercent(0);
		try {
			const uploadUrl = await requestUploadUrlMutation.mutateAsync({
				lessonId,
				fileName: selectedFile.name,
				contentType: selectedFile.type,
				sizeBytes: selectedFile.size,
			});
			await uploadFileToStorage(uploadUrl.uploadUrl, selectedFile, {
				onProgress: setUploadPercent,
			});
			onSubmit({
				title: values.title,
				fileName: selectedFile.name,
				contentType: selectedFile.type,
				storageProvider: 'S3',
				storageKey: uploadUrl.storageKey,
				sizeBytes: selectedFile.size,
			});
		} catch {
			setUploadError(UPLOAD_ERROR_MESSAGE);
		} finally {
			setIsUploading(false);
		}
	}

	const submitDisabled = isSubmitting || isUploading;

	return (
		<AdminModal title="Adicionar material" onClose={onClose}>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<AdminField
					label="Título do material"
					error={form.formState.errors.title?.message}
					{...form.register('title')}
				/>

				<div>
					<label className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
						Arquivo
					</label>
					<input
						type="file"
						accept={ACCEPTED_MATERIAL_TYPES}
						onChange={(event) =>
							form.setValue('file', event.target.files?.[0] ?? null, {
								shouldValidate: true,
							})
						}
						className="w-full rounded-md border border-foreground/12 bg-surface-2 px-4 py-3.25 font-sans text-[13px] font-light text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3.5 file:py-1.5 file:font-sans file:text-[12px] file:text-background"
					/>
					{file ? (
						<p className="mt-2 font-mono text-[11px] text-foreground/40">
							{file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
						</p>
					) : null}
					{form.formState.errors.file?.message ? (
						<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
							{form.formState.errors.file.message}
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

export { MaterialFormModal };
