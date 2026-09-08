'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { decodeAccessTokenClaims, hasPermission } from '@/lib/auth/jwt-claims';
import { isApiError } from '@/lib/http/api-error';
import { queryKeys } from '@/lib/constants/query-keys';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useCoursesQuery,
	useCourseModulesQuery,
	useUpdateLessonMutation,
	useDeleteLessonMutation,
	useLessonVideoQuery,
	useReplaceLessonVideoMutation,
	useMarkVideoReadyMutation,
	useDeleteLessonVideoMutation,
} from '@/features/admin/hooks/admin.queries';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminField } from '@/features/admin/components/admin-field';
import { AdminTextareaField } from '@/features/admin/components/admin-textarea-field';
import { StatusToggle } from '@/features/admin/components/status-toggle';
import { LessonVideoPanel } from '@/features/admin/components/lesson-video-panel';
import { VideoFormModal } from '@/features/admin/components/video-form-modal';
import {
	lessonEditorFormSchema,
	type LessonEditorFormValues,
} from '@/features/admin/schemas/lesson-editor-form.schema';
import type { VideoFormValues } from '@/features/admin/schemas/video-form.schema';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';

type LessonEditorPageProps = {
	courseId: string;
	moduleId: string;
	lessonId: string;
};

function LessonEditorPage({
	courseId,
	moduleId,
	lessonId,
}: LessonEditorPageProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageCourses);
	const canManageVideos = hasPermission(
		decodeAccessTokenClaims(),
		authPermissions.manageVideos,
	);

	const coursesQuery = useCoursesQuery({ enabled: ready });
	const modulesQuery = useCourseModulesQuery(courseId, { enabled: ready });
	const videoQuery = useLessonVideoQuery(lessonId, {
		enabled: ready && canManageVideos,
	});

	const updateLessonMutation = useUpdateLessonMutation();
	const deleteLessonMutation = useDeleteLessonMutation();
	const replaceVideoMutation = useReplaceLessonVideoMutation();
	const markVideoReadyMutation = useMarkVideoReadyMutation();
	const deleteVideoMutation = useDeleteLessonVideoMutation();

	const [pageError, setPageError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [videoModal, setVideoModal] = useState<'add' | 'replace' | null>(null);
	const [videoError, setVideoError] = useState<string | null>(null);

	const course = coursesQuery.data?.find((item) => item.id === courseId);
	const courseModule = modulesQuery.data?.find((item) => item.id === moduleId);
	const lesson = courseModule?.lessons.find((item) => item.id === lessonId);
	const modulePosition = modulesQuery.data?.findIndex(
		(item) => item.id === moduleId,
	);
	const lessonPosition = courseModule?.lessons.findIndex(
		(item) => item.id === lessonId,
	);

	const form = useForm<LessonEditorFormValues>({
		resolver: zodResolver(lessonEditorFormSchema),
		values: lesson
			? {
					title: lesson.title,
					description: lesson.description,
					freePreview: lesson.freePreview,
					published: lesson.published,
				}
			: undefined,
	});

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

	function invalidateVideo() {
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.lessonVideo(lessonId),
		});
	}

	function handleSubmit(values: LessonEditorFormValues) {
		setPageError(null);
		updateLessonMutation.mutate(
			{ courseId, moduleId, lessonId, payload: values },
			{
				onSuccess: invalidateModules,
				onError: () => setPageError(GENERIC_ERROR_MESSAGE),
			},
		);
	}

	function handleDeleteLesson() {
		if (!window.confirm('Excluir esta aula?')) {
			return;
		}
		setDeleteError(null);
		deleteLessonMutation.mutate(
			{ courseId, moduleId, lessonId },
			{
				onSuccess: () => {
					invalidateModules();
					router.push(appRoutes.admin.courseModules(courseId));
				},
				onError: (error) => {
					setDeleteError(
						isApiError(error) && error.status === 409
							? 'Esta aula tem progresso registrado por algum aluno e não pode ser excluída.'
							: GENERIC_ERROR_MESSAGE,
					);
				},
			},
		);
	}

	function handleVideoSubmit(values: VideoFormValues) {
		setVideoError(null);
		replaceVideoMutation.mutate(
			{
				lessonId,
				payload: {
					title: values.title,
					description: values.description,
					storageKey: values.youtubeVideoId,
					thumbnailUrl:
						values.thumbnailUrl.length > 0 ? values.thumbnailUrl : null,
					durationSeconds: Number(values.durationMinutes) * 60,
				},
			},
			{
				onSuccess: (video) => {
					markVideoReadyMutation.mutate(
						{ videoId: video.id },
						{
							onSettled: invalidateVideo,
						},
					);
					setVideoModal(null);
				},
				onError: () => setVideoError(GENERIC_ERROR_MESSAGE),
			},
		);
	}

	function handleRemoveVideo() {
		if (!window.confirm('Remover o vídeo desta aula?')) {
			return;
		}
		setVideoError(null);
		deleteVideoMutation.mutate(
			{ lessonId },
			{
				onSuccess: invalidateVideo,
				onError: () => setVideoError(GENERIC_ERROR_MESSAGE),
			},
		);
	}

	if (!ready) {
		return <LoadingScreen />;
	}

	const courseListLoaded = !coursesQuery.isPending;
	const modulesLoaded = !modulesQuery.isPending;
	const notFound =
		courseListLoaded &&
		modulesLoaded &&
		!coursesQuery.isError &&
		!modulesQuery.isError &&
		(!course || !courseModule || !lesson);

	if (notFound) {
		return (
			<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
				<AdminSidebar active="courses" />
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<p className="font-sans text-sm font-light text-white/60">
						Aula não encontrada.
					</p>
					<button
						type="button"
						onClick={() => router.push(appRoutes.admin.courseModules(courseId))}
						className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
					>
						Voltar para módulos
					</button>
				</div>
			</div>
		);
	}

	const isLoading = !courseListLoaded || !modulesLoaded;
	const videoNotRegistered =
		videoQuery.isError &&
		isApiError(videoQuery.error) &&
		videoQuery.error.status === 404;
	const videoHasRealError = videoQuery.isError && !videoNotRegistered;
	const isVideoMutating =
		replaceVideoMutation.isPending ||
		markVideoReadyMutation.isPending ||
		deleteVideoMutation.isPending;

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="courses" />

			<div className="p-8.5">
				<div className="font-sans text-xs font-light text-white/40">
					Cursos / {course?.title ?? '…'} / {courseModule?.title ?? '…'} /
					Editar aula
				</div>
				<div className="mt-3 flex items-end justify-between">
					<h1 className="font-heading text-[34px] font-extralight">
						{lesson?.title ?? '…'}
					</h1>
					<div className="flex gap-2.5">
						<button
							type="button"
							onClick={() =>
								router.push(appRoutes.admin.courseModules(courseId))
							}
							className="rounded-full border border-white/18 px-5 py-3 font-sans text-[13px] text-white/60"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={form.handleSubmit(handleSubmit)}
							disabled={isLoading || updateLessonMutation.isPending}
							className="rounded-full bg-[#f4f4f2] px-5.5 py-3.25 font-sans text-[13px] text-[#0a0a0b] disabled:opacity-60"
						>
							{updateLessonMutation.isPending ? 'Salvando...' : 'Salvar aula'}
						</button>
					</div>
				</div>

				{pageError ? (
					<div
						role="alert"
						className="mt-6 rounded-md border border-white/12 bg-[#101012] px-4 py-3 text-[13px] font-light text-white/70"
					>
						{pageError}
					</div>
				) : null}

				{isLoading ? (
					<p className="mt-16 py-16 text-center font-sans text-sm font-light text-white/50">
						Carregando…
					</p>
				) : (
					<div className="mt-8.5 grid grid-cols-[1.5fr_1fr] gap-11">
						<div className="flex flex-col gap-5.5">
							<AdminField
								label="Título da aula"
								error={form.formState.errors.title?.message}
								{...form.register('title')}
							/>
							<div>
								<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
									Módulo
								</div>
								<div className="rounded-md border border-white/12 bg-[#141416] px-4 py-3.25 font-sans text-[14px] font-light text-[#f2f2f0]">
									Módulo {String((modulePosition ?? 0) + 1).padStart(2, '0')} —{' '}
									{courseModule?.title}
								</div>
							</div>
							<AdminTextareaField
								label="Descrição / transcrição"
								error={form.formState.errors.description?.message}
								{...form.register('description')}
							/>
							<LessonVideoPanel
								video={
									canManageVideos && !videoNotRegistered
										? (videoQuery.data ?? null)
										: null
								}
								isLoading={canManageVideos && videoQuery.isPending}
								hasError={canManageVideos && videoHasRealError}
								canManage={canManageVideos}
								isMutating={isVideoMutating}
								onAdd={() => setVideoModal('add')}
								onReplace={() => setVideoModal('replace')}
								onRemove={handleRemoveVideo}
							/>
							{videoError ? (
								<p className="text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
									{videoError}
								</p>
							) : null}
						</div>

						<div className="flex flex-col gap-5.5">
							<StatusToggle
								label="Aula gratuita (freePreview)"
								checked={form.watch('freePreview')}
								onChange={(checked) =>
									form.setValue('freePreview', checked, {
										shouldValidate: true,
									})
								}
							/>
							<StatusToggle
								label="Publicada"
								checked={form.watch('published')}
								onChange={(checked) =>
									form.setValue('published', checked, {
										shouldValidate: true,
									})
								}
							/>
							<div>
								<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
									Ordem no módulo
								</div>
								<div className="rounded-md border border-white/12 bg-[#141416] px-4 py-3.25 font-sans text-[14px] font-light text-[#f2f2f0]">
									{(lessonPosition ?? 0) + 1}
								</div>
							</div>
							<button
								type="button"
								onClick={handleDeleteLesson}
								disabled={deleteLessonMutation.isPending}
								className="text-left font-sans text-[12.5px] text-[oklch(0.65_0.16_25)] disabled:opacity-60"
							>
								{deleteLessonMutation.isPending
									? 'Excluindo...'
									: 'Excluir aula'}
							</button>
							{deleteError ? (
								<p className="text-[12px] text-[oklch(0.704_0.191_22.216)]">
									{deleteError}
								</p>
							) : null}
						</div>
					</div>
				)}
			</div>

			{videoModal ? (
				<VideoFormModal
					mode={videoModal}
					defaultValues={
						videoModal === 'replace' && videoQuery.data
							? {
									title: videoQuery.data.title,
									description: videoQuery.data.description,
									youtubeVideoId: videoQuery.data.storageKey,
									durationMinutes: String(
										Math.floor(videoQuery.data.durationSeconds / 60),
									),
									thumbnailUrl: videoQuery.data.thumbnailUrl ?? '',
								}
							: {
									title: '',
									description: '',
									youtubeVideoId: '',
									durationMinutes: '',
									thumbnailUrl: '',
								}
					}
					onClose={() => setVideoModal(null)}
					onSubmit={handleVideoSubmit}
					isSubmitting={replaceVideoMutation.isPending}
				/>
			) : null}
		</div>
	);
}

export { LessonEditorPage };
