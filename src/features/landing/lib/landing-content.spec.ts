import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
	featuredCourses,
	howItWorksSteps,
} from '@/features/landing/lib/landing-content';

test('featuredCourses has the three courses from the mockup', () => {
	assert.equal(featuredCourses.length, 3);
	assert.deepEqual(
		featuredCourses.map((course) => course.title),
		['Fundamentos da Fé', 'Curso de Batismo', 'Escola de Líderes'],
	);
	assert.equal(featuredCourses[0].price, 'free');
	assert.equal(featuredCourses[1].price, 'free');
	assert.deepEqual(featuredCourses[2].price, { amountLabel: 'R$ 149' });
});

test('howItWorksSteps has the three onboarding steps from the mockup', () => {
	assert.equal(howItWorksSteps.length, 3);
	assert.deepEqual(
		howItWorksSteps.map((step) => step.step),
		['01', '02', '03'],
	);
});
