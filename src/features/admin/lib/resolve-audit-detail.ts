import type { AuditLog } from '@/features/admin/model/audit-log';
import type { Course } from '@/features/admin/model/course';
import type { Area } from '@/features/admin/model/area';

/**
 * Same resolution order as resolve-audit-label.ts, but for a dedicated
 * "Detalhe" column that already has its own "Ação" column next to it —
 * returns just the detail, no `{action} ·` prefix. Kept as a separate
 * function rather than reusing/changing resolve-audit-label.ts, which
 * the embedded /admin/courses preview still relies on as-is.
 */
function resolveAuditDetail(
	entry: AuditLog,
	courses: Course[],
	areas: Area[],
): string {
	const displayName = entry.metadata.displayName;
	if (displayName) {
		return displayName;
	}

	if (entry.entityName === 'Course' && entry.entityId) {
		const course = courses.find((item) => item.id === entry.entityId);
		if (course) {
			return course.title;
		}
	}

	if (entry.entityName === 'Area' && entry.entityId) {
		const area = areas.find((item) => item.id === entry.entityId);
		if (area) {
			return area.name;
		}
	}

	if (!entry.entityId) {
		return '—';
	}

	return `${entry.entityName} #${entry.entityId.slice(0, 8)}`;
}

export { resolveAuditDetail };
