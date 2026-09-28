const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../assets/progression.js');

const baseState = (startDate='2026-09-27', mastery={}) => ({
  version:2,
  enrollment:{startDate, initializedAt:startDate+'T12:00:00.000Z', highestScheduledWeekSeen:1},
  mastery
});
const mastered = () => ({status:'mastered',quizBest:100,quizAttempts:1,practicalComplete:true,teachBackComplete:true,masteredAt:'2026-09-27T12:00:00.000Z',conceptsNeedingReview:[]});

test('scheduledWeek uses seven-day release buckets and caps at 14', () => {
  assert.equal(P.scheduledWeek('2026-09-27','2026-09-27',1).scheduledWeek,1);
  assert.equal(P.scheduledWeek('2026-09-27','2026-10-03',1).scheduledWeek,1);
  assert.equal(P.scheduledWeek('2026-09-27','2026-10-04',1).scheduledWeek,2);
  assert.equal(P.scheduledWeek('2026-09-27','2026-10-10',1).scheduledWeek,2);
  assert.equal(P.scheduledWeek('2026-09-27','2027-01-15',1).scheduledWeek,14);
});

test('clock rollback never lowers highest scheduled week already seen', () => {
  const r=P.scheduledWeek('2026-09-27','2026-09-28',5);
  assert.equal(r.scheduledWeek,5);
  assert.equal(r.highestScheduledWeekSeen,5);
});

test('mastering early never unlocks a future calendar week', () => {
  const s=baseState('2026-09-27',{'01':mastered()});
  const e=P.eligibility(s,'2026-09-29');
  assert.equal(e.scheduledWeek,1);
  assert.equal(e.currentEligibleWeek,1);
  assert.deepEqual(e.accessibleMissionIds,['01']);
});

test('week 2 opens on day 7 only when week 1 is mastered', () => {
  const noMaster=P.eligibility(baseState(),'2026-10-04');
  assert.equal(noMaster.currentEligibleWeek,1);
  const yesMaster=P.eligibility(baseState('2026-09-27',{'01':mastered()}),'2026-10-04');
  assert.equal(yesMaster.currentEligibleWeek,2);
  assert.deepEqual(yesMaster.accessibleMissionIds,['01','02']);
});

test('mastery gate stops catch-up at the earliest unmastered week', () => {
  const s=baseState('2026-09-27',{'01':mastered(),'02':mastered()});
  s.enrollment.highestScheduledWeekSeen=6;
  const e=P.eligibility(s,'2026-11-01');
  assert.equal(e.scheduledWeek,6);
  assert.equal(e.currentEligibleWeek,3);
  assert.deepEqual(e.accessibleMissionIds,['01','02','03']);
});
