'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	lessonFormSchema,
	type LessonFormValues,
} from '@/features/admin/schemas/lesson-form.schema';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';
import { StatusToggle } from '@/features/admin/components/status-toggle';

type LessonFormModalProps = {
	mode: 'create' | 'edit';
	defaultValues: LessonFormValues;
	onClose: () => void;
	onSubmit: (values: LessonFormValues) => void;
	isSubmitting: boolean;
};

function LessonFormModal({
	mode,
	defaultValues,
	onClose,
	onSubmit,
	isSubmitting,
}: LessonFormModalProps) {
	const form = useForm<LessonFormValues>({
		resolver: zodResolver(lessonFormSchema),
		defaultValues,
	});

	return (
		<AdminModal
			title={mode === 'create' ? 'Nova aula' : 'Editar aula'}
			onClose={onClose}
		>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<AdminField
					label="Título da aula"
					error={form.formState.errors.title?.message}
					{...form.register('title')}
				/>
				<AdminTextareaField
					label="Descrição / transcrição"
					error={form.formState.errors.description?.message}
					{...form.register('description')}
				/>
				<StatusToggle
					label="Aula gratuita (freePreview)"
					checked={form.watch('freePreview')}
					onChange={(checked) =>
						form.setValue('freePreview', checked, { shouldValidate: true })
					}
				/>
				{mode === 'edit' ? (
					<StatusToggle
						label="Publicada"
						checked={form.watch('published')}
						onChange={(checked) =>
							form.setValue('published', checked, { shouldValidate: true })
						}
					/>
				) : null}

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

export { LessonFormModal };
