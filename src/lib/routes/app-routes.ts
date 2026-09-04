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
	courses: {
		detail: (slug: string) => `/courses/${slug}`,
	},
} as const;

export { appRoutes };
