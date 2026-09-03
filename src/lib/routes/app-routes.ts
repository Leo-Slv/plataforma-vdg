const appRoutes = {
	system: {
		home: '/',
	},
	auth: {
		login: '/login',
		register: '/register',
		confirmEmail: '/confirm-email',
		forgotPassword: '/forgot-password',
	},
	catalog: {
		index: '/catalog',
	},
} as const;

export { appRoutes };
