import type {
	AreaSummary,
	CourseCatalogItem,
} from '@/features/catalog/model/course-catalog';

type FilterCoursesOptions = {
	areaId: string | null;
	search: string;
};

function filterCourses(
	courses: CourseCatalogItem[],
	{ areaId, search }: FilterCoursesOptions,
): CourseCatalogItem[] {
	const normalizedSearch = search.trim().toLowerCase();

	return courses.filter((course) => {
		const matchesArea = !areaId || course.areaIds.includes(areaId);
		const matchesSearch =
			!normalizedSearch ||
			course.title.toLowerCase().includes(normalizedSearch);
		return matchesArea && matchesSearch;
	});
}

type AreaGroup = {
	area: AreaSummary;
	courses: CourseCatalogItem[];
};

function groupCoursesByArea(
	areas: AreaSummary[],
	courses: CourseCatalogItem[],
): AreaGroup[] {
	return areas
		.map((area) => ({
			area,
			courses: courses.filter((course) => course.areaIds.includes(area.id)),
		}))
		.filter((group) => group.courses.length > 0);
}

export { filterCourses, groupCoursesByArea };
export type { AreaGroup };
