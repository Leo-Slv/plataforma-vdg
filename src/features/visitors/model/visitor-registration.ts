import type { z } from 'zod';

import type { visitorRegistrationSchema } from '@/features/visitors/schemas/visitor-registration.schema';

type VisitorRegistration = z.infer<typeof visitorRegistrationSchema>;

export type { VisitorRegistration };
