import type { z } from 'zod';

import type { roleSchema } from '@/features/admin/schemas/role.schema';

type Role = z.infer<typeof roleSchema>;

export type { Role };
