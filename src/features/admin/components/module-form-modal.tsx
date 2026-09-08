'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	moduleFormSchema,
	type ModuleFormValues,
} from '@/features/admin/schemas/module-form.schema';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';
import { StatusToggle } from '@/features/admin/components/status-toggle';

type ModuleFormModalProps = {
	mode: 'create' | 'edit';
	defaultValues: ModuleFormValues;
	onClose: () => void;
	onSubmit: (values: ModuleFormValues) => void;
	isSubmitting: boolean;
};

function ModuleFormModal({
	mode,
	defaultValues,
	onClose,
	onSubmit,
	isSubmitting,
}: ModuleFormModalProps) {
	const form = useForm<ModuleFormValues>({
		resolver: zodResolver(moduleFormSchema),
		defaultValues,
	});

	return (
		<AdminModal
			title={mode === 'create' ? 'Novo módulo' : 'Editar módulo'}
			onClose={onClose}
		>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<AdminField
					label="Título do módulo"
					error={form.formState.errors.title?.message}
					{...form.register('title')}
				/>
				<AdminTextareaField
					label="Descrição"
					error={form.formState.errors.description?.message}
					{...form.register('description')}
				/>
				{mode === 'edit' ? (
					<StatusToggle
						label="Publicado"
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

export { ModuleFormModal };
