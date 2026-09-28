# Week Lock + Mastery Ellie Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Ellie’s Adventure Quest from an open 14-mission library into a paced 14-week course where time controls the maximum released week, mastery controls advancement, prior weeks remain reviewable, and Ellie requires knowledge, practical evidence, and teach-back before a week is mastered.

**Architecture:** Keep the existing static GitHub Pages application and add two focused browser modules: a pure progression/state engine and curriculum-specific Ellie mastery data. `assets/app.js` remains the rendering/event layer and must call the progression engine for every access decision. All persistent v2 state remains localStorage-only; no API keys, backend, accounts, or paid services are introduced.

**Tech Stack:** Static HTML/CSS/JavaScript, browser `localStorage`, Node.js built-in `node:test` + `assert`, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-27-week-lock-mastery-ellie-design.md`

## Global Constraints

- Course length stays exactly 14 weeks; release cadence is one week every 7 days from the student’s local enrollment start date.
- A student may access the current eligible week and any previously reached week, but no future week.
- Passing early never unlocks the next week before its scheduled release date.
- A week is mastered only when quiz best score is at least 80%, practical evidence is complete, and teach-back is complete.
- Future-week protection applies to mission routes, mission map, home Continue action, Quest Log, Star Hop, Showcase, and week-specific resources.
- Prior reached/mastered weeks remain available for review.
- Existing v1 Quest Log, quiz scores, path, and preferences are preserved; old manual `completed` flags never become trusted mastery.
- The v2 release remains account-free and localStorage-only and must state the limits of browser-only pacing.
- No OpenAI, NVIDIA, or other secret API key may be embedded in public JavaScript.
- Ellie v2 is deterministic/curriculum-controlled: hints, remediation, alternate prompts, and transparent concept checks; no false claim of full AI semantic evaluation.
- Existing theme and large-text preferences continue to work.
- New controls must be keyboard/touch accessible, screen-reader labeled, non-color-dependent, and untimed.
- The complete instructor curriculum remains private; the full student workbook is not exposed as the default paced student resource.

## Review Focus

1. **Clock rollback after a week has already been reached:** already reached weeks must not relock; pin with `highestScheduledWeekSeen` tests in Task 1.
2. **Corrupt or missing localStorage:** app must fail safely into readable Week 1 state without inventing mastery; pin migration/sanitize tests in Task 2.
3. **Direct URL bypass (`#/missions/08`, Quest Log, Showcase):** every route uses the same eligibility decision and redirects without rendering future content; pin route-policy tests in Task 3.
4. **Partial mastery combinations:** quiz-only, practical-only, teach-back-only, and any two-of-three must remain `in-progress`; pin truth-table tests in Task 4.
5. **Learning-path switch or legacy data:** Voyager/Commander/Pioneer switching and v1 completion metadata must never bypass week locks or mastery; pin tests in Tasks 2 and 3.

---

### Task 1: Pure Progression and Eligibility Engine

**Files:**
- Create: `assets/progression.js`
- Create: `tests/progression.test.js`
- Create: `package.json`

**Interfaces:**
- Consumes: mission IDs `"01"` through `"14"`, v2 mastery state, local date strings.
- Produces: `window.AQ_PROGRESS` in the browser and CommonJS export for tests with:
  - `scheduledWeek(startDate, nowDate, highestScheduledWeekSeen) -> { scheduledWeek, highestScheduledWeekSeen }`
  - `firstUnmasteredWeek(mastery) -> number`
  - `eligibility(state, nowDate) -> { scheduledWeek, currentEligibleWeek, accessibleMissionIds, nextReleaseDate, lockedReason }`
  - `isMissionAccessible(id, eligibilityResult) -> boolean`
  - `isWeekMastered(record) -> boolean`

- [ ] **Step 1: Write failing progression tests**

Cover exact assertions for: Day 0 → Week 1; Day 6 → Week 1; Day 7 → Week 2; Day 13 → Week 2; Day 91+ capped at Week 14; Week 1 mastered early on Day 2 still exposes only Week 1; on Day 7 Week 2 is accessible only when Week 1 is mastered; scheduled Week 6 with Week 3 first unmastered exposes only Weeks 1–3; a previously observed scheduled Week 5 never drops below 5 after clock rollback.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/progression.test.js`
Expected: FAIL because `assets/progression.js` does not exist.

- [ ] **Step 3: Implement the progression API**

Use local calendar dates, seven-day integer buckets, mission IDs padded to two digits, `Math.min(14, ...)`, and `highestScheduledWeekSeen = max(previousHighest, calculatedScheduledWeek)`. `currentEligibleWeek` is `min(scheduledWeek, firstUnmasteredWeek)` with Week 14 as the terminal cap.

- [ ] **Step 4: Run progression tests**

Run: `node --test tests/progression.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json assets/progression.js tests/progression.test.js
git commit -m "feat: add week eligibility engine"
```

### Task 2: v2 State Schema, Enrollment, and Safe Migration

**Files:**
- Modify: `assets/progression.js`
- Modify: `assets/app.js`
- Modify: `tests/progression.test.js`

**Interfaces:**
- Consumes: legacy localStorage key `elliesAdventureQuest:v1` and new key `elliesAdventureQuest:v2`.
- Produces:
  - `createDefaultV2(today) -> StateV2`
  - `migrateV1(rawV1, today) -> StateV2`
  - `sanitizeV2(raw, today) -> StateV2`
  - `masteryRecord(id) -> MasteryRecord`

- [ ] **Step 1: Add failing migration/sanitization tests**

Assert that migration preserves `path`, `prefs`, `questLog`, and old quiz best scores; records old completion only as `legacyCompleted: true`; leaves `status !== "mastered"`; creates enrollment `startDate` and `initializedAt`; initializes `highestScheduledWeekSeen: 1`; ignores invalid mission IDs/scores; corrupt/null data returns a safe non-mastered state; theme/large-text survive migration.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/progression.test.js`
Expected: FAIL on missing migration functions.

- [ ] **Step 3: Implement v2 schema and migration**

Store to `elliesAdventureQuest:v2`. On first v2 launch, migrate v1 once if present; never delete the v1 key during this release. Add `enrollment.highestScheduledWeekSeen`. Mastery records include `status`, `quizBest`, `quizAttempts`, `practicalComplete`, `teachBackComplete`, `masteredAt`, `conceptsNeedingReview`, and optional `legacyCompleted`.

- [ ] **Step 4: Update `assets/app.js` loading/saving**

Replace the current `completed`-driven state setup with v2 load/save through the progression API. Keep path and preference behavior unchanged.

- [ ] **Step 5: Run tests**

Run: `node --test tests/progression.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/progression.js assets/app.js tests/progression.test.js
git commit -m "feat: migrate course progress to mastery state"
```

### Task 3: Enforce Week Locks in Every Navigation Path

**Files:**
- Modify: `assets/progression.js`
- Modify: `assets/app.js`
- Modify: `assets/app.css`
- Modify: `index.html`
- Modify: `404.html`
- Create: `tests/access-policy.test.js`

**Interfaces:**
- Consumes: `AQ_PROGRESS.eligibility(state, today)` and requested route/mission ID.
- Produces:
  - `routeDecision(routeParts, state, today) -> { allowed, redirectTo, message }`
  - mission-map states `mastered | current | review | locked`.

- [ ] **Step 1: Write failing access-policy tests**

Assert: new student can open Mission 01 but not Mission 02; direct Mission 08 is denied on Day 1; Day 7 without Week 1 mastery still denies Mission 02; Day 7 with Week 1 mastery allows Missions 01–02; learning-path change leaves eligibility unchanged; future Quest Log/Showcase route requests are denied; prior mastered weeks remain allowed.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/access-policy.test.js`
Expected: FAIL on missing route policy.

- [ ] **Step 3: Implement one shared route guard**

Call it before rendering any mission-specific/future-sensitive view. A denied direct route must redirect to the current eligible mission and set a one-time accessible lock notice without rendering the requested future mission’s title/objective/content.

- [ ] **Step 4: Replace open mission map behavior**

Remove “Every mission stays open for flexible pacing.” Render four non-color-only states: `Mastered ✓`, `Current — Work with Ellie`, `Review`, `Locked`. Locked cards render as non-links/buttons with `aria-disabled="true"` and no future mission details beyond week number and lock explanation.

- [ ] **Step 5: Update Home / Continue Course**

Replace `nextMission()` logic with `currentEligibleWeek`; show current week/title/status/next required mastery item and a single `Continue This Week` action.

- [ ] **Step 6: Load `assets/progression.js` before `assets/app.js`**

Update both `index.html` and `404.html` so GitHub Pages fallback behavior uses the same guard.

- [ ] **Step 7: Run tests**

Run: `node --test tests/access-policy.test.js tests/progression.test.js`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add assets/progression.js assets/app.js assets/app.css index.html 404.html tests/access-policy.test.js
git commit -m "feat: lock future course weeks"
```

### Task 4: Automatic Three-Part Mastery

**Files:**
- Create: `assets/mastery-data.js`
- Modify: `assets/progression.js`
- Modify: `assets/app.js`
- Modify: `index.html`
- Modify: `404.html`
- Create: `tests/mastery.test.js`

**Interfaces:**
- Consumes: each mission’s existing quiz, current Quest Log/practical fields, mastery data.
- Produces:
  - `recordQuizResult(state, id, percent, missedConcepts, now) -> StateV2`
  - `recordPracticalEvidence(state, id, evidence) -> StateV2`
  - `evaluateTeachBack(id, text, promptIndex) -> { passed, matchedConcepts, missingConcepts, hint, nextPromptIndex }`
  - `recomputeMastery(state, id, now) -> StateV2`
  - `window.AQ_MASTERY_DATA` with per-week teach-back prompts, required concepts/synonyms, remediation hints, and lesson-section references.

- [ ] **Step 1: Write failing mastery truth-table tests**

Assert that 79% fails the quiz gate; 80% passes quiz gate; quiz alone does not master; practical alone does not master; teach-back alone does not master; every two-of-three combination remains in-progress; all three gates set `status: "mastered"` and a `masteredAt` timestamp; later retries never reduce `quizBest`; attempts increment each submission.

- [ ] **Step 2: Add teach-back evaluator tests**

For representative Weeks 1, 2, 4, and 10, assert required concept groups rather than one exact phrase; blank/very short responses fail; missing concepts return a targeted hint and alternate prompt; passing text records teach-back completion. The evaluator must expose that it is a guided concept check, not an AI judgment.

- [ ] **Step 3: Run tests and verify failure**

Run: `node --test tests/mastery.test.js`
Expected: FAIL on missing mastery APIs/data.

- [ ] **Step 4: Implement `assets/mastery-data.js` for all 14 weeks**

Each week must define at least two teach-back prompts, concept groups/synonyms grounded in that mission, one remediation explanation/hint per concept group, and a lesson-section anchor. Keep future-week data inaccessible through UI even though static source is inherently inspectable.

- [ ] **Step 5: Replace manual completion button with computed Mastery panel**

Mission pages show: Lesson reviewed; Build/practical evidence; Knowledge check ≥80%; Teach-back passed; Week mastered. Remove the student-controlled `Mark mission complete` action entirely.

- [ ] **Step 6: Wire quiz scoring to mastery**

On submission, update best score/attempt count, show per-question explanation, add missed concepts to review state where mappings exist, and show Ellie’s targeted next-step message before retry.

- [ ] **Step 7: Wire practical evidence**

Require non-blank evidence for `built`, `tested`, `challenge`, and `solution`; whitespace-only values fail. Preserve existing Quest Log text and add the `tested` field without discarding legacy entries.

- [ ] **Step 8: Wire teach-back**

Show one prompt at a time, accept free text, run the transparent concept-group evaluator, provide a hint + section reference on failure, rotate to a different prompt, and recheck. Do not display hidden answer-key phrasing.

- [ ] **Step 9: Run tests**

Run: `node --test tests/mastery.test.js tests/progression.test.js`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add assets/mastery-data.js assets/progression.js assets/app.js index.html 404.html tests/mastery.test.js
git commit -m "feat: require Ellie mastery checks"
```

### Task 5: Ellie Remediation and Current-Week Learning Flow

**Files:**
- Modify: `assets/mastery-data.js`
- Modify: `assets/app.js`
- Modify: `assets/app.css`
- Modify: `tests/mastery.test.js`

**Interfaces:**
- Consumes: current eligible week, missed quiz concepts, teach-back missing concepts, previously released weeks.
- Produces: `ellieResponse({ weekId, type, concepts, promptIndex }) -> { heading, message, example, actionLabel, sectionAnchor }`.

- [ ] **Step 1: Add failing Ellie behavior tests**

Assert remediation order contains: identify missed concept → simple explanation → small worked example → retry action; responses are scoped to current/prior weeks; a request tagged with a future week returns a boundary message and no future objective/solution; successful recovery removes the concept from `conceptsNeedingReview`.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/mastery.test.js`
Expected: FAIL on missing Ellie response API.

- [ ] **Step 3: Implement Ellie remediation content/function**

Use the approved behavior: hints before answers, one question at a time, specific evidence-based praise, exact lesson-section links, alternate follow-up prompts, and no generic future-week teaching.

- [ ] **Step 4: Add Ellie panel to mission pages**

Render a clearly labeled “Work with Ellie” area near the mastery checklist. It shows the current next action, remediation after mistakes, and the teach-back conversation flow. Use `aria-live="polite"` for feedback and keep all retry actions keyboard reachable.

- [ ] **Step 5: Run tests**

Run: `node --test tests/mastery.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/mastery-data.js assets/app.js assets/app.css tests/mastery.test.js
git commit -m "feat: add Ellie remediation flow"
```

### Task 6: Progressive Star Hop, Resources, Quest Log, and Showcase

**Files:**
- Modify: `assets/mastery-data.js`
- Modify: `assets/app.js`
- Modify: `assets/app.css`
- Create: `tests/content-gating.test.js`

**Interfaces:**
- Consumes: current eligibility and per-week release metadata.
- Produces:
  - `visibleCapstoneItems(eligibilityResult) -> CapstoneItem[]`
  - `visibleResourceWeeks(eligibilityResult) -> string[]`
  - gated Quest Log and Showcase rendering decisions.

- [ ] **Step 1: Write failing content-gating tests**

Assert Day-1 Star Hop contains Week-1 requirements only; later eligible weeks cumulatively add requirements; full 14-week checklist is never shown early; Resources expose only accessible week print actions; future Quest Log links are absent/disabled; Showcase remains unavailable until Week 14 is both scheduled and preceding mastery permits access.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/content-gating.test.js`
Expected: FAIL on missing content-gating APIs.

- [ ] **Step 3: Make Star Hop cumulative but progressive**

Tag each capstone requirement with its release week and filter through eligibility before rendering.

- [ ] **Step 4: Replace unrestricted workbook-first student resource**

Remove the full Student Quest Workbook from the default student Resources path. Add `Print This Week` / `Print Prior Week` actions generated from already accessible mission content. Keep existing workbook files in the repository for administrative continuity but do not link them as the normal paced student resource.

- [ ] **Step 5: Gate Quest Log and Showcase**

Quest Log shows entries/actions only for reached weeks. Showcase route and navigation remain locked until Mission 14 is current/review-accessible under the shared route policy.

- [ ] **Step 6: Add local-progress limitation notice**

Resources and first-run orientation state plainly that progress is stored on this device/browser, clearing browser data loses progress, and browser-only pacing is not tamper-proof.

- [ ] **Step 7: Run tests**

Run: `node --test tests/content-gating.test.js tests/access-policy.test.js`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add assets/mastery-data.js assets/app.js assets/app.css tests/content-gating.test.js
git commit -m "feat: gate cumulative course resources"
```

### Task 7: Accessibility, Regression, and Production Release Verification

**Files:**
- Modify: `assets/app.css`
- Modify: `assets/app.js`
- Modify: `README.md`
- Create: `tests/regression.test.js`

**Interfaces:**
- Consumes: the completed v2 app and all earlier test suites.
- Produces: production-ready static release with documented v2 behavior and smoke-test checklist.

- [ ] **Step 1: Add regression tests for non-negotiable copy/state**

Assert source no longer contains `Every mission stays open for flexible pacing` or student `Mark mission complete`; v2 storage key is used; progression/mastery scripts load before app script; the public app contains the current-week CTA and local-progress warning.

- [ ] **Step 2: Run the full automated suite**

Run: `npm test`
Expected: all Node test files PASS with zero failures.

- [ ] **Step 3: Perform manual accessibility checks locally/in preview**

Verify keyboard-only operation for mission map, quiz, practical form, teach-back, retries, theme, and large text; verify focus is moved to lock/quiz feedback when appropriate; verify locked states include text/icon semantics instead of color only; verify mobile touch controls remain usable.

- [ ] **Step 4: Perform progression smoke scenarios**

Exercise fresh Week 1; blocked direct Week 2; early Week 1 mastery; simulated Day 7 unlock with Week 1 mastered; Day 7 lock without mastery; prior-week review; path switch; corrupted stored state; migrated v1 state.

- [ ] **Step 5: Update README**

Document the 14-week paced model, 80% + practical + teach-back mastery rule, local-only progress limitation, and that future server-backed conversational Ellie is out of scope for v2.

- [ ] **Step 6: Commit release changes**

```bash
git add assets/app.css assets/app.js README.md tests/regression.test.js
git commit -m "test: verify paced mastery release"
```

- [ ] **Step 7: Verify the deployed GitHub Pages site after merge/deploy**

Check `https://deaconjason-stack.github.io/ellies-adventure-quest/` and confirm: homepage loads; new student sees Week 1 only; Mission 2 direct URL is blocked; Mission 1 quiz/practical/teach-back are usable; theme/large-text still work; no unrestricted full-course workbook link appears in the standard student Resources view.

- [ ] **Step 8: Record production verification**

Add a short dated verification note to the release commit/PR description with automated test result and the production URLs checked. Do not claim completion until these production checks pass.
