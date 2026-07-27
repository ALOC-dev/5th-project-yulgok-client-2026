import assert from 'node:assert/strict';
import test from 'node:test';

import { getActionTransition } from './matchingCardQueue.js';

test('button actions do not share horizontal swipe navigation', () => {
  assert.equal(getActionTransition('REJECT').exit, 'up');
  assert.equal(getActionTransition('HEART').exit, 'none');
});
