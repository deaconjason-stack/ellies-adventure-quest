# Ellie’s Adventure Quest — Week Lock + Mastery Ellie Design

Date: 2026-09-27
Status: Approved design, pending implementation-plan review

## 1. Purpose

Ellie’s Adventure Quest must behave like a paced 14-week course, not an open self-paced content library.

A student may access:
- the current eligible week;
- any previously reached week for review;
- no future week.

Advancement is governed by both time and demonstrated mastery. Passing early never unlocks future course material before its scheduled week.

Ellie is responsible for checking understanding, guiding remediation, and confirming that the student can explain and apply what was taught before the week is marked mastered.

## 2. Core Learning Rules

### 2.1 Weekly pacing

Each student has a local course start date. Week eligibility is calculated from that start date:

- Days 0–6: Week 1 may be eligible.
- Days 7–13: Week 2 may be eligible.
- Days 14–20: Week 3 may be eligible.
- Continue in seven-day increments through Week 14.

The scheduled week is capped at 14.

A future week is never unlocked only because the student completed work early.

### 2.2 Mastery gate

A scheduled week becomes accessible only when every prior week is mastered.

Examples:
- It is calendar Week 3 and Weeks 1–2 are mastered → Weeks 1–3 are accessible.
- It is calendar Week 3 and Week 2 is not mastered → Weeks 1–2 remain accessible; Week 3 stays locked.
- The student masters Week 2 during calendar Week 3 → Week 3 becomes accessible immediately.
- The student masters Week 3 during calendar Week 3 → Week 4 remains locked until its seven-day release date.

### 2.3 Prior-week access

Once a week has been reached, it remains available for review even after mastery. Students may revisit prior lessons, Ellie review activities, completed Quest Logs, practice questions, and previously released Star Hop work.

### 2.4 Future-week protection

Future weeks must be blocked in all navigation paths, not merely hidden visually.

The application must enforce the same eligibility function in:
- mission map cards;
- direct hash routes such as `#/missions/08`;
- home-page Continue Course links;
- Quest Log links;
- Star Hop progression/tasks;
- Showcase access;
- Resources that reveal week-specific future material.

Attempting to open a locked week redirects the student to the current eligible week with a clear message such as: “That mission is not available yet. Keep working with Ellie on Week 4.”

## 3. Mastery Definition

A week is mastered only when all required checks pass.

### 3.1 Knowledge check

- Five or more curriculum-aligned questions.
- Minimum score: 80%.
- Unlimited retries.
- Retakes should vary question order and, where question-bank depth permits, use alternate questions.
- Incorrect answers trigger explanation and a targeted review prompt before the next attempt.

### 3.2 Practical task

The student must complete that week’s coding/build task.

For the static v1 implementation, the student provides structured evidence such as:
- what was changed or built;
- what was tested;
- what bug or problem occurred;
- how it was solved.

The system does not accept an empty self-attestation as mastery.

### 3.3 Teach-back to Ellie

The student must explain the lesson concept in their own words.

Ellie asks one or more curriculum-specific prompts such as:
- “Explain a variable as if you were teaching someone new to coding.”
- “Why would you use a loop instead of writing the same instruction five times?”
- “Tell me what a conditional does in your Star Hop project.”

The v1 static build uses a transparent rubric/keyword-and-concept checklist rather than pretending to perform full AI semantic judgment in the browser. If required concepts are missing, Ellie responds with a hint, directs the student back to the relevant lesson section, and asks a different teach-back prompt.

A later server-backed version may replace this evaluator with a true conversational model without exposing an API key to the browser.

## 4. Ellie Tutor Behavior

Ellie is a mastery tutor, not a shortcut engine.

### 4.1 Teaching behavior

Ellie should:
- stay within the current and previously released curriculum;
- explain a concept in simpler language when the student misses it;
- give hints before answers;
- use examples from the current week;
- ask one question at a time during mastery checks;
- praise specific evidence of learning rather than giving generic praise;
- send the student back to exact lesson sections when needed;
- vary follow-up questions after an incorrect attempt;
- require the student to demonstrate understanding again after remediation.

### 4.2 Scope boundary

Ellie must not teach future-week course material ahead of schedule.

If a Week 4 student asks about a Week 7 concept, Ellie should respond along the lines of:

> “Great question. We’ll get to that later in the course. For now, let’s use what you already know from Weeks 1–4 to solve today’s mission.”

Ellie may answer ordinary safety/accessibility questions and clarify earlier material, but should not reveal future mission objectives, answer keys, tasks, or solutions.

### 4.3 Remediation cycle

For a missed concept:
1. Identify the concept missed.
2. Give a short explanation using the student’s current week context.
3. Give a small worked example without revealing the answer to the mastery question.
4. Ask the student to try a related question.
5. Recheck understanding.
6. Record the concept as recovered when passed.

## 5. Student State Model

Current state key: `elliesAdventureQuest:v1`

The new release should migrate to a new schema, for example `elliesAdventureQuest:v2`, without silently deleting prior student work.

Recommended state shape:

```js
{
  version: 2,
  path: 'voyager',
  enrollment: {
    startDate: 'YYYY-MM-DD',
    initializedAt: 'ISO timestamp'
  },
  mastery: {
    '01': {
      status: 'not-started|in-progress|mastered',
      quizBest: 0,
      quizAttempts: 0,
      practicalComplete: false,
      teachBackComplete: false,
      masteredAt: null,
      conceptsNeedingReview: []
    }
  },
  questLog: {},
  capstone: {},
  prefs: {
    theme: 'system',
    largeText: false
  }
}
```

### 5.1 v1 migration

Existing `completed` entries must not automatically become trusted mastery records because the old interface allowed students to press “Mark mission complete” manually.

Migration behavior:
- preserve Quest Log entries;
- preserve quiz scores as historical best scores;
- preserve path and preferences;
- preserve completed missions as `legacyCompleted: true` metadata if useful;
- require the new mastery requirements before treating a week as mastered.

This prevents old manual completion from bypassing the new learning standard.

## 6. Eligibility Calculation

The application should centralize all access decisions in one function.

Conceptual rules:

```text
scheduledWeek = min(14, floor(daysSinceStart / 7) + 1)
firstUnmasteredWeek = earliest week not mastered
currentEligibleWeek = min(scheduledWeek, firstUnmasteredWeek)
accessibleWeeks = all weeks <= currentEligibleWeek
```

If Weeks 1–4 are mastered and the scheduled week is 4, Week 5 remains locked.

If Weeks 1–2 are mastered, Week 3 is unmastered, and the scheduled week is 6, only Weeks 1–3 are accessible until Week 3 mastery is achieved.

The state and routing layers must call the same eligibility function to avoid inconsistent locks.

## 7. User Experience

### 7.1 Mission map

Mission cards display one of four states:
- Mastered ✓
- Current — Work with Ellie
- Review — previously mastered/reached
- Locked — available in a future week

Locked cards are not clickable.

The page should no longer say “Every mission stays open for flexible pacing.”

Suggested replacement:

> “Your course unlocks one week at a time. Master this week with Ellie, and previously completed weeks stay open for review.”

### 7.2 Current-week dashboard

The home page should emphasize:
- current week number and title;
- mastery status;
- next requirement to complete;
- days until the next week may become available, if the current week is already mastered;
- a single primary “Continue This Week” action.

### 7.3 Mastery panel

Each week should include a visible mastery checklist:

- Lesson reviewed
- Build/practical evidence completed
- Knowledge check ≥80%
- Teach-back passed
- Week mastered

The final “Week mastered” state is calculated automatically. There is no student-controlled “Mark mission complete” button.

### 7.4 Locked-week message

Students should see why something is locked without seeing the future content itself.

Examples:
- “Week 5 opens on October 25.”
- “Week 5 is scheduled now, but finish your Week 4 mastery check with Ellie first.”

## 8. Star Hop Capstone Rules

Star Hop remains cumulative, but only released components are available.

A student may review and edit features introduced in earlier weeks. Future feature requirements must remain hidden until their corresponding week is eligible.

The capstone checklist should reveal requirements progressively rather than displaying all 14 weeks of expectations on Day 1.

## 9. Resources and Workbook

The current downloadable workbook can expose future-week material. The public course therefore should not offer one unrestricted full-course workbook to students in the paced mode.

Preferred v2 behavior:
- present week-specific printable/downloadable activity pages only for accessible weeks;
- keep the complete instructor curriculum private;
- if the full student workbook remains downloadable for administrative reasons, it should not be the default student path because it defeats future-week locking.

## 10. Privacy and Security

### 10.1 v2 static release

The first release remains account-free and stores progress locally in the browser.

No name, email, date of birth, or other personally identifying information is required.

No OpenAI, NVIDIA, or other secret API key may be embedded in public JavaScript.

### 10.2 Limitation of local-only enforcement

Browser-only locking is a learning/pacing control, not a high-security entitlement system. A technically sophisticated user could manipulate local storage, system time, or public source files.

That is acceptable for the account-free v2 instructional release, but true tamper-resistant pacing requires a server-backed student account and authoritative enrollment record.

The interface must not claim that local-only controls are secure against deliberate tampering.

## 11. Accessibility

All new Ellie and mastery controls must support:
- keyboard navigation;
- touch targets suitable for phones/tablets;
- screen-reader labels;
- feedback that does not rely on color alone;
- the existing large-text preference;
- clear retry and remediation language;
- no time pressure inside quizzes or teach-back activities.

## 12. Failure and Edge Cases

### Local storage unavailable
The course remains readable, but the interface clearly states that saved progression/mastery cannot be guaranteed. The student should not be given false mastery status.

### Device clock moved backward
Do not revoke already reached weeks. Use a stored `highestScheduledWeekSeen` value so ordinary clock corrections do not suddenly relock a previously released week.

### Device clock moved forward
The static v2 build cannot fully prevent deliberate clock manipulation. Do not expose weeks beyond the mastery gate; document that server-backed scheduling is required for authoritative release dates.

### Student clears browser data
Local progress is lost in v2. The application must explain this before the student begins and in Resources. Cloud/account backup is a separate later feature.

### Student changes learning path
Voyager/Commander/Pioneer may still be switched, but switching paths does not bypass week or mastery locks.

## 13. Testing Requirements

Implementation is not complete until automated/manual tests cover at least:

1. New student sees Week 1 only.
2. Direct navigation to Week 2 on Day 1 is blocked.
3. Passing Week 1 early does not expose Week 2 before Day 7.
4. Week 2 becomes eligible on/after Day 7 only if Week 1 is mastered.
5. If Week 1 is not mastered on Day 7, Week 2 remains locked.
6. Prior mastered weeks stay available.
7. An 80% quiz score alone does not produce mastery.
8. Teach-back alone does not produce mastery.
9. Practical evidence alone does not produce mastery.
10. All three mastery requirements produce automatic mastery.
11. Future Quest Log links cannot bypass the route guard.
12. Star Hop hides future-week requirements.
13. Showcase remains locked until its scheduled/mastery conditions are met.
14. Existing v1 Quest Log data migrates without being lost.
15. Existing manually completed missions do not become automatically mastered.
16. Theme/large-text preferences survive migration.
17. Clearing or corrupting state fails safely.
18. Current public GitHub Pages site still loads after deployment.

## 14. Out of Scope for This Release

Not part of this v2 implementation:
- student accounts;
- instructor dashboard;
- parent dashboard;
- cloud synchronization;
- authoritative server time;
- tamper-proof progression;
- payment enforcement;
- gradebook/LMS integration;
- live OpenAI/NVIDIA calls from the browser;
- accreditation claims;
- automated credential issuance.

These can be added later without weakening the v2 learning model.

## 15. Success Criteria

The redesign succeeds when a student cannot casually move ahead, always knows exactly what to work on now, can revisit prior lessons, receives targeted Ellie remediation after mistakes, and does not receive mastery credit until they demonstrate knowledge, practical application, and the ability to explain the concept in their own words.

The central principle is:

**Time determines when a week may open. Mastery determines whether the student may advance. Ellie verifies the learning.**
