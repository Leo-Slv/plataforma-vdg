import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { courseModuleSchema } from '@/features/admin/schemas/course-module.schema';
import type { CourseModule } from '@/features/admin/model/course-module';

async function getCourseModules(courseId: string): Promise<CourseModule[]> {
	const data = await apiFetch(`/api/courses/${courseId}/modules`);
	return z.array(courseModuleSchema).parse(data);
}

export { getCourseModules };
