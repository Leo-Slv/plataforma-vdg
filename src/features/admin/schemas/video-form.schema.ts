import { z } from 'zod';

const durationMinutesSchema = z
	.string()
	.trim()
	.superRefine((value, ctx) => {
		const minutes = Number(value);
		if (!value || !Number.isInteger(minutes) || minutes <= 0) {
			ctx.addIssue({
				code: 'custom',
				message: 'Informe a duração em minutos.',
			});
		}
	});

const youtubeVideoFormSchema = z.object({
	storageProvider: z.literal('YouTube'),
	title: z.string().trim().min(1, 'Informe o título do vídeo.'),
	description: z.string().trim(),
	youtubeVideoId: z.string().trim().min(1, 'Informe o ID do vídeo do YouTube.'),
	durationMinutes: durationMinutesSchema,
});

const internalVideoFormSchema = z.object({
	storageProvider: z.literal('S3'),
	title: z.string().trim().min(1, 'Informe o título do vídeo.'),
	description: z.string().trim(),
	file: z
		.instanceof(File, { message: 'Selecione um arquivo de vídeo.' })
		.nullable(),
	durationMinutes: durationMinutesSchema,
});

const videoFormSchema = z
	.discriminatedUnion('storageProvider', [
		youtubeVideoFormSchema,
		internalVideoFormSchema,
	])
	.superRefine((values, ctx) => {
		if (values.storageProvider === 'S3' && !values.file) {
			ctx.addIssue({
				code: 'custom',
				path: ['file'],
				message: 'Selecione um arquivo de vídeo.',
			});
		}
	});

type VideoFormValues = z.infer<typeof videoFormSchema>;
type YoutubeVideoFormValues = z.infer<typeof youtubeVideoFormSchema>;
type InternalVideoFormValues = z.infer<typeof internalVideoFormSchema>;

type VideoSubmitValues = {
	title: string;
	description: string;
	storageProvider: 'YouTube' | 'S3';
	storageKey: string;
	durationSeconds: number;
	sizeBytes: number;
	thumbnailUrl: string | null;
};

export { videoFormSchema };
export type {
	VideoFormValues,
	YoutubeVideoFormValues,
	InternalVideoFormValues,
	VideoSubmitValues,
};
