import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';
import { testimonialSchema } from '@/features/admin/schemas/testimonial.schema';
import type { Testimonial } from '@/features/admin/model/testimonial';

async function getTestimonials(): Promise<Testimonial[]> {
	const data = await apiFetch('/api/testimonials');
	return z.array(testimonialSchema).parse(data);
}

export { getTestimonials };
