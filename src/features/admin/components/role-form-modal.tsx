'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	roleFormSchema,
	type RoleFormValues,
} from '@/features/admin/schemas/role-form.schema';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';
import { StatusToggle } from '@/features/admin/components/status-toggle';

type RoleFormModalProps = {
	mode: 'create' | 'edit';
	initialValues?: { name: string; description: string; active: boolean };
	onClose: () => void;
	onSubmit: (values: RoleFormValues & { active: boolean }) => void;
	isSubmitting: boolean;
	error?: string | null;
};

function RoleFormModal({
	mode,
	initialValues,
	onClose,
	onSubmit,
	isSubmitting,
	error,
}: RoleFormModalProps) {
	const form = useForm<RoleFormValues>({
		resolver: zodResolver(roleFormSchema),
		defaultValues: {
			name: initialValues?.name ?? '',
			description: initialValues?.description ?? '',
		},
	});
	const [active, setActive] = useState(initialValues?.active ?? true);

	return (
		<AdminModal
			title={mode === 'create' ? 'Novo papel' : 'Editar papel'}
			onClose={onClose}
		>
			<form
				onSubmit={form.handleSubmit((values) =>
					onSubmit({ ...values, active }),
				)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<AdminField
					label="Nome"
					placeholder="Ex.: Secretaria"
					error={form.formState.errors.name?.message}
					{...form.register('name')}
				/>
				<AdminTextareaField
					label="Descrição"
					rows={3}
					error={form.formState.errors.description?.message}
					{...form.register('description')}
				/>
				{mode === 'edit' ? (
					<StatusToggle
						label="Papel ativo"
						helperText="Desativado, ninguém recebe as permissões deste papel."
						checked={active}
						onChange={setActive}
					/>
				) : null}
				{error ? (
					<p className="text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
						{error}
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
						disabled={isSubmitting}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background disabled:opacity-60"
					>
						{isSubmitting
							? 'Salvando...'
							: mode === 'create'
								? 'Criar papel'
								: 'Salvar'}
					</button>
				</div>
			</form>
		</AdminModal>
	);
}

export { RoleFormModal };
