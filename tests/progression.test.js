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

test('migrateV1 preserves learning data without trusting manual completion', () => {
  const legacy={version:1,path:'commander',completed:['01','02','99'],quizScores:{'01':90,'02':105,'99':100},questLog:{'01':{built:'rocket'}},capstone:{item0:true},prefs:{theme:'dark',largeText:true}};
  const s=P.migrateV1(legacy,'2026-09-27');
  assert.equal(s.version,2);
  assert.equal(s.path,'commander');
  assert.equal(s.prefs.theme,'dark');
  assert.equal(s.prefs.largeText,true);
  assert.equal(s.questLog['01'].built,'rocket');
  assert.equal(s.mastery['01'].quizBest,90);
  assert.equal(s.mastery['02'].quizBest,100);
  assert.equal(s.mastery['01'].legacyCompleted,true);
  assert.notEqual(s.mastery['01'].status,'mastered');
  assert.equal(s.mastery['99'],undefined);
  assert.equal(s.enrollment.startDate,'2026-09-27');
  assert.equal(s.enrollment.highestScheduledWeekSeen,1);
});

test('sanitizeV2 repairs corrupt state without inventing mastery', () => {
  const s=P.sanitizeV2({version:2,path:'hacker',enrollment:{startDate:'bad',highestScheduledWeekSeen:99},mastery:{'01':{status:'mastered',quizBest:'nope',practicalComplete:true,teachBackComplete:true}},prefs:{theme:'purple'}},'2026-09-27');
  assert.equal(s.path,'voyager');
  assert.equal(s.enrollment.startDate,'2026-09-27');
  assert.equal(s.enrollment.highestScheduledWeekSeen,14);
  assert.equal(s.mastery['01'].status,'in-progress');
  assert.equal(s.mastery['01'].quizBest,0);
  assert.equal(s.prefs.theme,'system');
});

test('createDefaultV2 creates a private account-free week 1 enrollment', () => {
  const s=P.createDefaultV2('2026-09-27');
  assert.equal(s.version,2);
  assert.equal(s.path,'voyager');
  assert.equal(s.enrollment.startDate,'2026-09-27');
  assert.equal(s.enrollment.highestScheduledWeekSeen,1);
  assert.deepEqual(s.mastery,{});
});

test('sanitizeV2 rejects impossible calendar dates',()=>{
  const s=P.sanitizeV2({version:2,enrollment:{startDate:'2026-99-99',highestScheduledWeekSeen:1}},'2026-09-27');
  assert.equal(s.enrollment.startDate,'2026-09-27');
});

test('optional review cannot revoke earned practical completion',()=>{
  let s=P.createDefaultV2('2026-09-27');
  s=P.recordPracticalEvidence(s,'01',{built:'x',tested:'x',challenge:'x',solution:'x'});
  assert.equal(s.mastery['01'].practicalComplete,true);
  s=P.recordPracticalEvidence(s,'01',{built:'',tested:'',challenge:'',solution:''});
  assert.equal(s.mastery['01'].practicalComplete,true);
});

test('optional teach-back review cannot revoke an earlier pass',()=>{
  let s=P.createDefaultV2('2026-09-27');
  s=P.recordTeachBackResult(s,'01',{passed:true,matchedConcepts:['sequence'],missingConcepts:[]},'2026-09-27T12:00:00Z');
  assert.equal(s.mastery['01'].teachBackComplete,true);
  s=P.recordTeachBackResult(s,'01',{passed:false,matchedConcepts:[],missingConcepts:['sequence']},'2026-09-27T12:05:00Z');
  assert.equal(s.mastery['01'].teachBackComplete,true);
});
