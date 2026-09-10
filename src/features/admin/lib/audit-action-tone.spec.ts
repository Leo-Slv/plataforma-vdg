import assert from 'node:assert/strict';
import { test } from 'node:test';

import { auditActionTone } from '@/features/admin/lib/audit-action-tone';

test('renders destructive-sounding actions as destructive', () => {
	assert.equal(auditActionTone('CourseUnpublished'), 'destructive');
	assert.equal(auditActionTone('UserAreaAccessRevoked'), 'destructive');
	assert.equal(auditActionTone('LessonDeleted'), 'destructive');
	assert.equal(auditActionTone('VideoRemoved'), 'destructive');
	assert.equal(auditActionTone('VideoUnlisted'), 'destructive');
});

test('renders everything else as neutral', () => {
	assert.equal(auditActionTone('CoursePublished'), 'neutral');
	assert.equal(auditActionTone('UserAreaAccessGranted'), 'neutral');
	assert.equal(auditActionTone('VideoCreated'), 'neutral');
	assert.equal(auditActionTone('LoginSucceeded'), 'neutral');
});
