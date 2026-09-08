import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';
import { getPublicCatalogSummary } from '@/features/landing/api/get-public-catalog-summary';
import { getPublicTestimonials } from '@/features/landing/api/get-public-testimonials';

function usePublicCatalogSummaryQuery() {
	return useQuery({
		queryKey: queryKeys.landing.catalogSummary,
		queryFn: getPublicCatalogSummary,
	});
}

function usePublicTestimonialsQuery() {
	return useQuery({
		queryKey: queryKeys.landing.testimonials,
		queryFn: getPublicTestimonials,
	});
}

export { usePublicCatalogSummaryQuery, usePublicTestimonialsQuery };
