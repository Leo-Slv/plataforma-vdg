import { apiFetch } from '@/lib/http/api-client';
import { courseSchema } from '@/features/admin/schemas/course.schema';
import type { Course } from '@/features/admin/model/course';
import type { PricingModel } from '@/features/admin/lib/resolve-price-amount';

type CreateCoursePayload = {
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

async function createCourse(payload: CreateCoursePayload): Promise<Course> {
	const data = await apiFetch('/api/courses', {
		method: 'POST',
		body: { ...payload, modules: [] },
	});
	return courseSchema.parse(data);
}

export { createCourse };
export type { CreateCoursePayload };
