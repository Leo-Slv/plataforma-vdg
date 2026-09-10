'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { isApiError } from '@/lib/http/api-error';
import { queryKeys } from '@/lib/constants/query-keys';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useCoursesQuery,
	useCourseModulesQuery,
	useCreateCourseModuleMutation,
	useUpdateCourseModuleMutation,
	useDeleteCourseModuleMutation,
	useReorderCourseModulesMutation,
	useCreateLessonMutation,
	useDeleteLessonMutation,
	useReorderLessonsMutation,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminModuleCard } from '@/features/admin/components/admin-module-card';
import { ModuleFormModal } from '@/features/admin/components/module-form-modal';
import { LessonFormModal } from '@/features/admin/components/lesson-form-modal';
import type { ModuleFormValues } from '@/features/admin/schemas/module-form.schema';
import type { LessonFormValues } from '@/features/admin/schemas/lesson-form.schema';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';

type ModalState =
	| { type: 'create-module' }
	| { type: 'edit-module'; moduleId: string }
	| { type: 'create-lesson'; moduleId: string }
	| null;

type CourseModulesPageProps = {
	courseId: string;
};

function CourseModulesPage({ courseId }: CourseModulesPageProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageCourses);

	const coursesQuery = useCoursesQuery({ enabled: ready });
	const modulesQuery = useCourseModulesQuery(courseId, { enabled: ready });

	const createModuleMutation = useCreateCourseModuleMutation();
	const updateModuleMutation = useUpdateCourseModuleMutation();
	const deleteModuleMutation = useDeleteCourseModuleMutation();
	const reorderModulesMutation = useReorderCourseModulesMutation();
	const createLessonMutation = useCreateLessonMutation();
	const deleteLessonMutation = useDeleteLessonMutation();
	const reorderLessonsMutation = useReorderLessonsMutation();

	const [modal, setModal] = useState<ModalState>(null);
	const [pageError, setPageError] = useState<string | null>(null);
	const [lessonDeleteError, setLessonDeleteError] = useState<{
		lessonId: string;
		message: string;
	} | null>(null);

	useEffect(() => {
		const unauthorized =
			(coursesQuery.isError &&
				isApiError(coursesQuery.error) &&
				coursesQuery.error.status === 401) ||
			(modulesQuery.isError &&
				isApiError(modulesQuery.error) &&
				modulesQuery.error.status === 401);

		if (unauthorized) {
			router.replace(appRoutes.auth.login);
		}
	}, [
		coursesQuery.isError,
		coursesQuery.error,
		modulesQuery.isError,
		modulesQuery.error,
		router,
	]);

	function invalidateModules() {
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.courseModules(courseId),
		});
	}

	function handleModuleSubmit(values: ModuleFormValues) {
		setPageError(null);

		if (modal?.type === 'create-module') {
			createModuleMutation.mutate(
				{
					courseId,
					payload: { title: values.title, description: values.description },
				},
				{
					onSuccess: () => {
						invalidateModules();
						toast.success('Módulo criado.');
						setModal(null);
					},
					onError: () => {
						setPageError(GENERIC_ERROR_MESSAGE);
						toast.error(GENERIC_ERROR_MESSAGE);
					},
				},
			);
			return;
		}

		if (modal?.type === 'edit-module') {
			updateModuleMutation.mutate(
				{ courseId, moduleId: modal.moduleId, payload: values },
				{
					onSuccess: () => {
						invalidateModules();
						toast.success('Módulo atualizado.');
						setModal(null);
					},
					onError: () => {
						setPageError(GENERIC_ERROR_MESSAGE);
						toast.error(GENERIC_ERROR_MESSAGE);
					},
				},
			);
		}
	}

	function handleLessonSubmit(values: LessonFormValues) {
		setPageError(null);

		if (modal?.type === 'create-lesson') {
			createLessonMutation.mutate(
				{
					courseId,
					moduleId: modal.moduleId,
					payload: {
						title: values.title,
						description: values.description,
						freePreview: values.freePreview,
					},
				},
				{
					onSuccess: () => {
						invalidateModules();
						toast.success('Aula criada.');
						setModal(null);
					},
					onError: () => {
						setPageError(GENERIC_ERROR_MESSAGE);
						toast.error(GENERIC_ERROR_MESSAGE);
					},
				},
			);
		}
	}

	function handleDeleteModule(moduleId: string) {
		if (!window.confirm('Excluir este módulo?')) {
			return;
		}
		setPageError(null);
		deleteModuleMutation.mutate(
			{ courseId, moduleId },
			{
				onSuccess: () => {
					invalidateModules();
					toast.success('Módulo excluído.');
				},
				onError: () => {
					setPageError(GENERIC_ERROR_MESSAGE);
					toast.error(GENERIC_ERROR_MESSAGE);
				},
			},
		);
	}

	function handleDeleteLesson(moduleId: string, lessonId: string) {
		if (!window.confirm('Excluir esta aula?')) {
			return;
		}
		setLessonDeleteError(null);
		deleteLessonMutation.mutate(
			{ courseId, moduleId, lessonId },
			{
				onSuccess: () => {
					invalidateModules();
					toast.success('Aula excluída.');
				},
				onError: (error) => {
					const message =
						isApiError(error) && error.status === 409
							? 'Esta aula tem progresso registrado por algum aluno e não pode ser excluída.'
							: GENERIC_ERROR_MESSAGE;
					setLessonDeleteError({ lessonId, message });
					toast.error(message);
				},
			},
		);
	}

	function moveModule(fromIndex: number, toIndex: number) {
		const modules = modulesQuery.data ?? [];
		const ids = modules.map((module) => module.id);
		const [moved] = ids.splice(fromIndex, 1);
		ids.splice(toIndex, 0, moved);

		reorderModulesMutation.mutate(
			{ courseId, moduleIds: ids },
			{
				onSuccess: invalidateModules,
				onError: () => setPageError(GENERIC_ERROR_MESSAGE),
			},
		);
	}

	function moveLesson(moduleId: string, fromIndex: number, toIndex: number) {
		const targetModule = (modulesQuery.data ?? []).find(
			(module) => module.id === moduleId,
		);
		if (!targetModule) {
			return;
		}
		const ids = targetModule.lessons.map((lesson) => lesson.id);
		const [moved] = ids.splice(fromIndex, 1);
		ids.splice(toIndex, 0, moved);

		reorderLessonsMutation.mutate(
			{ courseId, moduleId, lessonIds: ids },
			{
				onSuccess: invalidateModules,
				onError: () => setPageError(GENERIC_ERROR_MESSAGE),
			},
		);
	}

	if (!ready) {
		return <LoadingScreen />;
	}

	const course = coursesQuery.data?.find((item) => item.id === courseId);
	const courseListLoaded = !coursesQuery.isPending;

	if (courseListLoaded && !coursesQuery.isError && !course) {
		return (
			<div className="grid min-h-screen grid-cols-[236px_1fr] bg-background text-foreground">
				<AdminSidebar active="courses" />
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<p className="font-sans text-sm font-light text-foreground/60">
						Curso não encontrado.
					</p>
					<button
						type="button"
						onClick={() => router.push(appRoutes.admin.courses)}
						className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
					>
						Voltar para cursos
					</button>
				</div>
			</div>
		);
	}

	const modules = modulesQuery.data ?? [];

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-background text-foreground">
			<AdminSidebar active="courses" />

			<div className="p-8.5">
				<div className="font-sans text-xs font-light text-foreground/40">
					Cursos / {course?.title ?? '…'} / Módulos
				</div>
				<div className="mt-3 flex items-end justify-between">
					<h1 className="font-heading text-[34px] font-extralight">
						Módulos e aulas
					</h1>
					<button
						type="button"
						onClick={() => setModal({ type: 'create-module' })}
						className="rounded-full bg-foreground px-5.5 py-3.25 font-sans text-[13px] text-background"
					>
						Novo módulo
					</button>
				</div>

				{pageError ? (
					<div
						role="alert"
						className="mt-6 rounded-md border border-foreground/12 bg-surface px-4 py-3 text-[13px] font-light text-foreground/70"
					>
						{pageError}
					</div>
				) : null}

				<div className="mt-7.5">
					{modulesQuery.isPending ? (
						<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
							Carregando módulos…
						</p>
					) : modulesQuery.isError ? (
						isApiError(modulesQuery.error) &&
						modulesQuery.error.status === 401 ? null : (
							<div className="flex flex-col items-center gap-4 py-16 text-center">
								<p className="font-sans text-sm font-light text-foreground/60">
									Não foi possível carregar os módulos agora.
								</p>
								<button
									type="button"
									onClick={() => modulesQuery.refetch()}
									className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
								>
									Tentar novamente
								</button>
							</div>
						)
					) : modules.length === 0 ? (
						<p className="py-12 text-center font-sans text-sm font-light text-foreground/45">
							Nenhum módulo cadastrado ainda.
						</p>
					) : (
						<div className="flex flex-col gap-4">
							{modules.map((courseModule, index) => (
								<AdminModuleCard
									key={courseModule.id}
									courseModule={courseModule}
									position={index}
									canMoveUp={index > 0}
									canMoveDown={index < modules.length - 1}
									onMoveUp={() => moveModule(index, index - 1)}
									onMoveDown={() => moveModule(index, index + 1)}
									onEdit={() =>
										setModal({ type: 'edit-module', moduleId: courseModule.id })
									}
									onDelete={() => handleDeleteModule(courseModule.id)}
									isDeletingModule={
										deleteModuleMutation.isPending &&
										deleteModuleMutation.variables?.moduleId === courseModule.id
									}
									onAddLesson={() =>
										setModal({
											type: 'create-lesson',
											moduleId: courseModule.id,
										})
									}
									onEditLesson={(lessonId) =>
										router.push(
											appRoutes.admin.lessonEdit(
												courseId,
												courseModule.id,
												lessonId,
											),
										)
									}
									onMoveLessonUp={(lessonId) => {
										const lessonIndex = courseModule.lessons.findIndex(
											(lesson) => lesson.id === lessonId,
										);
										moveLesson(courseModule.id, lessonIndex, lessonIndex - 1);
									}}
									onMoveLessonDown={(lessonId) => {
										const lessonIndex = courseModule.lessons.findIndex(
											(lesson) => lesson.id === lessonId,
										);
										moveLesson(courseModule.id, lessonIndex, lessonIndex + 1);
									}}
									onDeleteLesson={(lessonId) =>
										handleDeleteLesson(courseModule.id, lessonId)
									}
									deletingLessonId={
										deleteLessonMutation.isPending
											? (deleteLessonMutation.variables?.lessonId ?? null)
											: null
									}
									lessonDeleteError={lessonDeleteError}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{modal?.type === 'create-module' ? (
				<ModuleFormModal
					mode="create"
					defaultValues={{ title: '', description: '', published: false }}
					onClose={() => setModal(null)}
					onSubmit={handleModuleSubmit}
					isSubmitting={createModuleMutation.isPending}
				/>
			) : null}

			{modal?.type === 'edit-module'
				? (() => {
						const editingModule = modules.find((m) => m.id === modal.moduleId);
						if (!editingModule) {
							return null;
						}
						return (
							<ModuleFormModal
								mode="edit"
								defaultValues={{
									title: editingModule.title,
									description: editingModule.description,
									published: editingModule.published,
								}}
								onClose={() => setModal(null)}
								onSubmit={handleModuleSubmit}
								isSubmitting={updateModuleMutation.isPending}
							/>
						);
					})()
				: null}

			{modal?.type === 'create-lesson' ? (
				<LessonFormModal
					mode="create"
					defaultValues={{
						title: '',
						description: '',
						freePreview: false,
						published: false,
					}}
					onClose={() => setModal(null)}
					onSubmit={handleLessonSubmit}
					isSubmitting={createLessonMutation.isPending}
				/>
			) : null}
		</div>
	);
}

export { CourseModulesPage };
