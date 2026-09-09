import type { AuditLog } from '@/features/admin/model/audit-log';
import type { Course } from '@/features/admin/model/course';
import type { Area } from '@/features/admin/model/area';

/**
 * As of 2026-09-09 the backend includes a human-readable `displayName` in
 * `metadata` for most action types (see
 * Docs/backend-pendencies/2026-09-09-backend-changes-for-frontend.md, #3).
 * Not covered: the 9 Auth-module actions and the secondary
 * UserTokenVersionIncremented/UserSessionsRevoked entries — those still
 * fall back to a locally-resolved title (courses, areas already loaded on
 * this page) or, failing that, a short id.
 */
function resolveAuditLabel(
	entry: AuditLog,
	courses: Course[],
	areas: Area[],
): string {
	const displayName = entry.metadata.displayName;
	if (displayName) {
		return `${entry.action} · ${displayName}`;
	}

	if (entry.entityName === 'Course' && entry.entityId) {
		const course = courses.find((item) => item.id === entry.entityId);
		if (course) {
			return `${entry.action} · ${course.title}`;
		}
	}

	if (entry.entityName === 'Area' && entry.entityId) {
		const area = areas.find((item) => item.id === entry.entityId);
		if (area) {
			return `${entry.action} · ${area.name}`;
		}
	}

	if (!entry.entityId) {
		return entry.action;
	}

	return `${entry.action} · ${entry.entityName} #${entry.entityId.slice(0, 8)}`;
}

export { resolveAuditLabel };
