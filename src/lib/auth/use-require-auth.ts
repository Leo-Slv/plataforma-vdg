'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { appRoutes } from '@/lib/routes/app-routes';
import { getAccessToken } from '@/lib/auth/access-token';

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
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setReady(true);
	}, [router]);

	return ready;
}

export { useRequireAuth };
