import { z } from 'zod';

const submitTestimonialFormSchema = z.object({
	quote: z
		.string()
		.trim()
		.min(1, 'Escreva seu depoimento.')
		.max(1000, 'Máximo de 1000 caracteres.'),
});

type SubmitTestimonialFormValues = z.infer<typeof submitTestimonialFormSchema>;

export { submitTestimonialFormSchema };
export type { SubmitTestimonialFormValues };
