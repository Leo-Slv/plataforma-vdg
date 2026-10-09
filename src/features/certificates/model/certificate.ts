import type { z } from 'zod';

import type { certificateSchema } from '@/features/certificates/schemas/certificate.schema';

type Certificate = z.infer<typeof certificateSchema>;

export type { Certificate };
