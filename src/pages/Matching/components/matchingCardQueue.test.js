import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getActionTransition,
  getCircularIndex,
  getPreservedIndex,
} from './matchingCardQueue.js';

test('left swipe advances to the right neighbor and wraps at the end', () => {
  assert.equal(getCircularIndex(1, 1, 3), 2);
  assert.equal(getCircularIndex(2, 1, 3), 0);
});

test('right swipe moves to the left neighbor and wraps at the start', () => {
  assert.equal(getCircularIndex(1, -1, 3), 0);
  assert.equal(getCircularIndex(0, -1, 3), 2);
});

test('empty and single-card queues remain stable', () => {
  assert.equal(getCircularIndex(0, 1, 0), 0);
  assert.equal(getCircularIndex(0, -1, 1), 0);
});

test('preserves the active user across refreshed people', () => {
  const people = [{ userId: 30 }, { userId: 10 }, { userId: 20 }];
  assert.equal(getPreservedIndex(people, 20, 0), 2);
});

test('clamps the fallback when the active user disappeared', () => {
  assert.equal(getPreservedIndex([{ userId: 10 }, { userId: 20 }], 30, 2), 1);
  assert.equal(getPreservedIndex([], 30, 2), 0);
});

test('reject exits upward and removes the card while heart stays in place', () => {
  assert.deepEqual(getActionTransition('REJECT'), {
    exit: 'up',
    removeCurrent: true,
    refreshOnly: false,
  });
  assert.deepEqual(getActionTransition('HEART'), {
    exit: 'none',
    removeCurrent: false,
    refreshOnly: true,
  });
});
