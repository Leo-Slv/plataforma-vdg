'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { appRoutes } from '@/lib/routes/app-routes';
import { queryKeys } from '@/lib/constants/query-keys';
import { getUserName } from '@/lib/auth/access-token';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { AppNav } from '@/components/app-nav';
import { LoadingScreen } from '@/components/loading-screen';
import { useCurrentUserQuery } from '@/features/auth/hooks/auth.queries';
import { useCourseCatalogQuery } from '@/features/catalog/hooks/catalog.queries';
import {
	getDisplayName,
	getInitials,
} from '@/features/catalog/lib/user-display';
import { useMyOrdersQuery } from '@/features/payments/hooks/payments.queries';
import { CheckoutResult } from '@/features/payments/components/checkout-result';
import { deriveCheckoutView } from '@/features/payments/lib/checkout-view';
import {
	nextPollDelay,
	POLL_INTERVAL_MS,
	POLL_TIMEOUT_MS,
} from '@/features/payments/lib/poll-order';

function CheckoutSuccessPage() {
	const orderId = useSearchParams().get('orderId') || null;
	const ready = useRequireAuth();
	const queryClient = useQueryClient();
	const [timedOut, setTimedOut] = useState(false);

	const currentUserQuery = useCurrentUserQuery({ enabled: ready });
	const catalogQuery = useCourseCatalogQuery({ enabled: ready });
	const ordersQuery = useMyOrdersQuery({
		enabled: ready && Boolean(orderId),
		// The webhook that grants access can land a moment after the redirect,
		// so keep asking until the order settles (or the wait times out).
		refetchInterval: (orders, fetchCount) =>
			orderId
				? nextPollDelay(orders, orderId, fetchCount * POLL_INTERVAL_MS)
				: false,
	});

	useEffect(() => {
		const timeoutId = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
		return () => clearTimeout(timeoutId);
	}, []);

	const order = ordersQuery.data?.find((candidate) => candidate.id === orderId);
	const isPaid = order?.status === 'Paid';

	useEffect(() => {
		if (isPaid) {
			// Access just changed: drop the cached catalog/detail so the course
			// shows up unlocked in the catalog, "Meus cursos" and its own page.
			queryClient.invalidateQueries({ queryKey: queryKeys.catalog.list });
			queryClient.invalidateQueries({ queryKey: ['catalog', 'detail'] });
		}
	}, [isPaid, queryClient]);

	if (!ready) {
		return <LoadingScreen />;
	}

	const view = deriveCheckoutView({
		orderId,
		orders: ordersQuery.data,
		isLoading: Boolean(orderId) && ordersQuery.isPending,
		hasError: ordersQuery.isError,
		timedOut,
	});
	const course = order
		? catalogQuery.data?.courses.find(
				(candidate) => candidate.id === order.courseId,
			)
		: undefined;

	return (
		<div className="min-h-screen bg-background text-foreground">
			<AppNav
				displayName={getDisplayName(getUserName())}
				initials={getInitials(getUserName())}
				avatarUrl={currentUserQuery.data?.avatarUrl ?? null}
				active="catalog"
			/>
			<CheckoutResult
				view={view}
				courseTitle={course?.title ?? null}
				courseHref={course ? appRoutes.courses.detail(course.slug) : null}
				onRetry={() => {
					setTimedOut(false);
					ordersQuery.refetch();
				}}
			/>
		</div>
	);
}

export { CheckoutSuccessPage };
