/**
 * Mirrors the backend's `permission` claim values exactly
 * (CourseCore/Modules/Auth/Application/Constants/AuthPermissionNames.cs).
 * These are the JWT claim strings, not the ASP.NET policy names they back
 * (e.g. the `ManageAreas` policy is granted by the `"areas.manage"` claim).
 */
const authPermissions = {
	manageUsers: 'users.manage',
	manageRoles: 'roles.manage',
	manageAreas: 'areas.manage',
	manageCourses: 'courses.manage',
	manageVideos: 'videos.manage',
	readProgress: 'progress.read',
	readAudit: 'audit.read',
} as const;

export { authPermissions };
