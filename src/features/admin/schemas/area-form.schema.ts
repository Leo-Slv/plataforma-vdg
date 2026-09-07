import { z } from 'zod';

import {
	ACCENT_COLOR_OPTIONS,
	type AccentColorValue,
} from '@/features/admin/lib/accent-color';

const accentColorValues = ACCENT_COLOR_OPTIONS.map(
	(option) => option.value,
) as [AccentColorValue, ...AccentColorValue[]];

const areaFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Informe o nome da área.')
		.max(150, 'Nome muito longo.'),
	description: z.string().trim().max(500, 'Descrição muito longa.'),
	displayOrder: z
		.number()
		.int('Use um número inteiro.')
		.min(0, 'Use um número maior ou igual a 0.'),
	accentColor: z.enum(accentColorValues),
	active: z.boolean(),
});

type AreaFormValues = z.infer<typeof areaFormSchema>;

export { areaFormSchema };
export type { AreaFormValues };
