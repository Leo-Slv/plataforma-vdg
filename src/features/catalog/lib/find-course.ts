import type {
	AreaSummary,
	CourseCatalogItem,
} from '@/features/catalog/model/course-catalog';

function findCourseBySlug(
	courses: CourseCatalogItem[],
	slug: string,
): CourseCatalogItem | undefined {
	return courses.find((course) => course.slug === slug);
}

function findPrimaryAreaName(
	areas: AreaSummary[],
	course: CourseCatalogItem,
): string | null {
	return areas.find((area) => course.areaIds.includes(area.id))?.name ?? null;
}

export { findCourseBySlug, findPrimaryAreaName };
