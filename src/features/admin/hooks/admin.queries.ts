import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getAreas } from '@/features/admin/api/get-areas';

function useAreasQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.admin.areas,
		queryFn: getAreas,
		enabled: options.enabled,
	});
}

export { useAreasQuery };
