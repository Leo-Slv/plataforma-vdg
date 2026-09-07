import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { courseSchema } from '@/features/admin/schemas/course.schema';
import type { Course } from '@/features/admin/model/course';

async function getCourses(): Promise<Course[]> {
	const data = await apiFetch('/api/courses');
	return z.array(courseSchema).parse(data);
}

export { getCourses };
