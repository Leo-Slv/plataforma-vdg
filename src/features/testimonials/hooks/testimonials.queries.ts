import { useMutation } from '@tanstack/react-query';

import { submitTestimonial } from '@/features/testimonials/api/submit-testimonial';

function useSubmitTestimonialMutation() {
	return useMutation({
		mutationFn: submitTestimonial,
	});
}

export { useSubmitTestimonialMutation };
