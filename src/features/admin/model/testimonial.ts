import type { z } from 'zod';

import type { testimonialSchema } from '@/features/admin/schemas/testimonial.schema';

type Testimonial = z.infer<typeof testimonialSchema>;

export type { Testimonial };
