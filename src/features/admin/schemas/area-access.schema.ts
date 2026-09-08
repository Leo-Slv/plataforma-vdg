import { z } from 'zod';

const areaAccessSchema = z.object({
	areaId: z.string(),
	canView: z.boolean(),
	canManage: z.boolean(),
});

export { areaAccessSchema };
