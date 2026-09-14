'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { getAccessToken } from '@/lib/auth/access-token';

/**
 * Every authenticated screen gates its first paint on this hook, so it's
 * also where a minimum screen-to-screen loading time lives — without it,
 * an already-cached page would flash LoadingScreen for a single frame
 * instead of a perceivable, consistent transition.
 */
const MIN_LOADING_MS = 700;

function useRequireAuth() {
	const router = useRouter();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!getAccessToken()) {
			router.replace(appRoutes.auth.login);
			return;
		}

		// localStorage doesn't exist during SSR, so this check can only
		// happen after mount — deferring it to render instead would make
		// the server/client first paint disagree.
		const timeoutId = setTimeout(() => {
			setReady(true);
		}, MIN_LOADING_MS);

		return () => clearTimeout(timeoutId);
	}, [router]);

	return ready;
}

export { useRequireAuth };
