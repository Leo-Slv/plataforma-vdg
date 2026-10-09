import type { z } from 'zod';

import type { accessRequestSchema } from '@/features/catalog/schemas/access-request.schema';

type AccessRequest = z.infer<typeof accessRequestSchema>;

export type { AccessRequest };
