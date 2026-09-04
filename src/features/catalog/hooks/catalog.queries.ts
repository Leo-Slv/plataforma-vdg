import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getCourseCatalog } from '@/features/catalog/api/get-course-catalog';

function useCourseCatalogQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.catalog.list,
		queryFn: getCourseCatalog,
		enabled: options.enabled,
	});
}

export { useCourseCatalogQuery };
