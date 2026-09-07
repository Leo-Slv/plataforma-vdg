/**
 * Mirrors the backend's Slug value object pattern
 * (CourseCore/Shared/Domain/ValueObjects/Slug.cs:
 * `^[a-z0-9]+(?:-[a-z0-9]+)*$`) so a slug generated here always passes
 * backend validation.
 */
function slugify(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export { slugify };
