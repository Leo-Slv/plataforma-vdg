import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getMyCertificates } from '@/features/certificates/api/get-my-certificates';

function useMyCertificatesQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.certificates.mine,
		queryFn: getMyCertificates,
		enabled: options.enabled,
	});
}

export { useMyCertificatesQuery };
