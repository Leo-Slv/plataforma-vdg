import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getCourseCatalog } from '@/features/catalog/api/get-course-catalog';
import { getCourseDetails } from '@/features/catalog/api/get-course-details';

function useCourseCatalogQuery(options: { enabled: boolean }) {
	return useQuery({
		queryKey: queryKeys.catalog.list,
		queryFn: getCourseCatalog,
		enabled: options.enabled,
	});
}

function useCourseDetailsQuery(
	courseId: string,
	options: { enabled: boolean },
) {
	return useQuery({
		queryKey: queryKeys.catalog.detail(courseId),
		queryFn: () => getCourseDetails(courseId),
		enabled: options.enabled && courseId.length > 0,
	});
}

export { useCourseCatalogQuery, useCourseDetailsQuery };
