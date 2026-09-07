import { apiFetch } from '@/lib/http/api-client';
import { courseSchema } from '@/features/admin/schemas/course.schema';
import type { Course } from '@/features/admin/model/course';
import type { PricingModel } from '@/features/admin/lib/resolve-price-amount';

type UpdateCoursePayload = {
	title: string;
	slug: string;
	description: string;
	thumbnailUrl: string | null;
	displayOrder: number;
	pricingModel: PricingModel;
	priceAmount: number | null;
	issuesCertificate: boolean;
	isFeatured: boolean;
	areaIds: string[];
};

async function updateCourse(
	courseId: string,
	payload: UpdateCoursePayload,
): Promise<Course> {
	const data = await apiFetch(`/api/courses/${courseId}`, {
		method: 'PUT',
		body: payload,
	});
	return courseSchema.parse(data);
}

export { updateCourse };
export type { UpdateCoursePayload };
