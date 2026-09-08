import type { z } from 'zod';

import type { areaAccessSchema } from '@/features/admin/schemas/area-access.schema';

type AreaAccess = z.infer<typeof areaAccessSchema>;

export type { AreaAccess };
