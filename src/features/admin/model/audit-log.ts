import type { z } from 'zod';

import type {
	auditLogSchema,
	pagedAuditLogSchema,
} from '@/features/admin/schemas/audit-log.schema';

type AuditLog = z.infer<typeof auditLogSchema>;
type PagedAuditLog = z.infer<typeof pagedAuditLogSchema>;

export type { AuditLog, PagedAuditLog };
