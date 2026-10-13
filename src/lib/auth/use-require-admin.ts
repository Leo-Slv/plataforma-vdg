'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { useRequireAuth } from '@/lib/auth/use-require-auth';
import { decodeAccessTokenClaims, isAdmin } from '@/lib/auth/jwt-claims';

/**
 * Gate for screens only the main administrator (`Admin` role) may open, such
 * as role/permission management. UI gating only: the backend `AdminOnly`
 * policy is the real boundary.
 */
function useRequireAdmin() {
	const router = useRouter();
	const authReady = useRequireAuth();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!authReady) {
			return;
		}

		if (!isAdmin(decodeAccessTokenClaims())) {
			router.replace(appRoutes.catalog.index);
			return;
		}

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setReady(true);
	}, [authReady, router]);

	return ready;
}

export { useRequireAdmin };
