import { z } from 'zod';

const auditLogSchema = z.object({
	id: z.string(),
	userId: z.string().nullable(),
	action: z.string(),
	entityName: z.string(),
	entityId: z.string().nullable(),
	metadata: z.record(z.string(), z.string()),
	createdAt: z.string(),
});

const pagedAuditLogSchema = z.object({
	items: z.array(auditLogSchema),
	page: z.number(),
	pageSize: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

export { auditLogSchema, pagedAuditLogSchema };
