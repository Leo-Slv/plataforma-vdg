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
} as const;

export { appRoutes };
