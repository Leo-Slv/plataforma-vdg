import { z } from 'zod';

const courseFormSchema = z
	.object({
		title: z.string().trim().min(1, 'Informe o título do curso.'),
		// The API requires a description (1 to 2000 characters) when creating a course.
		description: z
			.string()
			.trim()
			.min(1, 'Informe a descrição do curso.')
			.max(2000, 'A descrição pode ter no máximo 2000 caracteres.'),
		thumbnailUrl: z.string().trim(),
		pricingModel: z.enum(['Free', 'Paid', 'EnrollmentControlled']),
		priceAmount: z.string().trim(),
		areaId: z.string().min(1, 'Selecione uma área.'),
		displayOrder: z
			.number()
			.int('Use um número inteiro.')
			.min(0, 'Use um número maior ou igual a 0.'),
		issuesCertificate: z.boolean(),
		isFeatured: z.boolean(),
		published: z.boolean(),
	})
	.superRefine((values, ctx) => {
		if (values.pricingModel !== 'Paid') {
			return;
		}

		const amount = Number(values.priceAmount);
		if (!values.priceAmount || Number.isNaN(amount) || amount <= 0) {
			ctx.addIssue({
				code: 'custom',
				path: ['priceAmount'],
				message: 'Informe um valor válido.',
			});
		}
	});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export { courseFormSchema };
export type { CourseFormValues };
