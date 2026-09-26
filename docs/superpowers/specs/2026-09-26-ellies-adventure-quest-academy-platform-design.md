# Ellie's Adventure Quest Academy Platform — Design Specification

**Date:** 2026-09-26  
**Owner:** Ellie's FutureMinds Academy  
**Founder:** Jason Henderson  
**Co-Founder and Founding Inspiration:** Domonique Danielle Henderson  
**Product:** Ellie's Adventure Quest  
**Status:** Design approved in conversation; written specification for review  
**Supersedes:** the earlier static-only Adventure Quest v1 design for the next major rebuild

---

## 1. Product intent

Ellie's Adventure Quest will be rebuilt from a mostly static, browser-local course into a secure, account-backed Academy platform that can serve individual families, Academy classes, instructors, and future school/community partners.

The course remains a 14-week Star Hop adventure, but the next version must correct the core weakness of the current release: age/skill levels must be **genuinely different courses**, not the same lesson with lightly reworded tasks.

The approved academic model is:

- 14 weeks
- 90 minutes per week
- 21 instructional hours per level
- 4 developmental levels
- 56 complete lessons total
- embedded coding labs
- formative checks, graded builds, midpoint assessment, final capstone
- mastery-based completion at 80%
- a verifiable Certificate of Completion
- hybrid self-paced + instructor-led delivery
- Ellie AI Tutor with assessment safeguards
- Admin, Instructor, Student, and Parent/Guardian portals

The platform must remain affordable to launch, mobile-first, accessible, privacy-minimized, child-centered, and suitable for a small controlled pilot before broad enrollment.

### Success means

A learner can enter as a guest, understand which level fits, experience a sample lesson, and begin practice without friction. Once an account is needed, a family or class can enroll through the correct consent/approval flow. A student can then complete all 14 weeks, code inside the Academy, receive feedback, remediate weak concepts, reach 80% mastery, complete the capstone, and receive a valid Certificate of Completion. Instructors and parents must see the appropriate academic record without being able to access data outside their relationship or class scope.

---

## 2. Product principles

1. **Real instruction, not content placeholders.** A lesson is not complete merely because a page exists. Each level-specific lesson must contain enough teaching, guided practice, coding/build work, review, assessment, and reflection to support the approved 90-minute session.
2. **Developmentally distinct learning paths.** Explorer, Voyager, Commander, and Pioneer share a storyline and weekly concept family, but the explanations, examples, tasks, coding expectations, assessment types, and capstone depth differ materially.
3. **Mastery over seat time.** Completion requires evidence of learning, not merely clicking through pages.
4. **Privacy by data minimization.** Do not collect information simply because it might be useful later.
5. **Role access is enforced in data policy, not only hidden in the UI.**
6. **AI is a tutor, not the source of answers.** Ellie helps students learn, debug, and practice, but the platform controls the assistance permitted during graded work and assessments.
7. **Student code is untrusted.** It must run outside the Academy application security context.
8. **The official curriculum is versioned.** Updates must not silently rewrite the course a student already completed or is currently taking.
9. **Bright, calm, and understandable.** The default UX is welcoming and easy to scan; older learners must not feel they are using a little-kids interface.
10. **Accurate credential claims.** The product issues a Certificate of Completion. It must not claim accreditation, licensure, college credit, or another external status unless that status is actually obtained.

---

## 3. Selected architecture and alternatives

### Selected approach: modular Academy platform

Use one student-facing Academy product with internally separated modules that share one secure backend. The modules are:

- Identity & Consent
- Curriculum & Publishing
- Classroom & Enrollment
- Learning Session Engine
- Coding Lab
- Assessments & Mastery
- Ellie AI Tutor
- Student Portal
- Parent/Guardian Portal
- Instructor Portal
- Admin Portal
- Certificates & Verification
- Reporting & Audit

This gives the Academy one coherent user experience while keeping the code and data responsibilities separated enough to evolve later.

### Backend foundation

Use **Supabase** for:

- authentication
- PostgreSQL data
- Row Level Security (RLS)
- structured academic records
- storage where required
- trusted server-side operations / functions where appropriate

Supabase Auth currently supports email/password and social providers including Google and Apple, matching the approved hybrid sign-in model.

### Hosting and delivery

Use one primary web application deployed on **Vercel**. Cloudflare may continue to provide DNS/domain services and can be used for complementary edge/security functions where appropriate. Production and non-production environments must remain separated.

The design does not require a specific frontend framework. Selecting the concrete implementation stack (for example, a TypeScript/React framework that fits Vercel and Supabase well) is an implementation-plan decision, provided it preserves the security, accessibility, routing, testing, and server-side boundaries in this specification.

### Alternatives considered

**Single tightly coupled app:** quickest initial construction, but raises maintenance risk as curriculum, grading, AI, and classroom features grow.

**Multiple independent apps for student, parent, instructor, and admin:** provides maximum separation but creates avoidable deployment, authentication, and design complexity for the current stage.

The modular single-product architecture is selected.

---

## 4. Identity, roles, and sign-in

### Roles

The first production architecture supports four human roles from day one:

| Role | Scope |
|---|---|
| **Admin** | Academy-wide curriculum, instructors, classes, reporting, certificates, privacy settings, and system configuration |
| **Instructor** | Assigned classes and their learners; grading, feedback, reopenings, supplements, and permitted certificate actions |
| **Student** | Own courses, work, grades, progress, Ellie assistance, projects, and certificates |
| **Parent/Guardian** | Linked child/children; enrollment/consent, progress, grades, feedback, account controls, and certificates |

One authenticated person may hold more than one legitimate role, but each role must be explicit and scoped.

### Authentication

Approved methods:

- email + password
- Google sign-in
- Apple sign-in
- parent-managed credentials/profile flow for younger learners where appropriate

Provider secrets and privileged backend credentials must never be exposed to the browser.

### Guest mode

Guests may view the public course page, review levels and expectations, open designated samples, and perform limited practice. Guests do **not** receive durable cross-device grades, instructor records, certificate eligibility, class membership, or permanent Academy academic records. Guest progress may remain local to the browser when useful.

---

## 5. Enrollment and class access

### Controlled class codes

Classes use **controlled class codes**, not open auto-enrollment.

1. A learner or guardian enters a class code.
2. The system creates an enrollment request, not immediate class membership.
3. The assigned instructor reviews the request.
4. Required parent/guardian consent/approval is completed for minors according to Academy policy and applicable law.
5. The student is admitted to the class.

Class codes are identifiers, not authentication secrets. They can be rotated, expired, or disabled by an authorized instructor/admin.

### Multi-instructor support

Admins can add instructors, assign one or more instructors to classes, remove assignments, and define permitted certificate/grading actions. An instructor's academic access is class-scoped; being an instructor does not confer Academy-wide visibility.

---

## 6. Child account and parent/guardian model

The platform uses age bands rather than exact dates of birth unless a later legal/operational requirement makes an exact birth date necessary.

Approved age bands:

- 6–8
- 9–11
- 12
- 13–14
- 15–17
- 18+

### Under-13 handling

For a learner identified as under 13, the application must avoid creating a durable, personally identifying child profile before the required parental notice/consent workflow is satisfied. A pre-consent session may use an opaque short-lived token and minimal non-identifying state to continue enrollment.

The exact verifiable parental consent method is a **production launch gate**: it must be selected and reviewed against the Academy's actual data uses before enrolling under-13 learners at scale.

### Ages 13–17

Teen learners may have their own login, but the Academy's launch policy requires parent/guardian contact and approval for minor enrollment. This is a product safety/operations rule and is separate from claims about the scope of any specific law.

### Age 18+

Adults may manage their own Academy account independently.

### Parent dashboard

A guardian can link multiple children, approve enrollment where required, review progress and scores, read appropriate instructor feedback, manage applicable consent/privacy choices, manage the child's Academy profile within permitted limits, and access issued certificates.

A guardian cannot take assessments for the learner, change grades, issue a certificate, or impersonate an instructor.

---

## 7. Course levels

### Explorer — ages approximately 6–8

Visual logic, sequencing, patterns, block-style coding concepts, short reading segments, large guided steps, frequent feedback, and demonstration/explanation appropriate to early readers.

### Voyager — ages approximately 9–11

Foundational coding, variables, conditions, loops, functions, debugging, transition from blocks toward introductory JavaScript, and increasing independence.

### Commander — ages approximately 12–14

JavaScript as the primary coding language, code reading and prediction, deeper debugging, data/state, functions, tests, UI/UX, and systems thinking.

### Pioneer — ages approximately 15–18+ / advanced

Advanced JavaScript, software architecture, pseudocode, refactoring, debugging methodology, version-control concepts, testing, documentation, technical communication, and mentoring/peer explanation.

Older learners must receive a visually mature treatment even when the Academy brand remains consistent.

---

## 8. 14-week curriculum map

| Week | Shared Theme | Explorer | Voyager | Commander | Pioneer |
|---|---|---|---|---|---|
| 1 | Liftoff — What Is Code? | Visual sequences and ordered instructions | Algorithms, blocks, first code concepts | JavaScript statements, execution order, events | Requirements, algorithms, program structure |
| 2 | Variables & Values | Named boxes / stored information | Variables in blocks + intro JS | `let`, `const`, strings, numbers, state | Data modeling, state design, naming, invariants |
| 3 | Making Choices | If-this-then-that visual logic | Conditions and simple `if/else` | Boolean logic, comparison, compound conditions | Validation, decision trees, edge cases |
| 4 | Doing It Again | Repeat visual actions | Block loops + intro JS loops | `for`, `while`, iteration strategies | Loop design, efficiency, refactoring repetition |
| 5 | Talking to Teammates | Reusable commands | Functions + simple parameters | Parameters, returns, scope | Abstraction, contracts, reusable APIs |
| 6 | Keeping Score | Counters and changing values | Game scores + basic collections | Arrays, objects, game state | Data structures, state management, invariants |
| 7 | Midpoint Checkpoint | Find simple bugs | Debug blocks/JS | DevTools concepts, test cases, systematic debugging | Debug methodology, tests, midpoint technical challenge |
| 8 | Daily Missions | Choices inside repeats | Loops + conditions | Algorithms, state updates, nested logic | State machines, optimization, behavior design |
| 9 | New Worlds | Arrange UI elements and information | Interface basics + DOM ideas | DOM, events, forms, accessibility | Component architecture, UX, accessibility engineering |
| 10 | Ask the Right Question | Ask a function a question | Return values | Return values, pure functions, composition | Interfaces, error handling, contracts |
| 11 | Working Together | Connect simple systems | Events + variables + functions | Modules and integrated systems | Architecture, integration boundaries, dependencies |
| 12 | Polish Pass | Make instructions clearer | Clean beginner code | Refactoring, readability, tests | Technical debt, coverage, architecture refactoring |
| 13 | Dress Rehearsal | Explain and demonstrate | Polish a playable project | QA, documentation, presentation | Code review, release checklist, documentation, technical presentation |
| 14 | Family Showcase | Guided interactive demonstration | Completed Star Hop experience | Complete coded Star Hop capstone | Engineered capstone with architecture, tests, docs, presentation |

There are **56 complete lessons**: 14 weeks × 4 levels.

---

## 9. Exact 90-minute lesson model

| Time | Activity |
|---|---|
| 0–8 min | Mission Launch, retrieval practice, warm-up |
| 8–23 min | New concept instruction with age-appropriate examples |
| 23–38 min | Guided practice with immediate feedback |
| 38–63 min | Coding Lab + Star Hop build challenge |
| 63–73 min | Study/review material and worked-example review |
| 73–83 min | Knowledge check / graded formative assessment |
| 83–88 min | Quest Log reflection and explanation of learning |
| 88–90 min | Exit check, save progress, preview next mission |

Total: **90 minutes**.

Every one of the 56 lessons must include a mission introduction, measurable objectives, prerequisite/retrieval review, level-specific vocabulary, concept lesson, worked examples, guided practice, immediate-feedback practice, coding activity, substantial Star Hop milestone, study notes, formative assessment, Quest Log, extension, remediation, accessibility/differentiation considerations, and instructor-only pacing notes, prompts, misconceptions, rubric/solutions, and answer key where applicable.

The student and instructor views derive from the same versioned lesson source so they cannot silently drift apart.

---

## 10. Hybrid self-paced + instructor-led delivery

### Student mode

A learner can independently progress through the lesson, receive structured feedback, use the coding lab, ask Ellie for permitted help, complete the knowledge check, and save work.

### Teaching view

An instructor sees the same lesson plus pacing suggestions, demonstrations, questions to ask, expected answers, common misconceptions, differentiation, accommodations, suggested pause/check points, private solutions/keys, and grading guidance.

The official curriculum is **Admin-published and protected**. Instructors may add class notes, supplements, optional enrichment, due dates, accommodations, and instructor directions, but may not silently rewrite the Academy's canonical course content.

---

## 11. Curriculum versioning and publishing

The curriculum is versioned, for example Adventure Quest 1.0, 1.1, and 2.0. A student's enrollment references a specific published version. Publishing a new version does not mutate historical content/requirements associated with prior academic records.

Minimum states: `draft`, `review`, `published`, `retired`.

Only an authorized Admin can publish or retire a canonical course version.

Publishing must reject or visibly flag missing objectives, missing required lesson sections, missing remediation, invalid assessment items, True/False items with anything other than exactly two values, missing answer keys where required, broken coding challenge references, or missing level-specific content.

---

## 12. Assessment model

### Course grade weights

| Component | Weight |
|---|---:|
| Weekly knowledge checks | 25% |
| Coding Lab + Star Hop builds | 35% |
| Week 7 midpoint | 15% |
| Week 14 final capstone | 25% |
| **Total** | **100%** |

Quest Logs/reflections are required for completion but are not heavily scored as personal expression.

### Completion requirements

A learner earns course completion when all of the following are true:

- all 14 required lessons are complete
- overall mastery is at least 80%
- Week 7 midpoint is completed
- Week 14 final capstone score is at least 80%
- required Star Hop milestones are complete
- required Quest Logs/reflections are submitted
- instructor-reviewed build requirements are satisfied where applicable

### Remediation

Below-mastery work leads to targeted review, alternate worked examples, additional practice, hint-based Ellie tutoring where permitted, and a retry/revision opportunity.

### Assessment types by level

**Explorer:** visual sequencing, matching, ordering, two-choice True/False, picture/logic selections, simple explanation.

**Voyager:** scenario multiple choice, ordering, block/code mapping, output prediction, fill-the-gap code, simple debugging.

**Commander:** code reading, code output, debugging, short coding responses, test-case reasoning, implementation tasks.

**Pioneer:** deeper debugging investigations, code construction, refactoring, test design, architecture reasoning, technical explanation.

### Question schema rules

Question type determines the renderer. `true_false` has exactly True and False; `single_choice` has one correct option with plausible distractors; additional types include `multi_select`, `ordering`, `code_prediction`, `debugging`, `short_response`, and `code_submission`.

The current v1 bug where a True/False prompt can display unrelated extra answers must be impossible by schema.

Weekly checks draw from a curated level-specific bank larger than one presented attempt. Midpoint/final attempts and authorized resets are stored as academic events.

---

## 13. Week 7 midpoint and Week 14 capstone

The Week 7 midpoint covers Weeks 1–6 plus debugging and includes knowledge plus practical application, authored separately for all four levels.

The Week 14 final is primarily performance-based. Students complete and demonstrate the level-appropriate Star Hop project. Rubrics emphasize functionality, correct application of concepts, debugging/testing evidence, communication, and code/project quality appropriate to the level. Pioneer additionally includes architecture, testing, documentation, and technical justification.

---

## 14. Gradebook and instructor actions

Instructor view includes class roster, current week, mastery by objective, knowledge-check attempts, coding/build submissions, missing work, Quest Logs, feedback history, AI assistance metadata, midpoint/capstone status, and certificate eligibility.

Allowed actions include scoring rubric-based work, feedback, revision requests, reopening an assignment, authorizing retries where policy permits, correcting grading errors, and recommending/issuing a certificate where role policy permits.

Sensitive academic changes create an audit event including actor, action, affected record, and timestamp.

---

## 15. Certificates and verification

Successful learners receive an **Ellie's FutureMinds Academy Certificate of Completion** for Ellie's Adventure Quest.

Certificate fields include learner display/name according to privacy settings, course title, completed level, completion date, **21 instructional hours**, unique certificate identifier, and Academy identity.

The system does not claim accreditation, licensure, college credit, CEUs, or another external credential status unless separately obtained and documented.

A server-side verification endpoint accepts the identifier and returns the minimum necessary confirmation. For minors, default public verification does not expose a full child profile or academic record. A safe default is certificate status, course, level, completion date, 21 instructional hours, and masked/privacy-preserving learner identification unless policy explicitly permits more.

Eligibility and issuance are validated server-side; browser state cannot manufacture a valid credential.

---

## 16. Coding Lab

The coding lab is embedded in the Academy.

### Explorer / early Voyager

Use a Blockly-style visual programming surface with large touch targets and clear execution feedback. Explorer stays primarily visual; Voyager progressively reveals the JavaScript represented by blocks.

### Commander / Pioneer

Use a modern in-browser editor such as CodeMirror 6 with syntax highlighting, line numbers, console/output, reset, starter code, run, test, autosave, submit, instructor feedback, and multiple files where Pioneer requires them.

On small screens, editor and output switch to accessible tabs/panes rather than becoming unusably narrow.

### Code isolation

Student-authored code is untrusted and does not execute inside the Academy application's main security context.

Required controls include sandboxed iframe and/or isolated Web Worker, no Academy session token or privileged database credential in the runner, restrictive CSP, network access disabled by default, time/execution limits, output-size limits, worker termination for runaway code, and explicit reset/recovery.

A student's infinite loop must not freeze the whole Academy.

Visible formative tests may run in the browser sandbox. Any “hidden” tests delivered to the browser are treated only as instructional obscurity, not tamper-proof security. High-value grading remains based on trusted scoring rules, server-side academic records, and instructor-reviewed builds/capstones.

Student work supports draft autosave, explicit submit, immutable submission snapshot, instructor feedback, allowed revision, and later immutable snapshot.

Launch scope does not allow arbitrary executable uploads such as `.exe`, `.apk`, shell scripts, or unrestricted archives.

---

## 17. Ellie AI Tutor

Ellie may explain concepts at the student's level, simplify or deepen explanations, give progressively stronger hints, review code and explain errors, help debug, generate extra ungraded practice, support read-aloud/voice where available, and help students reflect.

### Modes

**Learning Mode:** explanations, hints, practice, debugging.

**Graded-Work Mode:** concept explanation and hints, but not simply producing the assessed final answer or completing graded code.

**Assessment-Safe Mode:** interface/accessibility help and clarification of non-content instructions, but no solving or materially coaching assessment answers.

The Academy application determines the mode; the model is not trusted to decide its own permissions.

Ellie receives only lesson-scoped academic context needed for the interaction. By default, the Academy does not maintain a permanent full transcript of routine child-AI conversations. Durable records may store lesson/activity, assistance level/category, whether hints/debugging help was used, a minimal learning metadata summary when justified, and any reflection the student intentionally saves.

Before production, the Academy documents the selected AI provider's data handling, retention, training/use terms, relevant subprocessors, and minor-user configuration. API credentials remain server-side.

---

## 18. Privacy, consent, and student records

### U.S.-first, globally ready

Launch policy targets the United States first. Region, age policy, consent policy, and policy version are configurable concepts so future international expansion does not require replacing the account architecture.

### COPPA-oriented design

The platform is intentionally designed for children, including users under 13, so the production launch treats COPPA obligations as a primary design constraint. FTC materials for the updated COPPA Rule describe requirements for covered services around parental notice/consent and strengthened controls on data use/retention.

This specification is a product/security design, not legal advice. A qualified privacy/legal review of the actual launch flow, data inventory, third parties, notices, and consent mechanism is a release gate before broad under-13 enrollment.

### FERPA readiness without false claims

The Academy is not labeled “FERPA certified.” When schools/districts use the service and education records are involved, the architecture supports tenant/class scoping, restricted purpose, access controls, and contractual/operational terms compatible with school obligations. Department of Education guidance for the school-official exception emphasizes direct control over use/maintenance, legitimate educational purpose, and restrictions on unauthorized use/redisclosure.

### Data minimization

Do not collect by default: home address, precise location, government identifiers, unnecessary phone numbers, public biographies, unnecessary demographics, or exact birth date where an age band is sufficient.

No public student profiles or public leaderboards are part of launch scope. The learning platform has no behavioral advertising system for children, no student advertising profile, and no sale of student information.

---

## 19. Consent center

The Parent/Guardian portal includes a Privacy & Consent center showing linked children, current consent state, applicable policy version, data categories collected, why they are needed, major third-party service categories, AI feature status, applicable controls, and the access/correction/deletion request process.

Consent events are versioned and timestamped. Revoking a permission triggers the corresponding access/data workflow rather than merely changing a cosmetic toggle.

---

## 20. Authorization and Row Level Security

RLS is the default authorization boundary for user-accessible Academy data.

| Data | Student | Parent/Guardian | Instructor | Admin |
|---|---|---|---|---|
| Public curriculum | Read | Read | Read | Read/manage publishing |
| Own student profile | Read/limited update | Linked child read/limited management | Assigned-class academic fields only | Authorized admin access |
| Another student's record | No | Linked children only | Assigned-class students only | Authorized admin access |
| Parent profile | No | Own only | No | Authorized admin access |
| Class roster | Own membership context | Child's relevant context | Assigned classes | All authorized classes |
| Grades/submissions | Own | Linked child | Assigned classes | Authorized admin access |
| Canonical curriculum edit | No | No | No | Yes |
| Instructor supplements | No | Read if relevant | Assigned class manage | Manage |
| Consent records | Limited as appropriate | Linked child/manage permitted choices | Status only if policy requires | Authorized privacy/admin access |
| Audit records | No | No | Limited action receipt if exposed | Authorized admin/security access |
| Certificates | Own | Linked child | Assigned students/permitted issue flow | Manage |

Role assignment, grade override, certificate issuance, sensitive consent transitions, and similar actions use trusted server-side operations. The Supabase service-role credential must never ship to client code.

---

## 21. Core data model

Exact SQL naming may change in the implementation plan, but boundaries and relationships remain equivalent.

### Organization / tenancy

- `organizations` (Ellie's FutureMinds Academy is the initial/default organization)
- `organization_memberships`

Classes, instructor assignments, and school/community-partner records are organization-scoped so future partners can be isolated without rebuilding the core model. Canonical Academy curriculum may remain centrally published while assignments/enrollments stay tenant-scoped.

### Identity and roles

- `profiles`
- `role_memberships`
- `student_profiles`
- `guardian_profiles`
- `guardian_student_links`
- `instructor_profiles`

### Curriculum

- `courses`
- `course_versions`
- `course_levels`
- `lessons`
- `lesson_sections`
- `learning_objectives`
- `study_materials`
- `coding_challenges`
- `assessment_banks`
- `assessment_items`
- `rubrics`

### Classroom

- `classes`
- `class_instructors`
- `class_codes`
- `enrollment_requests`
- `enrollments`
- `class_supplements`
- `class_assignments`

### Academic record

- `lesson_progress`
- `objective_mastery`
- `assessment_attempts`
- `assessment_responses`
- `coding_drafts`
- `submission_snapshots`
- `submission_feedback`
- `quest_logs`
- `grade_events`
- `certificate_records`

### Privacy / platform

- `consent_policies`
- `consent_events`
- `ai_assistance_events`
- `audit_events`
- `regional_policy_config`

---

## 22. Retention model

Retention follows purpose limitation and data minimization. Proposed launch defaults are confirmed in the pre-production privacy/legal review and made configurable where institutional contracts lawfully require a different period.

| Data category | Proposed launch behavior |
|---|---|
| Guest learning state | Browser-local; no durable server record by default |
| Routine full Ellie chat | Not durably stored by the Academy after the active session by default |
| AI assistance metadata | Retain with related academic record only while useful for instruction/review, then delete per academic-record policy |
| Unsubmitted drafts | Retain during active enrollment; purge after a defined post-course grace period unless intentionally preserved |
| Submitted work / grades | Retain for active course and a limited post-course record period; school contracts may define a different period |
| Parent/guardian consent records | Retain only as long as needed to document/operate the relevant consent relationship and legitimate purpose |
| Security/audit events | Time-limited operational retention; longer only for an active incident, dispute, or documented requirement |
| Certificate verification record | Keep minimum verification record while certificate remains valid; do not preserve unnecessary child profile data |
| Deleted account identifiers | Remove or de-identify unless a retained record has an independent legitimate purpose |

The release checklist converts the grace period and security log windows into documented operational values before production. This is deliberately blocked on the final privacy/legal review rather than inventing retention durations unsupported by the Academy's actual contracts and obligations.

---

## 23. UX structure

### Public course page

Explains what Adventure Quest teaches, four levels, 14-week structure, 21 instructional hours, Star Hop capstone, Ellie Tutor, parent/instructor support, and the Certificate of Completion.

Primary CTAs: **Start Learning**, **Parent/Guardian**, **Join a Class**. A sample lesson is available without account creation.

### Student navigation

Home · My Course · Coding Lab · Progress · Ellie · Certificates

Student home prioritizes the next action, e.g. **Continue Week 4: Loops**.

Lesson progression: **Mission Launch → Learn → Practice → Code → Study → Check → Reflect → Complete**.

### Parent navigation

Overview · Course Progress · Grades · Feedback · Consent & Privacy · Certificates

### Instructor navigation

Dashboard · Classes · Students · Submissions · Gradebook · Curriculum · Certificates

Dashboard emphasizes actionable work: submissions to review, students below mastery, pending enrollment requests, missing work, and certificate readiness.

### Admin navigation

Academy · Curriculum · Classes · People · Instructors · Reports · Certificates · Privacy · Settings

### Curriculum Studio

Admins navigate course → level → week and can edit draft structured blocks, preview student/teaching views, run validation, and publish a version.

---

## 24. Visual and accessibility direction

The product should feel optimistic, intelligent, approachable, safe, and future-facing. Default appearance is light and welcoming with generous spacing and clear typography. Ellie is present as mascot/tutor without dominating every screen.

Required accessibility features include semantic HTML/landmarks, keyboard operation, visible focus, accessible labels, scalable text, zoom-safe layouts, sufficient contrast, reduced motion, captions/transcripts where media is used, no reliance on color alone, large touch targets, coding-lab accommodations, light/dark appearance, and large-text control.

Advanced coding remains accessible from phones, but the product may recommend a larger screen/keyboard where that materially improves the activity.

---

## 25. Reliability and integrity requirements

Required behavior:

- autosave protects active work
- double-submission does not create duplicate grades/submissions
- network interruption does not reset a lesson to minute zero
- database constraints prevent invalid role relationships where practical
- curriculum version snapshots preserve historical meaning
- grade/certificate actions are auditable
- student code cannot access Academy session secrets
- unpublished lessons cannot appear as published
- a certificate cannot be issued from client-only state

Critical authorization tests include student-to-student isolation, parent linked-child isolation, instructor assigned-class isolation, URL-manipulation resistance, consent/enrollment state enforcement, guest credential denial, client role-escalation rejection, Admin-only canonical publish, mastery enforcement for certificates, grade-override audit event, and guardian-link revocation.

Curriculum integrity tests include all 56 required lessons, all approved lesson sections, non-empty materially distinct level content, exact two-choice True/False schema, valid scoring data, assessment answer keys/private solutions/instructor-only rubrics unavailable from student/public endpoints, required remediation content, valid coding challenge references, and correct 90-minute pacing metadata.

---

## 26. Launch sequence

### Phase 1 — Academy foundation

Supabase project/environment model, authentication, roles, four portals, guardian-child links, class codes/enrollment approvals, consent records, audit system, responsive shell.

### Phase 2 — Curriculum engine

Versioned course model, four levels, all 56 lesson structures, instructor teaching view, Curriculum Studio, validation.

### Phase 3 — Coding Lab

Block-based Explorer/Voyager engine, JavaScript Commander/Pioneer editor, isolation/sandbox, autosave, submissions.

### Phase 4 — Assessments and gradebook

Weekly checks, question banks, build rubrics, midpoint, capstone, remediation/retries, mastery calculation.

### Phase 5 — Ellie AI Tutor

Provider abstraction/server proxy, Learning Mode, Graded-Work Mode, Assessment-Safe Mode, assistance metadata.

### Phase 6 — Certificates and reporting

Eligibility engine, PDF certificates, verification endpoint, parent/student certificate history, instructor/admin reports.

---

## 27. Pilot design

Do not begin with an unrestricted worldwide academic launch. First run a controlled Academy pilot with a small set of learners/instructors and verify the complete journey:

**Enrollment → Guardian approval → Instructor approval → Lesson → Coding Lab → Assessment → Autosave → Submission → Instructor review → Gradebook → Remediation → Mastery → Capstone → Certificate**

The public course page may be available broadly while authenticated academic enrollment remains controlled.

Pilot evidence includes enrollment completion, consent-flow friction, actual lesson completion time vs 90-minute design, coding-lab errors, autosave/recovery failures, question-quality issues, instructor grading workload, remediation success, parent comprehension, accessibility defects, and mobile usability defects.

---

## 28. Production-ready definition

Adventure Quest is not production-ready until:

1. all 56 lessons are complete and content-QA reviewed;
2. all four portals function;
3. controlled class enrollment works;
4. minor consent/approval flow passes pre-production privacy/legal review;
5. signed-in progress persists across devices;
6. coding labs work at every level and enforce isolation;
7. assessment schemas/scoring are tested;
8. gradebook/mastery calculations are tested;
9. Week 7 midpoint exists for all four levels;
10. Week 14 capstone exists for all four levels;
11. Ellie respects assistance modes;
12. review/reopen/revision flows work;
13. certificate eligibility/issuance/verification is server-side;
14. critical RLS/authorization tests pass;
15. critical desktop/mobile journeys pass;
16. accessibility review finds no blocking issue;
17. backup/recovery and environment separation are documented for the production backend;
18. retention values and provider data-handling documentation are approved for launch.

---

## 29. Explicitly out of launch scope

The first production version does **not** require public student profiles, public leaderboards, behavioral advertising, arbitrary executable uploads, accreditation claims, college-credit claims, live student-to-student chat, full school SIS integration, a separate native mobile app, four independently deployed portal applications, unrestricted AI answer generation during graded work, or permanent full child-AI transcripts by default.

---

## 30. Current platform/service facts informing the design

These facts were checked against current official sources during design finalization:

- Supabase Auth supports email/password and social login including Google and Apple.
- Supabase integrates Auth with PostgreSQL Row Level Security.
- As of this specification date, Supabase's published Free-plan quotas include 500 MB database size per project, 1 GB storage, 50,000 monthly active users, 5 GB egress, and 500,000 Edge Function invocations. These are operational assumptions only and must be rechecked before launch because vendor limits change.
- FTC materials for the amended COPPA Rule describe requirements for covered child-directed/under-13 services including parental controls/consent, data-use limits, and limits on retaining children's information indefinitely.
- Department of Education FERPA guidance for third-party “school official” use emphasizes direct control over use/maintenance, legitimate educational purpose, and restrictions on unauthorized redisclosure/use.

### Reference links

- FTC COPPA Rule: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
- FTC 2025 COPPA amendment announcement: https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data
- U.S. Department of Education — school official FAQ: https://studentprivacy.ed.gov/faq/who-school-official-under-ferpa
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Google Auth: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase Apple Auth: https://supabase.com/docs/guides/auth/social-login/auth-apple
- Supabase billing/quotas: https://supabase.com/docs/guides/platform/billing-on-supabase

---

## 31. Approved design decision record

Approved decisions captured here:

- four distinct levels: Explorer, Voyager, Commander, Pioneer
- hybrid self-paced + instructor-led delivery
- blocks → introductory JavaScript → JavaScript → advanced JS/software practice progression
- mastery-based assessment and Certificate of Completion
- guest exploration + accounts for durable academic records
- full Instructor Dashboard
- multi-instructor from day one
- separate Parent/Guardian portal
- controlled class-code enrollment
- email/password + Google + Apple sign-in
- Supabase backend/auth foundation
- protected canonical curriculum + instructor supplements
- embedded Academy coding lab
- Ellie AI Tutor with assessment safeguards
- privacy-minimized AI records
- U.S.-first, globally ready architecture
- modular single-product Academy architecture
- 14 weeks × 4 levels = 56 lessons
- exact 90-minute lesson model
- 80% mastery threshold and approved grade weights
- child-first privacy/security design
- versioned curriculum and isolated code execution
- staged pilot/release model
- four-portal UX and Curriculum Studio

---

## 32. Next process step

After the human partner reviews and approves this **written specification**, the next step is to create the implementation plan using the `writing-plans` workflow. No rebuild implementation should begin before that written plan is reviewed and an execution method is selected.
