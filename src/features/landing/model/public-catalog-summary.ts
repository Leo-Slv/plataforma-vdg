import type { z } from 'zod';

import type {
	publicFeaturedCourseSchema,
	publicAreaSummarySchema,
	publicCatalogSummarySchema,
} from '@/features/landing/schemas/public-catalog-summary.schema';

type PublicFeaturedCourse = z.infer<typeof publicFeaturedCourseSchema>;
type PublicAreaSummary = z.infer<typeof publicAreaSummarySchema>;
type PublicCatalogSummary = z.infer<typeof publicCatalogSummarySchema>;

export type { PublicFeaturedCourse, PublicAreaSummary, PublicCatalogSummary };
