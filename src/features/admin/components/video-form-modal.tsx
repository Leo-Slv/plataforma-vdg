'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	videoFormSchema,
	type VideoFormValues,
} from '@/features/admin/schemas/video-form.schema';
import { useYouTubeVideoMetadataMutation } from '@/features/admin/hooks/admin.queries';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';

const METADATA_ERROR_MESSAGE =
	'Não foi possível buscar a duração pelo ID. Confira o ID ou informe a duração manualmente.';

type VideoFormModalProps = {
	mode: 'add' | 'replace';
	defaultValues: VideoFormValues;
	onClose: () => void;
	onSubmit: (values: VideoFormValues) => void;
	isSubmitting: boolean;
};

function VideoFormModal({
	mode,
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
	const [metadataError, setMetadataError] = useState<string | null>(null);
	const youtubeVideoId = form.watch('youtubeVideoId');

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

	return (
		<AdminModal
			title={mode === 'add' ? 'Adicionar vídeo' : 'Substituir vídeo'}
			onClose={onClose}
		>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<AdminField
					label="Título do vídeo"
					error={form.formState.errors.title?.message}
					{...form.register('title')}
				/>
				<AdminTextareaField
					label="Descrição"
					error={form.formState.errors.description?.message}
					{...form.register('description')}
				/>
				<AdminField
					label="ID do vídeo no YouTube"
					error={form.formState.errors.youtubeVideoId?.message}
					{...form.register('youtubeVideoId')}
				/>
				<div>
					<AdminField
						label="Duração (minutos)"
						inputMode="numeric"
						error={form.formState.errors.durationMinutes?.message}
						{...form.register('durationMinutes')}
					/>
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
					{metadataError ? (
						<p className="mt-2 text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
							{metadataError}
						</p>
					) : null}
				</div>

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
						disabled={isSubmitting}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background disabled:opacity-60"
					>
						{isSubmitting ? 'Salvando...' : 'Salvar'}
					</button>
				</div>
			</form>
		</AdminModal>
	);
}

export { VideoFormModal };
