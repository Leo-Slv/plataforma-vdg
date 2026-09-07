'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { isApiError } from '@/lib/http/api-error';
import { queryKeys } from '@/lib/constants/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import {
	useAreaQuery,
	useCreateAreaMutation,
	useUpdateAreaMutation,
} from '@/features/admin/hooks/admin.queries';
import { slugify } from '@/features/admin/lib/slugify';
import { DEFAULT_ACCENT_COLOR } from '@/features/admin/lib/accent-color';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AreaForm } from '@/features/admin/components/area-form';
import type { AreaFormValues } from '@/features/admin/schemas/area-form.schema';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível salvar a área agora. Tente novamente.';
const SLUG_CONFLICT_MESSAGE =
	'Já existe uma área com um nome parecido (mesmo slug). Ajuste o nome.';

type AreaFormPageProps = { mode: 'create' } | { mode: 'edit'; areaId: string };

function AreaFormPage(props: AreaFormPageProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageAreas);

	const areaQuery = useAreaQuery(props.mode === 'edit' ? props.areaId : '', {
		enabled: ready && props.mode === 'edit',
	});
	const createMutation = useCreateAreaMutation();
	const updateMutation = useUpdateAreaMutation();
	const [submitError, setSubmitError] = useState<string | null>(null);

	useEffect(() => {
		if (
			areaQuery.isError &&
			isApiError(areaQuery.error) &&
			areaQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [areaQuery.isError, areaQuery.error, router]);

	function goToList() {
		router.push(appRoutes.admin.areas);
	}

	function handleMutationError(error: unknown) {
		if (isApiError(error) && error.status === 409) {
			setSubmitError(SLUG_CONFLICT_MESSAGE);
			return;
		}
		setSubmitError(GENERIC_ERROR_MESSAGE);
	}

	function handleSubmit(values: AreaFormValues) {
		setSubmitError(null);
		const slug = slugify(values.name);

		if (props.mode === 'create') {
			createMutation.mutate(
				{
					name: values.name,
					slug,
					description: values.description,
					displayOrder: values.displayOrder,
					accentColor: values.accentColor,
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: queryKeys.admin.areas });
						goToList();
					},
					onError: handleMutationError,
				},
			);
			return;
		}

		updateMutation.mutate(
			{
				areaId: props.areaId,
				payload: {
					name: values.name,
					slug,
					description: values.description,
					displayOrder: values.displayOrder,
					active: values.active,
					accentColor: values.accentColor,
				},
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: queryKeys.admin.areas });
					queryClient.invalidateQueries({
						queryKey: queryKeys.admin.area(props.areaId),
					});
					goToList();
				},
				onError: handleMutationError,
			},
		);
	}

	function handleDelete() {
		if (props.mode !== 'edit' || !areaQuery.data) {
			return;
		}
		if (!window.confirm('Excluir (desativar) esta área?')) {
			return;
		}

		const area = areaQuery.data;
		setSubmitError(null);
		updateMutation.mutate(
			{
				areaId: props.areaId,
				payload: {
					name: area.name,
					slug: area.slug,
					description: area.description,
					displayOrder: area.displayOrder,
					active: false,
					accentColor: area.accentColor as AreaFormValues['accentColor'],
				},
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: queryKeys.admin.areas });
					goToList();
				},
				onError: handleMutationError,
			},
		);
	}

	if (!ready) {
		return <div className="min-h-screen bg-[#0a0a0b]" />;
	}

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const defaultValues: AreaFormValues =
		props.mode === 'edit' && areaQuery.data
			? {
					name: areaQuery.data.name,
					description: areaQuery.data.description,
					displayOrder: areaQuery.data.displayOrder,
					accentColor: areaQuery.data
						.accentColor as AreaFormValues['accentColor'],
					active: areaQuery.data.active,
				}
			: {
					name: '',
					description: '',
					displayOrder: 0,
					accentColor: DEFAULT_ACCENT_COLOR,
					active: true,
				};

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="areas" />

			{props.mode === 'edit' && areaQuery.isPending ? (
				<p className="py-16 text-center font-sans text-sm font-light text-white/50">
					Carregando área…
				</p>
			) : props.mode === 'edit' &&
			  areaQuery.isError &&
			  isApiError(areaQuery.error) &&
			  areaQuery.error.status === 404 ? (
				<div className="flex flex-col items-center gap-4 py-16 text-center">
					<p className="font-sans text-sm font-light text-white/60">
						Área não encontrada.
					</p>
					<button
						type="button"
						onClick={goToList}
						className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
					>
						Voltar para áreas
					</button>
				</div>
			) : props.mode === 'edit' && areaQuery.isError ? (
				isApiError(areaQuery.error) && areaQuery.error.status === 401 ? null : (
					<div className="flex flex-col items-center gap-4 py-16 text-center">
						<p className="font-sans text-sm font-light text-white/60">
							Não foi possível carregar a área agora.
						</p>
						<button
							type="button"
							onClick={() => areaQuery.refetch()}
							className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
						>
							Tentar novamente
						</button>
					</div>
				)
			) : (
				<AreaForm
					mode={props.mode}
					defaultValues={defaultValues}
					courses={props.mode === 'edit' ? areaQuery.data?.courses : undefined}
					onCancel={goToList}
					onSubmit={handleSubmit}
					isSubmitting={isSubmitting}
					submitError={submitError}
					onDelete={props.mode === 'edit' ? handleDelete : undefined}
					isDeleting={props.mode === 'edit' && updateMutation.isPending}
				/>
			)}
		</div>
	);
}

export { AreaFormPage };
