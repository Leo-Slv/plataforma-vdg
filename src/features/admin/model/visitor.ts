import type { z } from 'zod';

import type {
	visitorSchema,
	pagedVisitorsSchema,
} from '@/features/admin/schemas/visitor.schema';

type Visitor = z.infer<typeof visitorSchema>;
type PagedVisitors = z.infer<typeof pagedVisitorsSchema>;
type VisitorContactFilter = 'all' | 'pending' | 'contacted';

export type { Visitor, PagedVisitors, VisitorContactFilter };
