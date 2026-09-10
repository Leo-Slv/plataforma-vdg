import { cn } from '@/lib/utils';
import { resolveAuditDetail } from '@/features/admin/lib/resolve-audit-detail';
import { auditActionTone } from '@/features/admin/lib/audit-action-tone';
import { formatRelativeTime } from '@/features/admin/lib/format-relative-time';
import type { AuditLog } from '@/features/admin/model/audit-log';
import type { Course } from '@/features/admin/model/course';
import type { Area } from '@/features/admin/model/area';

type AuditLogTableProps = {
	entries: AuditLog[];
	courses: Course[];
	areas: Area[];
	userEmailById: Map<string, string>;
	userLookupReady: boolean;
};

const COLUMNS = 'grid-cols-[1.4fr_2fr_1fr_0.9fr]';

function userLabel(
	entry: AuditLog,
	userEmailById: Map<string, string>,
	userLookupReady: boolean,
) {
	if (!entry.userId) {
		return '—';
	}

	const email = userEmailById.get(entry.userId);
	if (email) {
		return email;
	}

	return userLookupReady ? `#${entry.userId.slice(0, 8)}` : '…';
}

function AuditLogTable({
	entries,
	courses,
	areas,
	userEmailById,
	userLookupReady,
}: AuditLogTableProps) {
	if (entries.length === 0) {
		return (
			<p className="py-12 text-center font-sans text-sm font-light text-white/45">
				Nenhuma ação registrada ainda.
			</p>
		);
	}

	const now = new Date();

	return (
		<div>
			<div
				className={cn(
					'grid gap-4 border-b border-white/12 pb-3 font-heading text-[10px] tracking-[0.14em] text-white/40 uppercase',
					COLUMNS,
				)}
			>
				<span>Ação</span>
				<span>Detalhe</span>
				<span>Usuário</span>
				<span>Quando</span>
			</div>

			{entries.map((entry) => (
				<div
					key={entry.id}
					className={cn(
						'grid items-center gap-4 border-b border-white/7 py-4 font-sans text-[13px] text-white/75',
						COLUMNS,
					)}
				>
					<span
						className={cn(
							'font-mono text-[12.5px]',
							auditActionTone(entry.action) === 'destructive'
								? 'text-[oklch(0.65_0.16_25)]'
								: 'text-white/70',
						)}
					>
						{entry.action}
					</span>
					<span className="text-white/55">
						{resolveAuditDetail(entry, courses, areas)}
					</span>
					<span>{userLabel(entry, userEmailById, userLookupReady)}</span>
					<span className="text-white/40">
						{formatRelativeTime(entry.createdAt, now)}
					</span>
				</div>
			))}
		</div>
	);
}

export { AuditLogTable };
