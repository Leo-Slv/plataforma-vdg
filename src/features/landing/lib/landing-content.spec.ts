import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	howItWorksSteps,
} from '@/features/landing/lib/landing-content';

test('howItWorksSteps has the three onboarding steps from the mockup', () => {
	assert.equal(howItWorksSteps.length, 3);
	assert.deepEqual(
		howItWorksSteps.map((step) => step.step),
		['01', '02', '03'],
	);
});
