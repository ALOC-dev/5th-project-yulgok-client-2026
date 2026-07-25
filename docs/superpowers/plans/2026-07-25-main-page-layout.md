# Main Page Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 매칭, 채팅, 마이 페이지가 동일한 최대 너비와 패딩, 헤더 기준선을 사용하도록 공통 레이아웃을 적용한다.

**Architecture:** `MainPageLayout`이 공통 최상위 section과 header를 소유한다. 각 페이지는 제목, 선택적 부제와 우측 액션, 본문만 전달하며 고유한 본문 간격은 페이지 내부에 유지한다.

**Tech Stack:** React 19, JSX, Tailwind CSS 4, Node.js test runner, ESLint, Vite

## Global Constraints

- 세 페이지의 최대 너비는 `600px`이다.
- 좌우 패딩은 `20px`이고 상단 패딩은 `clamp(1rem, 4vw, 2rem)`이다.
- 매칭의 우측 실행 버튼과 동적 안내·오류 표현은 유지한다.
- `MainLayout`, `NavigationBar`, 채팅방 상세 화면은 변경하지 않는다.
- 기존 `Chat.jsx`의 반응형 상단 여백 의도와 다른 사용자 변경을 보존한다.

---

### Task 1: 공통 페이지 레이아웃

**Files:**
- Create: `src/layout/MainPageLayout.js`
- Create: `src/layout/MainPageLayout.test.js`

**Interfaces:**
- Produces: `MainPageLayout({ title, description, headerAction, children, className, descriptionClassName })`

- [ ] **Step 1: 실패하는 공통 레이아웃 테스트 작성**

실제 React 요소를 서버 렌더링하고 다음을 확인한다.

```js
const html = renderToStaticMarkup(
  <MainPageLayout title="채팅" description="설명" headerAction={<button>실행</button>}>
    <div>본문</div>
  </MainPageLayout>,
);

assert.match(html, /max-w-\[600px\]/);
assert.match(html, /px-5/);
assert.match(html, /pt-\[clamp\(1rem,4vw,2rem\)\]/);
assert.match(html, />채팅</);
assert.match(html, />설명</);
assert.match(html, />실행</);
assert.match(html, />본문</);
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `node --test src/layout/MainPageLayout.test.js`

Expected: `MainPageLayout.js`가 없어 실패한다.

- [ ] **Step 3: 최소 공통 컴포넌트 구현**

공통 section에 `mx-auto flex min-h-[calc(100dvh-96px)] w-full min-w-0 max-w-[600px] flex-col px-5 pb-10 pt-[clamp(1rem,4vw,2rem)]`을 적용한다. 공통 header는 제목·부제 영역과 선택적 우측 액션을 렌더링하고, `children`은 header 다음에 렌더링한다.

- [ ] **Step 4: 공통 레이아웃 테스트 통과 확인**

Run: `node --test src/layout/MainPageLayout.test.js`

Expected: PASS

### Task 2: 세 페이지 적용

**Files:**
- Modify: `src/pages/Matching/Matching.jsx`
- Modify: `src/pages/Chat/Chat.jsx`
- Modify: `src/pages/MyPage/MyPage.jsx`
- Create: `src/layout/mainPageLayout.integration.test.js`

**Interfaces:**
- Consumes: `MainPageLayout`의 props

- [ ] **Step 1: 실패하는 페이지 통합 테스트 작성**

세 페이지를 실제 모듈로 불러올 수 있고, 각 페이지 소스가 `MainPageLayout`을 사용하며 자체 최상위 레이아웃과 header를 중복 소유하지 않는지 확인한다. 매칭은 `headerAction`과 오류용 `descriptionClassName`을 전달하는지도 확인한다.

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `node --test src/layout/mainPageLayout.integration.test.js`

Expected: 세 페이지가 아직 공통 레이아웃을 사용하지 않아 FAIL

- [ ] **Step 3: 페이지별 최상위 레이아웃 교체**

`Matching`, `Chat`, `MyPage`의 최상위 section과 header를 `MainPageLayout`으로 교체한다. 매칭은 `className="pb-44"`와 동적 부제 스타일 및 실행 버튼을 전달한다. 채팅과 마이의 본문 상태·간격·모달은 유지한다.

- [ ] **Step 4: 집중 테스트와 린트 실행**

Run:

```powershell
node --test src/layout/MainPageLayout.test.js src/layout/mainPageLayout.integration.test.js
npx.cmd eslint src/layout/MainPageLayout.js src/layout/MainPageLayout.test.js src/layout/mainPageLayout.integration.test.js src/pages/Matching/Matching.jsx src/pages/Chat/Chat.jsx src/pages/MyPage/MyPage.jsx
```

Expected: 모두 exit code 0

### Task 3: 전체 검증

**Files:**
- Verify only

- [ ] **Step 1: 전체 테스트 실행**

Run: `node --test`

Expected: 모든 테스트 PASS

- [ ] **Step 2: 프로덕션 빌드 실행**

Run: `npm.cmd run build`

Expected: Vite build exit code 0

- [ ] **Step 3: 변경 범위 확인**

Run: `git diff --check; git diff --stat; git status --short`

Expected: 공통 레이아웃과 세 페이지, 테스트 및 승인된 문서만 변경되고 공백 오류가 없다.
