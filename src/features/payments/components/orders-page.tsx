'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { isApiError } from '@/lib/http/api-error';
import { AppNav } from '@/components/app-nav';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { LoadingScreen } from '@/components/loading-screen';
import { useCurrentUserQuery } from '@/features/auth/hooks/auth.queries';
import { useCourseCatalogQuery } from '@/features/catalog/hooks/catalog.queries';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { useMyOrdersQuery } from '@/features/payments/hooks/payments.queries';
import {
	OrdersList,
	type OrderCourse,
} from '@/features/payments/components/orders-list';

function OrdersPage() {
	const router = useRouter();
	const ready = useRequireAuth();

	const currentUserQuery = useCurrentUserQuery({ enabled: ready });
	const catalogQuery = useCourseCatalogQuery({ enabled: ready });
	const ordersQuery = useMyOrdersQuery({ enabled: ready });

	useEffect(() => {
		if (
			ordersQuery.isError &&
			isApiError(ordersQuery.error) &&
			ordersQuery.error.status === 401
		) {
			router.replace(appRoutes.auth.login);
		}
	}, [ordersQuery.isError, ordersQuery.error, router]);

	if (!ready) {
		return <LoadingScreen />;
	}

	const coursesById: Record<string, OrderCourse> = {};
	for (const course of catalogQuery.data?.courses ?? []) {
		coursesById[course.id] = { title: course.title, slug: course.slug };
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppNav
				displayName={getDisplayName(getUserName())}
				initials={getInitials(getUserName())}
				avatarUrl={currentUserQuery.data?.avatarUrl ?? null}
				active="orders"
			/>
			<EmailVerificationBanner
				unverified={
					currentUserQuery.isSuccess && !currentUserQuery.data.emailVerifiedAt
				}
			/>

			<div className="mx-auto max-w-[860px] px-5 py-11 sm:px-10">
				<h1 className="font-heading text-[34px] font-extralight">
					Minhas compras
				</h1>

				{ordersQuery.isPending ? (
					<p className="py-16 text-center font-sans text-sm font-light text-foreground/50">
						Carregando…
					</p>
				) : ordersQuery.isError ? (
					<div className="flex flex-col items-center gap-4 py-16 text-center">
						<p className="font-sans text-sm font-light text-foreground/60">
							Não foi possível carregar suas compras agora.
						</p>
						<button
							type="button"
							onClick={() => ordersQuery.refetch()}
							className="rounded-full border border-foreground/20 px-6 py-3 font-sans text-[13px] text-foreground"
						>
							Tentar novamente
						</button>
					</div>
				) : (
					<div className="mt-6">
						<OrdersList orders={ordersQuery.data} coursesById={coursesById} />
					</div>
				)}
			</div>
		</div>
	);
}

export { OrdersPage };
