const ROW_STAGGER_STEP_SECONDS = 0.035;
const ROW_STAGGER_MAX_DELAY_SECONDS = 0.6;

/**
 * Cascade entrance for table rows: each row fades/slides in slightly after
 * the previous one, capped so a long page doesn't leave the last rows
 * waiting a full second to appear.
 */
function rowEnterAnimation(index: number) {
	return {
		initial: { opacity: 0, y: 6 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0 },
		transition: {
			duration: 0.25,
			delay: Math.min(
				index * ROW_STAGGER_STEP_SECONDS,
				ROW_STAGGER_MAX_DELAY_SECONDS,
			),
		},
	};
}

export { rowEnterAnimation };
