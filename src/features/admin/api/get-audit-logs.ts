import { apiFetch } from '@/lib/http/api-client';
import { pagedAuditLogSchema } from '@/features/admin/schemas/audit-log.schema';
import type { PagedAuditLog } from '@/features/admin/model/audit-log';

async function getAuditLogs(
	page: number,
	pageSize: number,
): Promise<PagedAuditLog> {
	const data = await apiFetch(
		`/api/audit-logs?page=${page}&pageSize=${pageSize}`,
	);
	return pagedAuditLogSchema.parse(data);
}

export { getAuditLogs };
