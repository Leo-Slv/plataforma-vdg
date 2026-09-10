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
	testimonials: {
		new: (courseId: string) => `/testimonials/new?courseId=${courseId}`,
	},
	profile: {
		index: '/profile',
	},
	courses: {
		detail: (slug: string) => `/courses/${slug}`,
		lesson: (slug: string, lessonId: string) =>
			`/courses/${slug}/lessons/${lessonId}`,
	},
	admin: {
		audit: '/admin/audit',
		areas: '/admin/areas',
		areaNew: '/admin/areas/new',
		areaEdit: (areaId: string) => `/admin/areas/${areaId}/edit`,
		courses: '/admin/courses',
		courseNew: '/admin/courses/new',
		courseEdit: (courseId: string) => `/admin/courses/${courseId}/edit`,
		courseModules: (courseId: string) => `/admin/courses/${courseId}/modules`,
		lessonEdit: (courseId: string, moduleId: string, lessonId: string) =>
			`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`,
		users: '/admin/users',
		userEdit: (userId: string) => `/admin/users/${userId}/edit`,
		videos: '/admin/videos',
	},
} as const;

export { appRoutes };
