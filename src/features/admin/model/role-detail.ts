import type { z } from 'zod';

import type {
	permissionSchema,
	roleDetailSchema,
} from '@/features/admin/schemas/role-detail.schema';

type RoleDetail = z.infer<typeof roleDetailSchema>;
type Permission = z.infer<typeof permissionSchema>;

export type { Permission, RoleDetail };
