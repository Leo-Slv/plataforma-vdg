import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	cardEnterAnimation,
	cardScrollRevealAnimation,
} from '@/lib/motion/card-reveal';

test('cardEnterAnimation: delay grows linearly with the card index', () => {
	assert.equal(cardEnterAnimation(0).transition.delay, 0);
	assert.equal(cardEnterAnimation(1).transition.delay, 0.06);
	assert.equal(cardEnterAnimation(2).transition.delay, 0.12);
});

test('cardEnterAnimation: delay is capped for long grids', () => {
	assert.equal(cardEnterAnimation(100).transition.delay, 0.6);
});

test('cardEnterAnimation: fades up from a slight vertical offset', () => {
	const animation = cardEnterAnimation(0);
	assert.deepEqual(animation.initial, { opacity: 0, y: 16 });
	assert.deepEqual(animation.animate, { opacity: 1, y: 0 });
});

test('cardScrollRevealAnimation: reveals via whileInView, once, with the same stagger', () => {
	const animation = cardScrollRevealAnimation(1);
	assert.deepEqual(animation.initial, { opacity: 0, y: 16 });
	assert.deepEqual(animation.whileInView, { opacity: 1, y: 0 });
	assert.deepEqual(animation.viewport, { once: true, amount: 0.2 });
	assert.equal(animation.transition.delay, 0.06);
});
