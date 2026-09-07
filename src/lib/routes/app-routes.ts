const appRoutes = {
	system: {
		home: '/',
	},
	auth: {
		login: '/login',
		register: '/register',
		confirmEmail: '/confirm-email',
		forgotPassword: '/forgot-password',
		changeEmail: '/change-email',
	},
	catalog: {
		index: '/catalog',
	},
	myCourses: {
		index: '/my-courses',
	},
	courses: {
		detail: (slug: string) => `/courses/${slug}`,
		lesson: (slug: string, lessonId: string) =>
			`/courses/${slug}/lessons/${lessonId}`,
	},
	admin: {
		areas: '/admin/areas',
		areaNew: '/admin/areas/new',
		areaEdit: (areaId: string) => `/admin/areas/${areaId}/edit`,
		courses: '/admin/courses',
	},
} as const;

export { appRoutes };
