import type { z } from 'zod';

import type { testimonialSchema } from '@/features/landing/schemas/testimonial.schema';

type Testimonial = z.infer<typeof testimonialSchema>;

export type { Testimonial };
