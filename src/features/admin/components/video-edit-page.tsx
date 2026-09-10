'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authPermissions } from '@/lib/auth/auth-permissions';
import { useRequirePermission } from '@/lib/auth/use-require-permission';
import { appRoutes } from '@/lib/routes/app-routes';
import { isApiError } from '@/lib/http/api-error';
import { queryKeys } from '@/lib/constants/query-keys';
import { LoadingScreen } from '@/components/loading-screen';
import {
	useLessonVideoQuery,
	useCoursesQuery,
	useAllCourseModulesQueries,
	useActivateVideoMutation,
	useUnlistVideoMutation,
	useDeleteLessonVideoMutation,
} from '@/features/admin/hooks/admin.queries';
import { buildLessonLookup } from '@/features/admin/lib/build-lesson-lookup';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { StatusToggle } from '@/features/admin/components/status-toggle';

const GENERIC_ERROR_MESSAGE =
	'Não foi possível concluir a ação. Tente novamente.';

type VideoEditPageProps = {
	videoId: string;
};

function VideoEditPage({ videoId }: VideoEditPageProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const lessonId = searchParams.get('lessonId') ?? '';
	const queryClient = useQueryClient();
	const ready = useRequirePermission(authPermissions.manageVideos);

	const videoQuery = useLessonVideoQuery(lessonId, {
		enabled: ready && lessonId.length > 0,
	});
	const coursesQuery = useCoursesQuery({ enabled: ready });
	const courseIds = coursesQuery.data?.map((course) => course.id) ?? [];
	const modulesResults = useAllCourseModulesQueries(courseIds, {
		enabled: ready,
	});

	const activateMutation = useActivateVideoMutation();
	const unlistMutation = useUnlistVideoMutation();
	const deleteVideoMutation = useDeleteLessonVideoMutation();

	const [pendingActive, setPendingActive] = useState<boolean | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	useEffect(() => {
		if (videoQuery.data && pendingActive === null) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setPendingActive(videoQuery.data.visibility === 'Active');
		}
	}, [videoQuery.data, pendingActive]);

	useEffect(() => {
		if (
			videoQuery.isError &&
			isApiError(videoQuery.error) &&
			videoQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [videoQuery.isError, videoQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	function goToList() {
		router.push(appRoutes.admin.videos);
	}

	function invalidateVideo() {
		queryClient.invalidateQueries({
			queryKey: queryKeys.admin.lessonVideo(lessonId),
		});
	}

	function handleSave() {
		if (!videoQuery.data || pendingActive === null) {
			return;
		}

		const isActive = videoQuery.data.visibility === 'Active';
		if (pendingActive === isActive) {
			goToList();
			return;
		}

		setSaveError(null);
		const mutation = pendingActive ? activateMutation : unlistMutation;
		mutation.mutate(videoQuery.data.id, {
			onSuccess: () => {
				invalidateVideo();
				toast.success(pendingActive ? 'Vídeo ativado.' : 'Vídeo não listado.');
				goToList();
			},
			onError: () => {
				setSaveError(GENERIC_ERROR_MESSAGE);
				toast.error(GENERIC_ERROR_MESSAGE);
			},
		});
	}

	function handleUnlink() {
		if (!window.confirm('Desvincular este vídeo da aula?')) {
			return;
		}

		deleteVideoMutation.mutate(
			{ lessonId },
			{
				onSuccess: () => {
					invalidateVideo();
					toast.success('Vídeo desvinculado.');
					goToList();
				},
				onError: () => toast.error(GENERIC_ERROR_MESSAGE),
			},
		);
	}

	const isLoading = !lessonId || videoQuery.isPending;
	const notFound =
		!isLoading &&
		(videoQuery.isError
			? isApiError(videoQuery.error) && videoQuery.error.status === 404
			: Boolean(videoQuery.data && videoQuery.data.id !== videoId));

	if (notFound || !lessonId) {
		return (
			<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
				<AdminSidebar active="videos" />
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<p className="font-sans text-sm font-light text-white/60">
						Vídeo não encontrado.
					</p>
					<button
						type="button"
						onClick={goToList}
						className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
					>
						Voltar para vídeos
					</button>
				</div>
			</div>
		);
	}

	const video = videoQuery.data;
	const modulesByCourse = courseIds.map(
		(_, index) => modulesResults[index]?.data ?? [],
	);
	const lookupReady = modulesResults.every((result) => !result.isPending);
	const lessonLookup = buildLessonLookup(
		coursesQuery.data ?? [],
		modulesByCourse,
	);
	const lessonEntry = lessonLookup.get(lessonId);
	const lessonLabel = lessonEntry
		? `${lessonEntry.courseTitle} · Aula ${String(lessonEntry.modulePosition).padStart(2, '0')}`
		: lookupReady
			? '—'
			: '…';

	const isSaving = activateMutation.isPending || unlistMutation.isPending;

	return (
		<div className="grid min-h-screen grid-cols-[236px_1fr] bg-[#0a0a0b] text-[#f2f2f0]">
			<AdminSidebar active="videos" />

			<div className="mx-auto w-full max-w-[560px] p-8.5">
				<div className="flex items-center gap-3.5">
					<button
						type="button"
						onClick={goToList}
						className="font-sans text-[20px] font-light text-white/50"
						aria-label="Voltar para vídeos"
					>
						←
					</button>
					<h1 className="font-heading text-[26px] font-extralight">
						Editar vídeo
					</h1>
				</div>

				{isLoading || !video ? (
					<p className="mt-16 py-16 text-center font-sans text-sm font-light text-white/50">
						Carregando…
					</p>
				) : (
					<>
						<div className="mt-6.5 flex aspect-video items-center justify-center rounded-md border border-white/10 bg-[#101012] font-mono text-[11px] text-white/35">
							youtube.com/embed/{video.youTubeVideoId ?? video.storageKey}
						</div>

						<div className="mt-6.5 flex flex-col gap-4.5">
							<div>
								<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
									ID do YouTube
								</div>
								<div className="rounded-md border border-white/12 bg-[#141416] px-4 py-3.25 font-mono text-[14px] text-[#f2f2f0]">
									{video.youTubeVideoId ?? video.storageKey}
								</div>
							</div>

							<div>
								<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
									Aula vinculada
								</div>
								<div className="rounded-md border border-white/12 bg-[#141416] px-4 py-3.25 font-sans text-[14px] font-light text-[#f2f2f0]">
									{lessonLabel}
								</div>
							</div>

							<div>
								<div className="mb-2.25 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase">
									Duração
								</div>
								<div className="rounded-md border border-white/12 bg-[#141416] px-4 py-3.25 font-sans text-[14px] font-light text-[#f2f2f0]">
									{Math.floor(video.durationSeconds / 60)}min
								</div>
							</div>

							<StatusToggle
								label="Ativo (visível na plataforma)"
								checked={pendingActive ?? false}
								onChange={setPendingActive}
							/>

							{saveError ? (
								<p className="text-[12.5px] text-[oklch(0.704_0.191_22.216)]">
									{saveError}
								</p>
							) : null}

							<button
								type="button"
								onClick={handleSave}
								disabled={isSaving}
								className="mt-1.5 rounded-full bg-[#f4f4f2] py-3.5 text-center font-sans text-[13.5px] text-[#0a0a0b] disabled:opacity-60"
							>
								{isSaving ? 'Salvando...' : 'Salvar alterações'}
							</button>

							<button
								type="button"
								onClick={handleUnlink}
								disabled={deleteVideoMutation.isPending}
								className="text-center font-sans text-[13px] text-[oklch(0.65_0.16_25)] disabled:opacity-60"
							>
								{deleteVideoMutation.isPending
									? 'Desvinculando...'
									: 'Desvincular vídeo'}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export { VideoEditPage };
