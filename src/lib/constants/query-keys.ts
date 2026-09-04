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
} as const;

export { queryKeys };
