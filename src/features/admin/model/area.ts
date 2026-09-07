import type { z } from 'zod';

import type { areaSchema } from '@/features/admin/schemas/area.schema';

type Area = z.infer<typeof areaSchema>;

export type { Area };
