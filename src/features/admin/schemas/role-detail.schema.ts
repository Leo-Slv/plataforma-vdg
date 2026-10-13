import { z } from 'zod';

const roleDetailSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	active: z.boolean(),
	isSystem: z.boolean(),
	memberCount: z.number(),
	permissionKeys: z.array(z.string()),
});

const permissionSchema = z.object({
	id: z.string(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
});

export { permissionSchema, roleDetailSchema };
