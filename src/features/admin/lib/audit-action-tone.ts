const DESTRUCTIVE_SUBSTRINGS = [
	'Unpublish',
	'Revoke',
	'Delete',
	'Remove',
	'Unlist',
];

/**
 * The mockup colors individual action rows inconsistently (e.g.
 * TestimonialPublished renders neutral while CoursePublished renders
 * accent-blue, no stated rule). This substring heuristic is the closest
 * consistent approximation: destructive-sounding actions get the same
 * muted-red tone used elsewhere for destructive affordances, everything
 * else stays neutral.
 */
function auditActionTone(action: string): 'destructive' | 'neutral' {
	return DESTRUCTIVE_SUBSTRINGS.some((substring) => action.includes(substring))
		? 'destructive'
		: 'neutral';
}

export { auditActionTone };
