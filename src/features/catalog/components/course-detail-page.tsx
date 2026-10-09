'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { AppNav } from '@/components/app-nav';
import { LoadingScreen } from '@/components/loading-screen';
import { useCurrentUserQuery } from '@/features/auth/hooks/auth.queries';
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
import { useCreateCheckoutMutation } from '@/features/payments/hooks/payments.queries';
import { checkoutErrorMessage } from '@/features/payments/lib/checkout-error';
import { CourseDetailLocked } from '@/features/catalog/components/course-detail-locked';
import { CourseDetailOwned } from '@/features/catalog/components/course-detail-owned';

type CourseDetailPageProps = {
	slug: string;
};

function CourseDetailPage({ slug }: CourseDetailPageProps) {
	const router = useRouter();
	const ready = useRequireAuth();

	const catalogQuery = useCourseCatalogQuery({ enabled: ready });
	const currentUserQuery = useCurrentUserQuery({ enabled: ready });

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

	const checkoutMutation = useCreateCheckoutMutation();
	const [buyError, setBuyError] = useState<string | null>(null);

	function handleBuy() {
		if (!course) {
			return;
		}

		setBuyError(null);
		checkoutMutation.mutate(course.id, {
			// Hand the browser over to Stripe's hosted checkout. Access is only
			// granted later, by the webhook, and shown on /checkout/success.
			onSuccess: ({ checkoutUrl }) => window.location.assign(checkoutUrl),
			onError: (error) => setBuyError(checkoutErrorMessage(error)),
		});
	}

	if (!ready) {
		return <LoadingScreen />;
	}

	const displayName = getDisplayName(getUserName());
	const initials = getInitials(getUserName());

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppNav
				displayName={displayName}
				initials={initials}
				avatarUrl={currentUserQuery.data?.avatarUrl ?? null}
				active="catalog"
			/>

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
			) : (
				(() => {
					const areaName = findPrimaryAreaName(catalogQuery.data.areas, course);

					if (!course.hasAccess || detailsQuery.isError) {
						return (
							<CourseDetailLocked
								course={course}
								areaName={areaName}
								details={detailsQuery.isSuccess ? detailsQuery.data : undefined}
								onBuy={handleBuy}
								isBuying={
									checkoutMutation.isPending || checkoutMutation.isSuccess
								}
								buyError={buyError}
							/>
						);
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
