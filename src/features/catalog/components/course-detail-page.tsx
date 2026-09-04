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
	useCourseDetailsQuery,
} from '@/features/catalog/hooks/catalog.queries';
import {
	findCourseBySlug,
	findPrimaryAreaName,
} from '@/features/catalog/lib/find-course';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { CourseDetailLocked } from '@/features/catalog/components/course-detail-locked';
import { CourseDetailOwned } from '@/features/catalog/components/course-detail-owned';

type CourseDetailPageProps = {
	slug: string;
};

function CourseDetailPage({ slug }: CourseDetailPageProps) {
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

	const course = catalogQuery.data
		? findCourseBySlug(catalogQuery.data.courses, slug)
		: undefined;

	const detailsQuery = useCourseDetailsQuery(course?.id ?? '', {
		enabled: ready && Boolean(course?.hasAccess),
	});

	if (!ready) {
		return <div className="min-h-screen bg-[#0a0a0b]" />;
	}

	const displayName = getDisplayName(getUserName());
	const initials = getInitials(getUserName());

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
			) : (
				(() => {
					const areaName = findPrimaryAreaName(catalogQuery.data.areas, course);

					if (!course.hasAccess || detailsQuery.isError) {
						return <CourseDetailLocked course={course} areaName={areaName} />;
					}

					return (
						<CourseDetailOwned
							title={course.title}
							description={course.description}
							areaName={areaName}
							details={detailsQuery.data}
							slug={slug}
						/>
					);
				})()
			)}
		</div>
	);
}

export { CourseDetailPage };
