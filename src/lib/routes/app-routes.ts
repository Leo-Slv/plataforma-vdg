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
} as const;

export { appRoutes };
