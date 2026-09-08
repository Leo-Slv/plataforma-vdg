import type { z } from 'zod';

import type {
	userSchema,
	pagedUsersSchema,
} from '@/features/admin/schemas/user.schema';

type User = z.infer<typeof userSchema>;
type PagedUsers = z.infer<typeof pagedUsersSchema>;

export type { User, PagedUsers };
