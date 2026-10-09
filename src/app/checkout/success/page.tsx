import { Suspense } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { CheckoutSuccessPage } from '@/features/payments/components/checkout-success-page';

export default function CheckoutSuccess() {
	// The client component reads ?orderId= via useSearchParams, which needs a
	// Suspense boundary to keep the route statically renderable.
	return (
		<Suspense fallback={<LoadingScreen />}>
			<CheckoutSuccessPage />
		</Suspense>
	);
}
