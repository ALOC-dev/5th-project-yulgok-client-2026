# Matching Card Circular Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 매칭 카드를 스와이프 방향에 따라 양방향으로 순환시키고, X는 위쪽 페이드 퇴장, 하트는 이동 없는 상태 갱신으로 분리한다.

**Architecture:** 원형 인덱스 계산과 활성 사용자 유지 로직을 순수 함수 모듈로 분리한다. `MatchingCardStack`은 로컬 제외 ID 집합과 애니메이션 상태를 관리하며, 부모의 `people` 갱신에도 현재 사용자 ID를 가능한 한 유지한다.

**Tech Stack:** React 19, JavaScript ES modules, Node.js built-in test runner, Vite 8, Tailwind CSS

## Global Constraints

- 직접 스와이프만 카드 탐색 인덱스를 변경한다.
- 왼쪽 스와이프는 오른쪽 이웃, 오른쪽 스와이프는 왼쪽 이웃을 표시한다.
- X 요청 성공 시 카드가 약 240ms 동안 위로 이동하며 투명해진 뒤 이번 화면 세션의 큐에서 제외된다.
- 하트 요청 성공 시 현재 카드와 탐색 인덱스를 유지하고 서버 상태만 갱신한다.
- 채팅 버튼, 서버 API 계약, 카드 콘텐츠 디자인은 변경하지 않는다.

---

### Task 1: 원형 카드 탐색 상태 함수

**Files:**
- Create: `src/pages/Matching/components/matchingCardQueue.js`
- Test: `src/pages/Matching/components/matchingCardQueue.test.js`

**Interfaces:**
- Consumes: 사용자 객체 배열과 `userId`
- Produces: `getCircularIndex(index, delta, length)`, `getPreservedIndex(people, activeUserId, fallbackIndex)`

- [ ] **Step 1: 원형 인덱스의 실패 테스트 작성**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { getCircularIndex } from './matchingCardQueue.js';

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
```

- [ ] **Step 2: 테스트가 올바른 이유로 실패하는지 확인**

Run: `node --test src/pages/Matching/components/matchingCardQueue.test.js`
Expected: FAIL because `matchingCardQueue.js` does not exist.

- [ ] **Step 3: 최소 원형 인덱스 구현**

```js
export function getCircularIndex(index, delta, length) {
  if (length <= 1) return 0;
  return ((index + delta) % length + length) % length;
}
```

- [ ] **Step 4: 현재 사용자 유지 실패 테스트 추가**

```js
import { getCircularIndex, getPreservedIndex } from './matchingCardQueue.js';

test('preserves the active user across refreshed people', () => {
  const people = [{ userId: 30 }, { userId: 10 }, { userId: 20 }];
  assert.equal(getPreservedIndex(people, 20, 0), 2);
});

test('clamps the fallback when the active user disappeared', () => {
  assert.equal(getPreservedIndex([{ userId: 10 }, { userId: 20 }], 30, 2), 1);
  assert.equal(getPreservedIndex([], 30, 2), 0);
});
```

- [ ] **Step 5: 새 테스트가 올바른 이유로 실패하는지 확인**

Run: `node --test src/pages/Matching/components/matchingCardQueue.test.js`
Expected: FAIL because `getPreservedIndex` is not exported.

- [ ] **Step 6: 최소 현재 사용자 유지 로직 구현**

```js
export function getPreservedIndex(people, activeUserId, fallbackIndex) {
  if (people.length === 0) return 0;
  const activeIndex = people.findIndex((person) => person.userId === activeUserId);
  return activeIndex >= 0 ? activeIndex : Math.min(fallbackIndex, people.length - 1);
}
```

- [ ] **Step 7: 단위 테스트 통과 확인**

Run: `node --test src/pages/Matching/components/matchingCardQueue.test.js`
Expected: 5 tests PASS.

- [ ] **Step 8: 커밋**

```bash
git add src/pages/Matching/components/matchingCardQueue.js src/pages/Matching/components/matchingCardQueue.test.js
git commit -m "test: cover circular matching card queue"
```

### Task 2: 카드 스택 탐색과 버튼 액션 분리

**Files:**
- Modify: `src/pages/Matching/components/MatchingCardStack.jsx`
- Create: `src/pages/Matching/components/MatchingCardStack.test.js`

**Interfaces:**
- Consumes: Task 1의 `getCircularIndex`, `getPreservedIndex`
- Produces: 왼쪽/오른쪽 순환 스와이프, X 위쪽 페이드 제외, 하트 제자리 갱신 UI

- [ ] **Step 1: 실제 컴포넌트가 사용하는 액션 정책의 실패 테스트 작성**

`MatchingCardStack`이 분기에서 사용할 정책을 `matchingCardQueue.js`에 추가하는 API로 검증한다.

```js
import { getActionTransition } from './matchingCardQueue.js';

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
```

- [ ] **Step 2: 정책 테스트가 올바른 이유로 실패하는지 확인**

Run: `node --test src/pages/Matching/components/matchingCardQueue.test.js`
Expected: FAIL because `getActionTransition` is not exported.

- [ ] **Step 3: 최소 액션 정책 구현**

```js
export function getActionTransition(action) {
  if (action === 'REJECT') {
    return { exit: 'up', removeCurrent: true, refreshOnly: false };
  }
  return { exit: 'none', removeCurrent: false, refreshOnly: true };
}
```

- [ ] **Step 4: 컴포넌트 동작 테스트 작성**

React DOM 테스트 라이브러리가 없는 현재 프로젝트에서는 순수 정책 테스트와 실제 빌드 검증을 결합한다. `MatchingCardStack.test.js`는 컴포넌트 모듈을 import해 JSX 변환과 새 큐 모듈 연결이 깨지지 않는지 Vite 환경에서 검증하고, 사용자 동작은 정책 함수의 실제 반환값으로 검증한다.

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { getActionTransition } from './matchingCardQueue.js';

test('button actions do not share horizontal swipe navigation', () => {
  assert.equal(getActionTransition('REJECT').exit, 'up');
  assert.equal(getActionTransition('HEART').exit, 'none');
});
```

- [ ] **Step 5: `MatchingCardStack`에 표시 목록과 활성 사용자 유지 적용**

```js
const [dismissedUserIds, setDismissedUserIds] = useState(() => new Set());
const displayedPeople = people.filter((person) => !dismissedUserIds.has(person.userId));
const activeUserIdRef = useRef(null);

useEffect(() => {
  setCurrentIndex((index) =>
    getPreservedIndex(displayedPeople, activeUserIdRef.current, index),
  );
}, [displayedPeople]);
```

표시 목록은 `useMemo`로 안정화하고 활성 카드가 바뀔 때 `activeUserIdRef`를 갱신해 불필요한 effect 반복을 막는다.

- [ ] **Step 6: 스와이프 방향별 인덱스 변경 적용**

```js
const moveToAdjacentCard = (exitDirection) => {
  const indexDelta = exitDirection < 0 ? 1 : -1;
  // 240ms horizontal exit, then getCircularIndex(index, indexDelta, displayedPeople.length)
};
```

`handlePointerEnd`에서 왼쪽 드래그는 `exitDirection = -1`, 오른쪽 드래그는 `exitDirection = 1`로 전달한다. 카드가 1장 이하면 드래그 위치만 복원한다.

- [ ] **Step 7: X 위쪽 페이드와 로컬 제외 적용**

```js
setExitMode('reject');
window.setTimeout(() => {
  setDismissedUserIds((ids) => new Set(ids).add(currentPerson.userId));
  setExitMode('');
  onStatusRefresh?.();
}, 240);
```

앞 카드의 `reject` transform은 `translateY(-90px) scale(0.97)`, opacity는 `0`으로 설정한다. 서버 `REJECT` 요청이 실패하면 퇴장 상태를 시작하지 않는다.

- [ ] **Step 8: 하트 제자리 갱신 적용**

`HEART` 요청 성공 시 퇴장 상태와 인덱스를 변경하지 않고 `await onStatusRefresh?.()`만 호출한다. 갱신 오류는 기존 오류 처리 문구를 재사용한다.

- [ ] **Step 9: 중복 입력과 빈 목록 경계 처리**

API 요청이나 퇴장 애니메이션 중에는 포인터 탐색과 액션 버튼을 막는다. `displayedPeople.length === 0`에서는 나머지 연산과 나머지 연산자 사용을 피하고 빈 스택을 렌더링한다.

- [ ] **Step 10: 관련 테스트와 빌드 검증**

Run: `node --test src/pages/Matching/components/matchingCardQueue.test.js src/pages/Matching/components/MatchingCardStack.test.js`
Expected: all tests PASS.

Run: `npm run build`
Expected: Vite production build succeeds without JSX or import errors.

- [ ] **Step 11: 커밋**

```bash
git add src/pages/Matching/components/MatchingCardStack.jsx src/pages/Matching/components/MatchingCardStack.test.js src/pages/Matching/components/matchingCardQueue.js src/pages/Matching/components/matchingCardQueue.test.js
git commit -m "feat: add circular matching card navigation"
```

### Task 3: 전체 회귀 검증

**Files:**
- Modify: none unless verification reveals an in-scope regression

**Interfaces:**
- Consumes: Task 1과 Task 2의 완성된 카드 큐 및 UI 동작
- Produces: 린트·전체 테스트·프로덕션 빌드 검증 결과

- [ ] **Step 1: 전체 Node 테스트 실행**

Run: `node --test "src/**/*.test.js"`
Expected: all discovered tests PASS.

- [ ] **Step 2: 린트 실행**

Run: `npm run lint`
Expected: zero ESLint errors.

- [ ] **Step 3: 프로덕션 빌드 재확인**

Run: `npm run build`
Expected: Vite production build succeeds.

- [ ] **Step 4: 최종 변경 검토**

Run: `git diff --check`
Expected: no whitespace errors.

Run: `git status --short`
Expected: only the planned implementation and test files are changed.
