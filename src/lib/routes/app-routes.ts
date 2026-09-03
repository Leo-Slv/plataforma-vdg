const appRoutes = {
	system: {
		home: '/',
	},
	auth: {
		login: '/login',
		register: '/register',
	},
	catalog: {
		index: '/catalog',
	},
} as const;

export { appRoutes };
