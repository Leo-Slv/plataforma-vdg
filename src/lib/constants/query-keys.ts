/**
 * Central registry of React Query keys, grouped by feature.
 * Add one namespace per feature under src/features/<feature> as it's built,
 * following the pattern already used by the reference project this repo's
 * architecture is based on (see CLAUDE.md).
 */
const queryKeys = {
	catalog: {
		list: ['catalog', 'list'] as const,
		detail: (courseId: string) => ['catalog', 'detail', courseId] as const,
	},
	progress: {
		course: (courseId: string) => ['progress', 'course', courseId] as const,
	},
	admin: {
		areas: ['admin', 'areas'] as const,
		area: (areaId: string) => ['admin', 'areas', areaId] as const,
		courses: ['admin', 'courses'] as const,
		auditLogs: (page: number, pageSize: number) =>
			['admin', 'audit-logs', page, pageSize] as const,
		courseModules: (courseId: string) =>
			['admin', 'courses', courseId, 'modules'] as const,
		lessonVideo: (lessonId: string) =>
			['admin', 'lessons', lessonId, 'video'] as const,
		users: (page: number, pageSize: number, search: string) =>
			['admin', 'users', page, pageSize, search] as const,
		userAreaAccess: (userId: string) =>
			['admin', 'users', userId, 'area-access'] as const,
		user: (userId: string) => ['admin', 'users', userId] as const,
		grantedCourseAccess: (userId: string) =>
			['admin', 'users', userId, 'granted-courses'] as const,
	},
} as const;

export { queryKeys };
