'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { decodeAccessTokenClaims, hasPermission } from '@/lib/auth/jwt-claims';

function useRequirePermission(
	permission: string,
	options?: { redirectTo?: string },
) {
	const router = useRouter();
	const authReady = useRequireAuth();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!authReady) {
			return;
		}

		if (!hasPermission(decodeAccessTokenClaims(), permission)) {
			router.replace(options?.redirectTo ?? appRoutes.catalog.index);
			return;
		}

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setReady(true);
	}, [authReady, permission, options?.redirectTo, router]);

	return ready;
}

export { useRequirePermission };
