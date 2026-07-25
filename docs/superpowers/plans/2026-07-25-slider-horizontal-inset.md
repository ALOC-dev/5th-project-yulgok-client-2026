# Slider Horizontal Inset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep slider endpoint numbers and labels visible by reducing the shared slider body width by 16px on each side.

**Architecture:** Apply one `px-4` inset to the existing slider body wrapper below the title. Preserve the 10px track and label offsets that compensate for the 20px thumb radius and keep the input, tick marks, numbers, and descriptions centered together.

**Tech Stack:** React 19, JavaScript ES modules, Tailwind CSS, Node test runner, Vite

## Global Constraints

- Keep the slider title at its existing full width.
- Inset the track, range input, numeric indices, and description labels by exactly 16px per side.
- Preserve percentage positioning and `-translate-x-1/2` center alignment.
- Preserve multi-line bedtime labels and other slider labels.

---

### Task 1: Apply one shared horizontal inset to the slider body

**Files:**
- Modify: `src/pages/Surveys/components/Slider.jsx`
- Modify: `src/pages/Surveys/components/sliderIndexLabels.test.js`

**Interfaces:**
- Consumes: the existing slider body containing the track, input, numeric indices, and description labels.
- Produces: a `px-4` body whose descendants retain their existing 10px thumb-radius compensation.

- [ ] **Step 1: Write the failing layout test**

Add these assertions to the Slider source test:

```js
assert.match(source, /px-4/);
assert.match(source, /inset-x-\[10px\]/);
assert.match(source, /mx-\[10px\]/);
```

Keep the existing checks for percentage positioning and:

```js
assert.match(source, /-translate-x-1\/2/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: FAIL because `Slider` lacks the shared `px-4` inset.

- [ ] **Step 3: Implement the shared inset**

Change the slider body wrapper to:

```jsx
<div className={`${label ? "mt-6 " : ""}px-4`}>
```

Keep `inset-x-[10px]` on the track and tick wrappers and `mx-[10px]` on the numeric and description containers so their centers remain aligned with the 20px range thumb.

- [ ] **Step 4: Run focused and full verification**

Run: `node --test src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: all slider label tests pass.

Run: `node --test`

Expected: all Node tests pass.

Run: `npx.cmd eslint src/pages/Surveys/components/Slider.jsx src/pages/Surveys/components/sliderIndexLabels.test.js`

Expected: changed-file lint exits successfully.

Run: `npm.cmd run build`

Expected: Vite production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-07-25-slider-horizontal-inset.md src/pages/Surveys/components/Slider.jsx src/pages/Surveys/components/sliderIndexLabels.test.js
git commit -m "fix: inset slider content"
```
