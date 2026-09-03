const appRoutes = {
	system: {
		home: '/',
	},
	auth: {
		login: '/login',
		register: '/register',
		confirmEmail: '/confirm-email',
	},
	catalog: {
		index: '/catalog',
	},
} as const;

export { appRoutes };
