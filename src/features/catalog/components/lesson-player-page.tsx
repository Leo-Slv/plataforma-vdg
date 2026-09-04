'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

import { appRoutes } from '@/lib/routes/app-routes';
import { queryKeys } from '@/lib/constants/query-keys';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { AppNav } from '@/components/app-nav';
import {
	useCourseCatalogQuery,
	useCourseDetailsQuery,
	useCourseProgressQuery,
	useRegisterLessonProgressMutation,
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
import { LessonVideoPlaceholder } from '@/features/catalog/components/lesson-video-placeholder';
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
		enabled: ready && Boolean(course?.hasAccess),
	});
	const progressQuery = useCourseProgressQuery(course?.id ?? '', {
		enabled: ready && Boolean(course?.hasAccess),
	});
	const registerProgressMutation = useRegisterLessonProgressMutation();

	const blockedFromDetails =
		Boolean(course) && (!course!.hasAccess || detailsQuery.isError);

	useEffect(() => {
		if (blockedFromDetails) {
			router.replace(appRoutes.courses.detail(slug));
		}
	}, [blockedFromDetails, router, slug]);

	const enteredAtRef = useRef<number | null>(null);
	useEffect(() => {
		enteredAtRef.current = Date.now();
	}, [lessonId]);

	if (!ready) {
		return <div className="min-h-screen bg-[#0a0a0b]" />;
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
		<div className="min-h-screen bg-[#0a0a0b] text-[#f2f2f0]">
			<AppNav displayName={displayName} initials={initials} active="catalog" />

			{catalogQuery.isPending ? (
				<p className="px-5 py-16 text-center font-sans text-sm font-light text-white/50 sm:px-10">
					Carregando…
				</p>
			) : catalogQuery.isError ? (
				isApiError(catalogQuery.error) &&
				catalogQuery.error.status === 401 ? null : (
					<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
						<p className="font-sans text-sm font-light text-white/60">
							Não foi possível carregar este curso agora.
						</p>
						<button
							type="button"
							onClick={() => catalogQuery.refetch()}
							className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
						>
							Tentar novamente
						</button>
					</div>
				)
			) : !course ? (
				<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
					<p className="font-sans text-sm font-light text-white/60">
						Curso não encontrado.
					</p>
					<Link
						href={appRoutes.catalog.index}
						className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
					>
						Voltar ao catálogo
					</Link>
				</div>
			) : blockedFromDetails ? (
				<div className="min-h-[40vh]" />
			) : detailsQuery.isPending || !detailsQuery.data ? (
				<p className="px-5 py-16 text-center font-sans text-sm font-light text-white/50 sm:px-10">
					Carregando…
				</p>
			) : (
				(() => {
					const details = detailsQuery.data;
					const location = findLessonById(details, lessonId);

					if (!location) {
						return (
							<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
								<p className="font-sans text-sm font-light text-white/60">
									Aula não encontrada.
								</p>
								<Link
									href={appRoutes.courses.detail(slug)}
									className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
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

					return (
						<>
							<div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5 sm:px-7">
								<Link
									href={appRoutes.courses.detail(slug)}
									className="font-sans text-[13px] font-light text-white/50"
								>
									← {course.title}
								</Link>
								{percent !== null ? (
									<div className="flex items-center gap-3.5">
										<span className="font-sans text-xs font-light text-white/50">
											{percent}% concluído
										</span>
										<span className="block h-[3px] w-[120px] overflow-hidden rounded-full bg-white/14">
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
									<LessonVideoPlaceholder />

									<button
										type="button"
										onClick={handleMarkAsWatched}
										disabled={registerProgressMutation.isPending}
										className="mt-5 rounded-full border border-white/20 px-6 py-3.5 font-sans text-[13px] text-[#f2f2f0] disabled:opacity-50"
									>
										{registerProgressMutation.isPending
											? 'Marcando...'
											: 'Marcar aula como assistida'}
									</button>

									<div className="mt-7 flex items-start justify-between gap-7">
										<div>
											<div className="font-heading text-[10.5px] tracking-[0.16em] text-white/42 uppercase">
												Módulo {String(location.modulePosition).padStart(2, '0')}{' '}
												· Aula{' '}
												{String(location.lessonPosition).padStart(2, '0')}
											</div>
											<h1 className="mt-3 font-heading text-[28px] leading-[1.2] font-extralight">
												{location.lesson.title}
											</h1>
											<p className="mt-3.5 max-w-[560px] text-[14.5px] leading-[1.7] font-light text-white/55">
												{location.lesson.description}
											</p>
										</div>
										{nextLessonId ? (
											<Link
												href={appRoutes.courses.lesson(slug, nextLessonId)}
												className="flex-none rounded-full border border-white/20 px-5.5 py-3.5 font-sans text-[13px] text-[#f2f2f0]"
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
