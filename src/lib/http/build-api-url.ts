import { env } from '@/lib/env';

function buildApiUrl(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${env.apiUrl.replace(/\/$/, '')}${normalizedPath}`;
}

export { buildApiUrl };
