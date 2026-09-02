import { QueryClient } from '@tanstack/react-query';

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				retry: 1,
			},
		},
	});
}

export { createQueryClient };
