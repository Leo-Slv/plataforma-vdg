import { z } from 'zod';

const videoFormSchema = z
	.object({
		title: z.string().trim().min(1, 'Informe o título do vídeo.'),
		description: z.string().trim(),
		youtubeVideoId: z
			.string()
			.trim()
			.min(1, 'Informe o ID do vídeo do YouTube.'),
		durationMinutes: z.string().trim(),
		thumbnailUrl: z.string().trim(),
	})
	.superRefine((values, ctx) => {
		const minutes = Number(values.durationMinutes);
		if (!values.durationMinutes || !Number.isInteger(minutes) || minutes <= 0) {
			ctx.addIssue({
				code: 'custom',
				path: ['durationMinutes'],
				message: 'Informe a duração em minutos.',
			});
		}
	});

type VideoFormValues = z.infer<typeof videoFormSchema>;

export { videoFormSchema };
export type { VideoFormValues };
