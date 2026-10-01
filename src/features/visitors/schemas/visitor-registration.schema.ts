import { z } from 'zod';

// CourseCore deliberately echoes no personal data back — only the new
// record's id and timestamp.
const visitorRegistrationSchema = z.object({
	id: z.string(),
	submittedAt: z.string(),
});

export { visitorRegistrationSchema };
