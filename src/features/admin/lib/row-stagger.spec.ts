import { test } from 'node:test';
import assert from 'node:assert/strict';

import { rowEnterAnimation } from '@/features/admin/lib/row-stagger';

test('delay grows linearly with the row index', () => {
	assert.equal(rowEnterAnimation(0).transition.delay, 0);
	assert.equal(rowEnterAnimation(1).transition.delay, 0.035);
	assert.equal(rowEnterAnimation(2).transition.delay, 0.07);
});

test('delay is capped so a long page does not stagger forever', () => {
	assert.equal(rowEnterAnimation(100).transition.delay, 0.6);
	assert.equal(rowEnterAnimation(1000).transition.delay, 0.6);
});

test('animates from a slight vertical offset into place', () => {
	const animation = rowEnterAnimation(0);
	assert.deepEqual(animation.initial, { opacity: 0, y: 6 });
	assert.deepEqual(animation.animate, { opacity: 1, y: 0 });
});
