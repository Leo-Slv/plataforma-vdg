'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { XIcon } from '@phosphor-icons/react';

import { appRoutes } from '@/lib/routes/app-routes';
import { queryKeys } from '@/lib/constants/query-keys';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { AppNav } from '@/components/app-nav';
import { LoadingScreen } from '@/components/loading-screen';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	useCourseCatalogQuery,
	useCourseDetailsQuery,
	useCourseProgressQuery,
	useRegisterLessonProgressMutation,
	useVideoPlaybackQuery,
} from '@/features/catalog/hooks/catalog.queries';
import { findCourseBySlug } from '@/features/catalog/lib/find-course';
import {
	findLessonById,
	findNextLessonId,
} from '@/features/catalog/lib/lesson-sequence';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import {
	VideoPlayer,
	type VideoPlayerStatus,
} from '@/features/catalog/components/video-player';
import { LessonSidebar } from '@/features/catalog/components/lesson-sidebar';

type LessonPlayerPageProps = {
	slug: string;
	lessonId: string;
};

function LessonPlayerPage({ slug, lessonId }: LessonPlayerPageProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const ready = useRequireAuth();

	const catalogQuery = useCourseCatalogQuery({ enabled: ready });

	useEffect(() => {
		if (
			catalogQuery.isError &&
			isApiError(catalogQuery.error) &&
			catalogQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [catalogQuery.isError, catalogQuery.error, router]);

	const course = catalogQuery.data
		? findCourseBySlug(catalogQuery.data.courses, slug)
		: undefined;

	const detailsQuery = useCourseDetailsQuery(course?.id ?? '', {
		enabled: ready && Boolean(course),
	});
	const progressQuery = useCourseProgressQuery(course?.id ?? '', {
		enabled: ready && Boolean(course?.hasAccess),
	});
	const registerProgressMutation = useRegisterLessonProgressMutation();

	const lessonLocation = detailsQuery.data
		? findLessonById(detailsQuery.data, lessonId)
		: undefined;
	const lessonIsAccessible =
		Boolean(course?.hasAccess) || Boolean(lessonLocation?.lesson.freePreview);

	const videoId = lessonLocation?.lesson.videoId ?? '';
	const playbackQuery = useVideoPlaybackQuery(videoId, {
		enabled: ready && lessonIsAccessible && videoId.length > 0,
	});

	const isPaidLessonLocked =
		Boolean(course) &&
		detailsQuery.isSuccess &&
		Boolean(lessonLocation) &&
		!lessonIsAccessible;

	const blockedFromDetails =
		Boolean(course) &&
		(detailsQuery.isError ||
			(detailsQuery.isSuccess && !lessonLocation) ||
			isPaidLessonLocked);

	const shouldRedirectSilently = blockedFromDetails && !isPaidLessonLocked;

	useEffect(() => {
		if (shouldRedirectSilently) {
			router.replace(appRoutes.courses.detail(slug));
		}
	}, [shouldRedirectSilently, router, slug]);

	function handleClosePaidLessonDialog() {
		router.replace(appRoutes.courses.detail(slug));
	}

	const enteredAtRef = useRef<number | null>(null);
	useEffect(() => {
		enteredAtRef.current = Date.now();
	}, [lessonId]);

	if (!ready) {
		return <LoadingScreen />;
	}

	const displayName = getDisplayName(getUserName());
	const initials = getInitials(getUserName());

	function handleMarkAsWatched() {
		if (!course) {
			return;
		}

		const enteredAt = enteredAtRef.current ?? Date.now();
		const watchedSeconds = Math.max(
			1,
			Math.floor((Date.now() - enteredAt) / 1000),
		);

		registerProgressMutation.mutate(
			{ lessonId, watchedSeconds },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: queryKeys.progress.course(course.id),
					});
				},
			},
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppNav displayName={displayName} initials={initials} active="catalog" />

			{catalogQuery.isPending ? (
				<p className="px-5 py-16 text-center font-sans text-sm font-light text-foreground/50 sm:px-10">
					Carregando…
				</p>
			) : catalogQuery.isError ? (
				isApiError(catalogQuery.error) &&
				catalogQuery.error.status === 401 ? null : (
					<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
						<p className="font-sans text-sm font-light text-foreground/60">
							Não foi possível carregar este curso agora.
						</p>
						<button
							type="button"
							onClick={() => catalogQuery.refetch()}
							className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
						>
							Tentar novamente
						</button>
					</div>
				)
			) : !course ? (
				<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
					<p className="font-sans text-sm font-light text-foreground/60">
						Curso não encontrado.
					</p>
					<Link
						href={appRoutes.catalog.index}
						className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
					>
						Voltar ao catálogo
					</Link>
				</div>
			) : isPaidLessonLocked ? (
				<>
					<div className="min-h-[40vh]" />
					<Dialog
						open
						onOpenChange={(open) => {
							if (!open) {
								handleClosePaidLessonDialog();
							}
						}}
					>
						<DialogContent
							showCloseButton={false}
							className="rounded-md border border-[oklch(0.62_0.1_248)] bg-background p-5 text-foreground shadow-[0_12px_30px_rgba(0,0,0,0.5)] ring-0"
						>
							<DialogPrimitive.Close asChild>
								<button
									type="button"
									onClick={handleClosePaidLessonDialog}
									className="absolute top-3 right-3 text-foreground/50 hover:text-foreground"
								>
									<XIcon className="size-4" />
									<span className="sr-only">Fechar</span>
								</button>
							</DialogPrimitive.Close>
							<DialogHeader>
								<DialogTitle className="font-sans text-[13.5px] font-normal text-foreground">
									Esta aula é paga
								</DialogTitle>
								<DialogDescription className="font-sans text-[12.5px] font-light text-foreground/55">
									Você só tem acesso às aulas de preview grátis deste curso.
									Inscreva-se para desbloquear todo o conteúdo.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<button
									type="button"
									onClick={handleClosePaidLessonDialog}
									className="rounded-full bg-foreground px-5 py-2.5 font-sans text-[13px] text-background"
								>
									Voltar ao curso
								</button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</>
			) : blockedFromDetails ? (
				<div className="min-h-[40vh]" />
			) : detailsQuery.isPending || !detailsQuery.data ? (
				<p className="px-5 py-16 text-center font-sans text-sm font-light text-foreground/50 sm:px-10">
					Carregando…
				</p>
			) : (
				(() => {
					const details = detailsQuery.data;
					const location = findLessonById(details, lessonId);

					if (!location) {
						return (
							<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
								<p className="font-sans text-sm font-light text-foreground/60">
									Aula não encontrada.
								</p>
								<Link
									href={appRoutes.courses.detail(slug)}
									className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
								>
									Voltar ao curso
								</Link>
							</div>
						);
					}

					const nextLessonId = findNextLessonId(details, lessonId);
					const progress = progressQuery.isSuccess
						? progressQuery.data
						: undefined;
					const percent = progressQuery.isSuccess
						? Math.round(progressQuery.data.progressPercent)
						: null;

					const videoStatus: VideoPlayerStatus = !location.lesson.videoId
						? 'no-video'
						: playbackQuery.isPending
							? 'loading'
							: playbackQuery.isError
								? 'error'
								: 'ready';

					return (
						<>
							<div className="flex items-center justify-between border-b border-foreground/8 px-5 py-3.5 sm:px-7">
								<Link
									href={appRoutes.courses.detail(slug)}
									className="font-sans text-[13px] font-light text-foreground/50"
								>
									← {course.title}
								</Link>
								{percent !== null ? (
									<div className="flex items-center gap-3.5">
										<span className="font-sans text-xs font-light text-foreground/50">
											{percent}% concluído
										</span>
										<span className="block h-[3px] w-[120px] overflow-hidden rounded-full bg-foreground/14">
											<span
												className="block h-[3px] bg-[oklch(0.72_0.1_248)]"
												style={{ width: `${percent}%` }}
											/>
										</span>
									</div>
								) : null}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-[1fr_360px]">
								<div className="px-5 py-7 sm:px-10">
									<VideoPlayer
										status={videoStatus}
										playbackUrl={playbackQuery.data?.playbackUrl}
									/>

									{course.hasAccess ? (
										<button
											type="button"
											onClick={handleMarkAsWatched}
											disabled={registerProgressMutation.isPending}
											className="mt-5 rounded-full border border-foreground/20 px-6 py-3.5 font-sans text-[13px] text-foreground disabled:opacity-50"
										>
											{registerProgressMutation.isPending
												? 'Marcando...'
												: 'Marcar aula como assistida'}
										</button>
									) : (
										<span className="mt-5 inline-block rounded-full bg-surface px-4 py-2 font-heading text-[11px] tracking-[0.14em] text-[oklch(0.75_0.1_248)] uppercase">
											Aula grátis
										</span>
									)}

									<div className="mt-7 flex items-start justify-between gap-7">
										<div>
											<div className="font-heading text-[10.5px] tracking-[0.16em] text-foreground/42 uppercase">
												Módulo{' '}
												{String(location.modulePosition).padStart(2, '0')} ·
												Aula {String(location.lessonPosition).padStart(2, '0')}
											</div>
											<h1 className="mt-3 font-heading text-[28px] leading-[1.2] font-extralight">
												{location.lesson.title}
											</h1>
											<p className="mt-3.5 max-w-[560px] text-[14.5px] leading-[1.7] font-light text-foreground/55">
												{location.lesson.description}
											</p>
										</div>
										{nextLessonId ? (
											<Link
												href={appRoutes.courses.lesson(slug, nextLessonId)}
												className="flex-none rounded-full border border-foreground/20 px-5.5 py-3.5 font-sans text-[13px] text-foreground"
											>
												Próxima aula →
											</Link>
										) : null}
									</div>
								</div>

								<LessonSidebar
									details={details}
									progress={progress}
									currentLessonId={lessonId}
									slug={slug}
								/>
							</div>
						</>
					);
				})()
			)}
		</div>
	);
}

export { LessonPlayerPage };
