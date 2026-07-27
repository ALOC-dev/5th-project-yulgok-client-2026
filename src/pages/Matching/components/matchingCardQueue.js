export function getCircularIndex(index, delta, length) {
  if (length <= 1) return 0;
  return ((index + delta) % length + length) % length;
}

export function getPreservedIndex(people, activeUserId, fallbackIndex) {
  if (people.length === 0) return 0;
  const activeIndex = people.findIndex((person) => person.userId === activeUserId);
  return activeIndex >= 0 ? activeIndex : Math.min(fallbackIndex, people.length - 1);
}

export function getActionTransition(action) {
  if (action === 'REJECT') {
    return { exit: 'up', removeCurrent: true, refreshOnly: false };
  }
  return { exit: 'none', removeCurrent: false, refreshOnly: true };
}
