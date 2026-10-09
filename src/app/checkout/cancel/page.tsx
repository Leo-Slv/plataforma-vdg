import { Suspense } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { CheckoutCancelPage } from '@/features/payments/components/checkout-cancel-page';

export default function CheckoutCancel() {
	return (
		<Suspense fallback={<LoadingScreen />}>
			<CheckoutCancelPage />
		</Suspense>
	);
}
