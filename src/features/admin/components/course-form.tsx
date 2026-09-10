'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	courseFormSchema,
	type CourseFormValues,
} from '@/features/admin/schemas/course-form.schema';
import { slugify } from '@/features/admin/lib/slugify';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';
import { AdminSelect } from '@/features/admin/components/admin-select';
import { PricingModelPicker } from '@/features/admin/components/pricing-model-picker';
import { StatusToggle } from '@/features/admin/components/status-toggle';
import type { Area } from '@/features/admin/model/area';

type CourseFormProps = {
	mode: 'create' | 'edit';
	defaultValues: CourseFormValues;
	areas: Area[];
	previewHref?: string;
	modulesHref?: string;
	onCancel: () => void;
	onSubmit: (values: CourseFormValues) => void;
	isSubmitting: boolean;
	submitError?: string | null;
	onDelete?: () => void;
	isDeleting?: boolean;
};

function CourseForm({
	mode,
	defaultValues,
	areas,
	previewHref,
	modulesHref,
	onCancel,
	onSubmit,
	isSubmitting,
	submitError,
	onDelete,
	isDeleting,
}: CourseFormProps) {
	const form = useForm<CourseFormValues>({
		resolver: zodResolver(courseFormSchema),
		defaultValues,
	});

	const title = form.watch('title');
	const slug = slugify(title);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} noValidate className="p-8.5">
			<div className="flex items-end justify-between">
				<div>
					<div className="font-sans text-xs font-light text-foreground/40">
						Cursos / {mode === 'create' ? 'Novo curso' : 'Editar'}
					</div>
					<h1 className="mt-3 font-heading text-[34px] font-extralight">
						{mode === 'create' ? 'Novo curso' : title || 'Curso'}
					</h1>
				</div>
				<div className="flex gap-2.5">
					{mode === 'edit' && previewHref ? (
						<a
							href={previewHref}
							target="_blank"
							rel="noreferrer"
							className="rounded-full border border-foreground/18 px-5 py-3 font-sans text-[13px] text-foreground/60"
						>
							Pré-visualizar
						</a>
					) : null}
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
								: 'Criar curso'
							: isSubmitting
								? 'Salvando...'
								: 'Salvar curso'}
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
						label="Título do curso"
						error={form.formState.errors.title?.message}
						{...form.register('title')}
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
						label="Descrição curta"
						error={form.formState.errors.description?.message}
						{...form.register('description')}
					/>

					<div>
						<AdminField
							label="Capa do curso (URL)"
							placeholder="https://…"
							error={form.formState.errors.thumbnailUrl?.message}
							{...form.register('thumbnailUrl')}
						/>
						<p className="mt-2 text-[11.5px] font-light text-foreground/35">
							Use o link direto do arquivo de imagem (terminando em .jpg, .png
							etc.), não o link de uma página.
						</p>
					</div>

					<PricingModelPicker
						value={form.watch('pricingModel')}
						priceAmount={form.watch('priceAmount')}
						priceError={form.formState.errors.priceAmount?.message}
						onChangeModel={(value) =>
							form.setValue('pricingModel', value, { shouldValidate: true })
						}
						onChangePriceAmount={(value) =>
							form.setValue('priceAmount', value, { shouldValidate: true })
						}
					/>
				</div>

				<div className="flex flex-col gap-5.5">
					<AdminSelect
						label="Área"
						error={form.formState.errors.areaId?.message}
						{...form.register('areaId')}
					>
						<option value="">Selecione…</option>
						{areas.map((area) => (
							<option key={area.id} value={area.id}>
								{area.name}
							</option>
						))}
					</AdminSelect>

					{mode === 'edit' ? (
						<StatusToggle
							label="Publicado"
							checked={form.watch('published')}
							onChange={(checked) =>
								form.setValue('published', checked, { shouldValidate: true })
							}
						/>
					) : null}

					<AdminField
						label="Ordem de exibição"
						type="number"
						error={form.formState.errors.displayOrder?.message}
						{...form.register('displayOrder', { valueAsNumber: true })}
					/>

					<StatusToggle
						label="Emitir certificado"
						checked={form.watch('issuesCertificate')}
						onChange={(checked) =>
							form.setValue('issuesCertificate', checked, {
								shouldValidate: true,
							})
						}
					/>

					<StatusToggle
						label="Curso em destaque"
						checked={form.watch('isFeatured')}
						onChange={(checked) =>
							form.setValue('isFeatured', checked, { shouldValidate: true })
						}
					/>

					{mode === 'edit' && modulesHref ? (
						<div className="border-t border-foreground/8 pt-4.5">
							<span className="font-heading text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
								Conteúdo
							</span>
							<Link
								href={modulesHref}
								className="mt-2 block font-sans text-[12.5px] text-[oklch(0.72_0.1_248)]"
							>
								Gerenciar módulos →
							</Link>
						</div>
					) : null}

					{mode === 'edit' && onDelete ? (
						<button
							type="button"
							onClick={onDelete}
							disabled={isDeleting}
							className="self-start font-sans text-[12.5px] text-[oklch(0.65_0.16_25)] disabled:opacity-60"
						>
							{isDeleting ? 'Excluindo...' : 'Excluir curso'}
						</button>
					) : null}
				</div>
			</div>
		</form>
	);
}

export { CourseForm };
