import { z } from 'zod';

const roleSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export { roleSchema };
