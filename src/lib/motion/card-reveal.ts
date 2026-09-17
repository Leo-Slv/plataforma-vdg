const CARD_STAGGER_STEP_SECONDS = 0.06;
const CARD_STAGGER_MAX_DELAY_SECONDS = 0.6;
const CARD_REVEAL_DURATION_SECONDS = 0.4;
const CARD_REVEAL_Y_OFFSET = 16;

function cardRevealDelay(index: number): number {
	return Math.min(
		index * CARD_STAGGER_STEP_SECONDS,
		CARD_STAGGER_MAX_DELAY_SECONDS,
	);
}

/**
 * Staggered fade-up for card grids that mount once their data is ready —
 * no scroll needed to reach them, so the cascade plays right on mount.
 */
function cardEnterAnimation(index: number) {
	return {
		initial: { opacity: 0, y: CARD_REVEAL_Y_OFFSET },
		animate: { opacity: 1, y: 0 },
		transition: {
			duration: CARD_REVEAL_DURATION_SECONDS,
			delay: cardRevealDelay(index),
		},
	};
}

/**
 * Same fade-up, but for card grids further down the page — the cascade
 * plays once, the first time the grid scrolls into view (an
 * IntersectionObserver under the hood via `whileInView`), instead of at
 * mount time.
 */
function cardScrollRevealAnimation(index: number) {
	return {
		initial: { opacity: 0, y: CARD_REVEAL_Y_OFFSET },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true, amount: 0.2 },
		transition: {
			duration: CARD_REVEAL_DURATION_SECONDS,
			delay: cardRevealDelay(index),
		},
	};
}

export { cardEnterAnimation, cardScrollRevealAnimation };
