import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { createCheckout } from '@/features/payments/api/create-checkout';
import { getMyOrders } from '@/features/payments/api/get-my-orders';
import type { Order } from '@/features/payments/model/order';

function useCreateCheckoutMutation() {
	return useMutation({
		mutationFn: createCheckout,
	});
}

function useMyOrdersQuery(options: {
	enabled: boolean;
	refetchInterval?:
		| number
		| false
		| ((orders: Order[] | undefined, fetchCount: number) => number | false);
}) {
	const { refetchInterval = false } = options;

	return useQuery({
		queryKey: queryKeys.payments.orders,
		// The poll is capped at 30s; keep it running if the user switches tabs.
		refetchIntervalInBackground: true,
		queryFn: getMyOrders,
		enabled: options.enabled,
		refetchInterval:
			typeof refetchInterval === 'function'
				? (query) =>
						refetchInterval(query.state.data, query.state.dataUpdateCount)
				: refetchInterval,
	});
}

export { useCreateCheckoutMutation, useMyOrdersQuery };
