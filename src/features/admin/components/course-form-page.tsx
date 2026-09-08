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
	useAreasQuery,
	useCoursesQuery,
	useCreateCourseMutation,
	usePublishCourseMutation,
	useUnpublishCourseMutation,
	useUpdateCourseMutation,
} from '@/features/admin/hooks/admin.queries';
import { slugify } from '@/features/admin/lib/slugify';
import { resolvePriceAmount } from '@/features/admin/lib/resolve-price-amount';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { CourseForm } from '@/features/admin/components/course-form';
import type { CourseFormValues } from '@/features/admin/schemas/course-form.schema';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível salvar o curso agora. Tente novamente.';
const SLUG_CONFLICT_MESSAGE =
	'Já existe um curso com um título parecido (mesmo slug). Ajuste o título.';

type CourseFormPageProps =
	{ mode: 'create' } | { mode: 'edit'; courseId: string };

function CourseFormPage(props: CourseFormPageProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageCourses);

	const areasQuery = useAreasQuery({ enabled: ready });
	const coursesQuery = useCoursesQuery({
		enabled: ready && props.mode === 'edit',
	});
	const createMutation = useCreateCourseMutation();
	const updateMutation = useUpdateCourseMutation();
	const publishMutation = usePublishCourseMutation();
	const unpublishMutation = useUnpublishCourseMutation();
	const [submitError, setSubmitError] = useState<string | null>(null);

	useEffect(() => {
		const unauthorized =
			(areasQuery.isError &&
				isApiError(areasQuery.error) &&
				areasQuery.error.status === 401) ||
			(coursesQuery.isError &&
				isApiError(coursesQuery.error) &&
				coursesQuery.error.status === 401);

		if (unauthorized) {
			router.replace(appRoutes.auth.login);
		}
	}, [
		areasQuery.isError,
		areasQuery.error,
		coursesQuery.isError,
		coursesQuery.error,
		router,
	]);

	function goToList() {
		router.push(appRoutes.admin.courses);
	}

	function handleMutationError(error: unknown) {
		if (isApiError(error) && error.status === 409) {
			setSubmitError(SLUG_CONFLICT_MESSAGE);
			return;
		}
		setSubmitError(GENERIC_ERROR_MESSAGE);
	}

	function afterStatusResolved(courseId: string, wantsPublished: boolean) {
		if (wantsPublished) {
			publishMutation.mutate(courseId, {
				onSuccess: goToList,
				onError: handleMutationError,
			});
		} else {
			unpublishMutation.mutate(courseId, {
				onSuccess: goToList,
				onError: handleMutationError,
			});
		}
	}

	function handleSubmit(values: CourseFormValues) {
		setSubmitError(null);
		const slug = slugify(values.title);
		const priceAmount = resolvePriceAmount(
			values.pricingModel,
			values.priceAmount,
		);

		if (props.mode === 'create') {
			createMutation.mutate(
				{
					title: values.title,
					slug,
					description: values.description,
					thumbnailUrl: values.thumbnailUrl || null,
					displayOrder: values.displayOrder,
					pricingModel: values.pricingModel,
					priceAmount,
					issuesCertificate: values.issuesCertificate,
					isFeatured: values.isFeatured,
					areaIds: [values.areaId],
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: queryKeys.admin.courses,
						});
						goToList();
					},
					onError: handleMutationError,
				},
			);
			return;
		}

		const currentCourse = coursesQuery.data?.find(
			(course) => course.id === props.courseId,
		);
		const statusChanged =
			currentCourse !== undefined &&
			currentCourse.published !== values.published;

		updateMutation.mutate(
			{
				courseId: props.courseId,
				payload: {
					title: values.title,
					slug,
					description: values.description,
					thumbnailUrl: values.thumbnailUrl || null,
					displayOrder: values.displayOrder,
					pricingModel: values.pricingModel,
					priceAmount,
					issuesCertificate: values.issuesCertificate,
					isFeatured: values.isFeatured,
					areaIds: [values.areaId],
				},
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: queryKeys.admin.courses });
					if (statusChanged) {
						afterStatusResolved(props.courseId, values.published);
					} else {
						goToList();
					}
				},
				onError: handleMutationError,
			},
		);
	}

	function handleDelete() {
		if (props.mode !== 'edit') {
			return;
		}
		if (!window.confirm('Excluir (despublicar) este curso?')) {
			return;
		}

		setSubmitError(null);
		unpublishMutation.mutate(props.courseId, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: queryKeys.admin.courses });
				goToList();
			},
			onError: handleMutationError,
		});
	}

	if (!ready) {
		return <div className="min-h-screen bg-[#0a0a0b]" />;
	}

	const areas = areasQuery.data ?? [];
	const course =
		props.mode === 'edit'
			? coursesQuery.data?.find((item) => item.id === props.courseId)
			: undefined;

	const isSubmitting =
		createMutation.isPending ||
		updateMutation.isPending ||
		publishMutation.isPending ||
		unpublishMutation.isPending;

	if (props.mode === 'edit' && coursesQuery.isPending) {
		return (
			<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
				<AdminSidebar active="courses" />
				<p className="py-16 text-center font-sans text-sm font-light text-white/50">
					Carregando curso…
				</p>
			</div>
		);
	}

	if (props.mode === 'edit' && !coursesQuery.isPending && !course) {
		return (
			<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
				<AdminSidebar active="courses" />
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<p className="font-sans text-sm font-light text-white/60">
						Curso não encontrado.
					</p>
					<button
						type="button"
						onClick={goToList}
						className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
					>
						Voltar para cursos
					</button>
				</div>
			</div>
		);
	}

	const defaultValues: CourseFormValues =
		course !== undefined
			? {
					title: course.title,
					description: course.description,
					thumbnailUrl: course.thumbnailUrl ?? '',
					pricingModel: course.pricingModel,
					priceAmount:
						course.priceAmount !== null ? String(course.priceAmount) : '',
					areaId: course.areaIds[0] ?? '',
					displayOrder: course.displayOrder,
					issuesCertificate: course.issuesCertificate,
					isFeatured: course.isFeatured,
					published: course.published,
				}
			: {
					title: '',
					description: '',
					thumbnailUrl: '',
					pricingModel: 'Free',
					priceAmount: '',
					areaId: '',
					displayOrder: 0,
					issuesCertificate: true,
					isFeatured: false,
					published: false,
				};

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="courses" />
			<CourseForm
				mode={props.mode}
				defaultValues={defaultValues}
				areas={areas}
				previewHref={course ? appRoutes.courses.detail(course.slug) : undefined}
				modulesHref={
					props.mode === 'edit'
						? appRoutes.admin.courseModules(props.courseId)
						: undefined
				}
				onCancel={goToList}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				submitError={submitError}
				onDelete={props.mode === 'edit' ? handleDelete : undefined}
				isDeleting={props.mode === 'edit' && unpublishMutation.isPending}
			/>
		</div>
	);
}

export { CourseFormPage };
