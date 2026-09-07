import type { Course } from '@/features/admin/model/course';

function sortCoursesByDisplayOrder(courses: Course[]): Course[] {
	return [...courses].sort((a, b) => a.displayOrder - b.displayOrder);
}

export { sortCoursesByDisplayOrder };
