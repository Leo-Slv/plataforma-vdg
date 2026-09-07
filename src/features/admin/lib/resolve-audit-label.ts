import type { AuditLog } from '@/features/admin/model/audit-log';
import type { Course } from '@/features/admin/model/course';
import type { Area } from '@/features/admin/model/area';

/**
 * The backend's audit log stores only ids (see
 * Docs/backend-pendencies/admin/courses-panel.md, pendency 4) — this
 * resolves a display name only when the referenced entity is already
 * loaded on this page (courses, areas), falling back to a short id
 * otherwise. Best-effort by design, not an attempt at full coverage.
 */
function resolveAuditLabel(
	entry: AuditLog,
	courses: Course[],
	areas: Area[],
): string {
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
