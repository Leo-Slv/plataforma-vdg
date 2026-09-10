'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
	createUserFormSchema,
	type CreateUserFormValues,
} from '@/features/admin/schemas/create-user-form.schema';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { AdminField } from '@/features/admin/components/admin-field';

type CreateUserModalProps = {
	onClose: () => void;
	onSubmit: (values: CreateUserFormValues) => void;
	isSubmitting: boolean;
	error?: string | null;
};

function CreateUserModal({
	onClose,
	onSubmit,
	isSubmitting,
	error,
}: CreateUserModalProps) {
	const form = useForm<CreateUserFormValues>({
		resolver: zodResolver(createUserFormSchema),
		defaultValues: { name: '', email: '', password: '' },
	});

	return (
		<AdminModal title="Convidar usuário" onClose={onClose}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
				className="flex flex-col gap-4.5"
			>
				<AdminField
					label="Nome"
					error={form.formState.errors.name?.message}
					{...form.register('name')}
				/>
				<AdminField
					label="E-mail"
					type="email"
					error={form.formState.errors.email?.message}
					{...form.register('email')}
				/>
				<AdminField
					label="Senha"
					type="password"
					error={form.formState.errors.password?.message}
					{...form.register('password')}
				/>
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
						{isSubmitting ? 'Criando...' : 'Criar usuário'}
					</button>
				</div>
			</form>
		</AdminModal>
	);
}

export { CreateUserModal };
