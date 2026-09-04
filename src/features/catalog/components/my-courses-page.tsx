'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { AppNav } from '@/components/app-nav';
import {
	useCourseCatalogQuery,
	useOwnedCourseDetailsQueries,
	useOwnedCourseProgressQueries,
} from '@/features/catalog/hooks/catalog.queries';
import { findPrimaryAreaName } from '@/features/catalog/lib/find-course';
import {
	computeCardState,
	sortOwnedCourses,
	pickHeroEntry,
	type OwnedCourseEntry,
} from '@/features/catalog/lib/my-courses';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { MyCoursesHero } from '@/features/catalog/components/my-courses-hero';
import { OwnedCourseCard } from '@/features/catalog/components/owned-course-card';

function MyCoursesPage() {
	const router = useRouter();
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

	const ownedCourses = catalogQuery.data
		? catalogQuery.data.courses.filter((course) => course.hasAccess)
		: [];
	const ownedIds = ownedCourses.map((course) => course.id);

	const detailsResults = useOwnedCourseDetailsQueries(ownedIds, {
		enabled: ready,
	});
	const progressResults = useOwnedCourseProgressQueries(ownedIds, {
		enabled: ready,
	});

	if (!ready) {
		return <div className="min-h-screen bg-[#0a0a0b]" />;
	}

	const displayName = getDisplayName(getUserName());
	const firstName = getUserName()?.trim().split(/\s+/)[0] ?? '';
	const initials = getInitials(getUserName());

	return (
		<div className="min-h-screen bg-[#0a0a0b] text-[#f2f2f0]">
			<AppNav displayName={displayName} initials={initials} active="my-courses" />

			{catalogQuery.isPending ? (
				<p className="px-5 py-16 text-center font-sans text-sm font-light text-white/50 sm:px-10">
					Carregando…
				</p>
			) : catalogQuery.isError ? (
				isApiError(catalogQuery.error) &&
				catalogQuery.error.status === 401 ? null : (
					<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
						<p className="font-sans text-sm font-light text-white/60">
							Não foi possível carregar seus cursos agora.
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
			) : ownedCourses.length === 0 ? (
				<div className="flex flex-col items-center gap-4 px-5 py-16 text-center sm:px-10">
					<p className="font-sans text-sm font-light text-white/60">
						Você ainda não tem cursos.
					</p>
					<Link
						href={appRoutes.catalog.index}
						className="rounded-full border border-white/20 px-6 py-3 font-sans text-[13px] text-[#f2f2f0]"
					>
						Ver o catálogo
					</Link>
				</div>
			) : (
				(() => {
					const resolved: OwnedCourseEntry[] = [];
					const loading: {
						course: (typeof ownedCourses)[number];
						areaName: string | null;
					}[] = [];

					ownedCourses.forEach((course, index) => {
						const areaName = findPrimaryAreaName(
							catalogQuery.data.areas,
							course,
						);
						const details = detailsResults[index]?.data;
						const progress = progressResults[index]?.data;

						if (details && progress) {
							resolved.push({ course, areaName, details, progress });
						} else {
							loading.push({ course, areaName });
						}
					});

					const sortedResolved = sortOwnedCourses(resolved);
					const heroEntry = pickHeroEntry(resolved);
					const heroState = heroEntry
						? computeCardState(heroEntry.details, heroEntry.progress)
						: undefined;
					const completedCount = resolved.filter(
						(entry) => entry.progress.progressPercent === 100,
					).length;

					return (
						<>
							<div className="px-5 pt-11 sm:px-10">
								<div className="font-heading text-[11px] tracking-[0.18em] text-white/42 uppercase">
									Bom te ver{firstName ? `, ${firstName}` : ''}
								</div>
								<h1 className="mt-3.5 font-heading text-[42px] leading-[1.08] font-extralight">
									Continue de onde parou
								</h1>
							</div>

							{heroEntry && heroState?.kind === 'active' ? (
								<div className="px-5 pt-8 sm:px-10">
									<MyCoursesHero
										course={heroEntry.course}
										slug={heroEntry.course.slug}
										state={heroState}
									/>
								</div>
							) : null}

							<div className="px-5 pt-11 pb-16 sm:px-10">
								<div className="flex items-baseline justify-between border-b border-white/9 pb-4">
									<h2 className="font-heading text-[22px] font-light">
										Seus cursos
									</h2>
									<span className="font-sans text-[12.5px] font-light text-white/45">
										{ownedCourses.length === 1
											? '1 inscrito'
											: `${ownedCourses.length} inscritos`}{' '}
										·{' '}
										{completedCount === 1
											? '1 concluído'
											: `${completedCount} concluídos`}
									</span>
								</div>

								<div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
									{sortedResolved.map((entry) => (
										<OwnedCourseCard
											key={entry.course.id}
											course={entry.course}
											areaName={entry.areaName}
											slug={entry.course.slug}
											state={computeCardState(entry.details, entry.progress)}
										/>
									))}
									{loading.map(({ course, areaName }) => (
										<OwnedCourseCard
											key={course.id}
											course={course}
											areaName={areaName}
											slug={course.slug}
											state={{ kind: 'loading' }}
										/>
									))}
								</div>
							</div>
						</>
					);
				})()
			)}
		</div>
	);
}

export { MyCoursesPage };
