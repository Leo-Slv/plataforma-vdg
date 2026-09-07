'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	areaFormSchema,
	type AreaFormValues,
} from '@/features/admin/schemas/area-form.schema';
import { slugify } from '@/features/admin/lib/slugify';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';
import { AccentColorPicker } from '@/features/admin/components/accent-color-picker';
import { StatusToggle } from '@/features/admin/components/status-toggle';
import { AreaCoursesPanel } from '@/features/admin/components/area-courses-panel';
import type { Area } from '@/features/admin/model/area';

type AreaFormProps = {
	mode: 'create' | 'edit';
	defaultValues: AreaFormValues;
	courses?: Area['courses'];
	onCancel: () => void;
	onSubmit: (values: AreaFormValues) => void;
	isSubmitting: boolean;
	submitError?: string | null;
	onDelete?: () => void;
	isDeleting?: boolean;
};

function AreaForm({
	mode,
	defaultValues,
	courses,
	onCancel,
	onSubmit,
	isSubmitting,
	submitError,
	onDelete,
	isDeleting,
}: AreaFormProps) {
	const form = useForm<AreaFormValues>({
		resolver: zodResolver(areaFormSchema),
		defaultValues,
	});

	const name = form.watch('name');
	const slug = slugify(name);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} noValidate className="p-8.5">
			<div className="flex items-end justify-between">
				<div>
					<div className="font-sans text-xs font-light text-white/40">
						Áreas / {mode === 'create' ? 'Nova área' : 'Editar'}
					</div>
					<h1 className="mt-3 font-heading text-[34px] font-extralight">
						{mode === 'create' ? 'Nova área' : name || 'Área'}
					</h1>
				</div>
				<div className="flex gap-2.5">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-full border border-white/18 px-5 py-3 font-sans text-[13px] text-white/60"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-full bg-[#f4f4f2] px-5.5 py-3.25 font-sans text-[13px] text-[#0a0a0b] disabled:opacity-60"
					>
						{mode === 'create'
							? isSubmitting
								? 'Criando...'
								: 'Criar área'
							: isSubmitting
								? 'Salvando...'
								: 'Salvar área'}
					</button>
				</div>
			</div>

			{submitError ? (
				<div
					role="alert"
					className="mt-6 rounded-md border border-white/12 bg-[#101012] px-4 py-3 text-[13px] font-light text-white/70"
				>
					{submitError}
				</div>
			) : null}

			<div className="mt-8.5 grid grid-cols-1 gap-11 lg:grid-cols-[1.5fr_1fr]">
				<div className="flex flex-col gap-5.5">
					<AdminField
						label="Nome da área"
						error={form.formState.errors.name?.message}
						{...form.register('name')}
					/>

					<div>
						<span className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
							Slug
						</span>
						<div className="w-full rounded-md border border-white/10 bg-[#101012] px-4 py-3.25 font-mono text-[13px] text-white/50">
							/{slug || '—'}
						</div>
					</div>

					<AdminTextareaField
						label="Descrição"
						error={form.formState.errors.description?.message}
						{...form.register('description')}
					/>

					<AccentColorPicker
						value={form.watch('accentColor')}
						onChange={(value) =>
							form.setValue('accentColor', value, { shouldValidate: true })
						}
					/>
				</div>

				<div className="flex flex-col gap-5.5">
					{mode === 'edit' ? (
						<StatusToggle
							label="Área ativa"
							checked={form.watch('active')}
							onChange={(checked) =>
								form.setValue('active', checked, { shouldValidate: true })
							}
						/>
					) : null}

					<AdminField
						label="Ordem de exibição"
						type="number"
						error={form.formState.errors.displayOrder?.message}
						{...form.register('displayOrder', { valueAsNumber: true })}
					/>

					{courses ? <AreaCoursesPanel courses={courses} /> : null}

					{mode === 'edit' && onDelete ? (
						<button
							type="button"
							onClick={onDelete}
							disabled={isDeleting}
							className="self-start font-sans text-[12.5px] text-[oklch(0.65_0.16_25)] disabled:opacity-60"
						>
							{isDeleting ? 'Excluindo...' : 'Excluir área'}
						</button>
					) : null}
				</div>
			</div>
		</form>
	);
}

export { AreaForm };
