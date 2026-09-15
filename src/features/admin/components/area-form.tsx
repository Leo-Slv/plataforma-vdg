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
import { ImageUploadField } from '@/features/admin/components/image-upload-field';
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
	onRequestImageUpload?: (
		file: File,
	) => Promise<{ uploadUrl: string; publicUrl: string }>;
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
	onRequestImageUpload,
}: AreaFormProps) {
	const form = useForm<AreaFormValues>({
		resolver: zodResolver(areaFormSchema),
		defaultValues,
	});

	const name = form.watch('name');
	const slug = slugify(name);

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="p-5 sm:p-8.5"
		>
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<div className="font-sans text-xs font-light text-foreground/40">
						Áreas / {mode === 'create' ? 'Nova área' : 'Editar'}
					</div>
					<h1 className="mt-3 font-heading text-[34px] font-extralight">
						{mode === 'create' ? 'Nova área' : name || 'Área'}
					</h1>
				</div>
				<div className="flex flex-wrap gap-2.5">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-full border border-foreground/18 px-5 py-3 font-sans text-[13px] text-foreground/60"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background disabled:opacity-60"
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
					className="mt-6 rounded-md border border-foreground/12 bg-surface px-4 py-3 text-[13px] font-light text-foreground/70"
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
						<span className="mb-2.25 block font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
							Slug
						</span>
						<div className="w-full rounded-md border border-foreground/10 bg-surface px-4 py-3.25 font-mono text-[13px] text-foreground/50">
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

					<ImageUploadField
						label="Capa da área"
						imageUrl={form.watch('imageUrl')}
						disabled={mode === 'create' || !onRequestImageUpload}
						disabledHint="Salve a área primeiro para poder enviar a capa."
						onRequestUpload={(file) => onRequestImageUpload!(file)}
						onUploaded={(publicUrl) =>
							form.setValue('imageUrl', publicUrl, { shouldValidate: true })
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
