import { appRoutes } from '@/lib/routes/app-routes';
import { authPermissions } from '@/lib/auth/auth-permissions';
import { hasPermission, isAdmin } from '@/lib/auth/jwt-claims';

type AdminNavKey =
	| 'courses'
	| 'areas'
	| 'users'
	| 'videos'
	| 'audit'
	| 'testimonials'
	| 'visitors'
	| 'roles';

type AdminNavItem = {
	label: string;
	key: AdminNavKey;
	href: string;
	/** Backend permission that unlocks the screen; `null` means Admin role only. */
	permission: string | null;
};

type Claims = Record<string, unknown> | null;

// Order is the order shown in the sidebar and also the order used to pick the
// first screen a staff member lands on.
const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
	{
		label: 'Cursos',
		key: 'courses',
		href: appRoutes.admin.courses,
		permission: authPermissions.manageCourses,
	},
	{
		label: 'Áreas',
		key: 'areas',
		href: appRoutes.admin.areas,
		permission: authPermissions.manageAreas,
	},
	{
		label: 'Usuários',
		key: 'users',
		href: appRoutes.admin.users,
		permission: authPermissions.manageUsers,
	},
	{
		label: 'Vídeos',
		key: 'videos',
		href: appRoutes.admin.videos,
		permission: authPermissions.manageVideos,
	},
	{
		label: 'Auditoria',
		key: 'audit',
		href: appRoutes.admin.audit,
		permission: authPermissions.readAudit,
	},
	{
		label: 'Depoimentos',
		key: 'testimonials',
		href: appRoutes.admin.testimonials,
		permission: authPermissions.manageCourses,
	},
	{
		label: 'Primeira vez',
		key: 'visitors',
		href: appRoutes.admin.visitors,
		permission: authPermissions.readVisitors,
	},
	{
		label: 'Permissões',
		key: 'roles',
		href: appRoutes.admin.roles,
		permission: null,
	},
];

function canSeeNavItem(item: AdminNavItem, claims: Claims) {
	return item.permission === null
		? isAdmin(claims)
		: hasPermission(claims, item.permission);
}

/** Only the backoffice screens the signed-in staff member can actually open. */
function getAdminNavItems(claims: Claims): AdminNavItem[] {
	return ADMIN_NAV_ITEMS.filter((item) => canSeeNavItem(item, claims));
}

/** First screen the user may open, or `null` when they are not backoffice staff. */
function getAdminHomeRoute(claims: Claims): string | null {
	return getAdminNavItems(claims)[0]?.href ?? null;
}

export { getAdminHomeRoute, getAdminNavItems };
export type { AdminNavItem, AdminNavKey };
