import type { z } from 'zod';

import type { accessRequestSchema } from '@/features/admin/schemas/access-request.schema';

type AccessRequest = z.infer<typeof accessRequestSchema>;

export type { AccessRequest };
