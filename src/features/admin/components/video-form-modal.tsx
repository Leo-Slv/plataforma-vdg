'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	videoFormSchema,
	type VideoFormValues,
} from '@/features/admin/schemas/video-form.schema';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';

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
				<AdminField
					label="Duração (minutos)"
					inputMode="numeric"
					error={form.formState.errors.durationMinutes?.message}
					{...form.register('durationMinutes')}
				/>
				<AdminField
					label="URL da miniatura (opcional)"
					error={form.formState.errors.thumbnailUrl?.message}
					{...form.register('thumbnailUrl')}
				/>

				<div className="mt-1.5 flex justify-end gap-2.5">
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-white/18 px-5 py-3 font-sans text-[13px] text-white/60"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-full bg-[#f4f4f2] px-5.5 py-3.25 font-sans text-[13px] text-[#0a0a0b] disabled:opacity-60"
					>
						{isSubmitting ? 'Salvando...' : 'Salvar'}
					</button>
				</div>
			</form>
		</AdminModal>
	);
}

export { VideoFormModal };
