const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../assets/progression.js');
const M=require('../assets/mastery-data.js');

const fresh=()=>P.createDefaultV2('2026-09-27');

test('quiz gate requires 80 percent and preserves best score',()=>{
  let s=P.recordQuizResult(fresh(),'01',79,['sequence'],'2026-09-27T12:00:00Z');
  assert.equal(s.mastery['01'].quizBest,79);
  assert.equal(s.mastery['01'].status,'in-progress');
  s=P.recordQuizResult(s,'01',80,[],'2026-09-27T12:01:00Z');
  assert.equal(s.mastery['01'].quizBest,80);
  assert.equal(s.mastery['01'].quizAttempts,2);
  s=P.recordQuizResult(s,'01',60,[],'2026-09-27T12:02:00Z');
  assert.equal(s.mastery['01'].quizBest,80);
  assert.equal(s.mastery['01'].quizAttempts,3);
});

test('mastery requires quiz practical and teach-back together',()=>{
  const combos=[[80,false,false],[0,true,false],[0,false,true],[80,true,false],[80,false,true],[0,true,true]];
  for(const [score,practical,teach] of combos){const s=fresh();s.mastery['01']={...P.normalizeMasteryRecord({quizBest:score,quizAttempts:score?1:0,practicalComplete:practical,teachBackComplete:teach})};const r=P.recomputeMastery(s,'01','2026-09-27T12:00:00Z');assert.notEqual(r.mastery['01'].status,'mastered');}
  const s=fresh();s.mastery['01']=P.normalizeMasteryRecord({quizBest:80,quizAttempts:1,practicalComplete:true,teachBackComplete:true});const r=P.recomputeMastery(s,'01','2026-09-27T12:00:00Z');assert.equal(r.mastery['01'].status,'mastered');assert.ok(r.mastery['01'].masteredAt);
});

test('practical evidence rejects blanks and requires build test challenge solution',()=>{
  let s=P.recordPracticalEvidence(fresh(),'01',{built:'rocket',tested:'',challenge:'bug',solution:'fixed'});assert.equal(s.mastery['01'].practicalComplete,false);
  s=P.recordPracticalEvidence(s,'01',{built:'rocket',tested:'I tried three moves',challenge:'bug',solution:'fixed sequence'});assert.equal(s.mastery['01'].practicalComplete,true);
});

test('teach-back checks concepts rather than exact phrases for representative weeks',()=>{
  assert.equal(M.evaluateTeachBack('01','A sequence is instructions put in the correct order so the computer follows each step.',0).passed,true);
  assert.equal(M.evaluateTeachBack('02','A variable is a named place that stores a value which can change.',0).passed,true);
  assert.equal(M.evaluateTeachBack('04','A loop repeats instructions so we do not have to write the same steps again.',0).passed,true);
  assert.equal(M.evaluateTeachBack('10','A function can take an input, do work, and return a value back to the program.',0).passed,true);
});

test('teach-back failure gives a targeted hint and rotates prompt',()=>{const r=M.evaluateTeachBack('04','It does stuff.',0);assert.equal(r.passed,false);assert.ok(r.missingConcepts.length>0);assert.match(r.hint,/repeat|loop/i);assert.equal(r.nextPromptIndex,1);});

test('Ellie remediation follows identify explain example retry order',()=>{const r=M.ellieResponse({weekId:'07',type:'remediation',concepts:['debug'],promptIndex:0,maxWeek:7});assert.match(r.heading,/debug|review/i);assert.ok(r.message.length>20);assert.ok(r.example.length>10);assert.match(r.actionLabel,/try|answer|again/i);assert.ok(r.sectionAnchor);});

test('Ellie refuses to reveal future-week teaching',()=>{const r=M.ellieResponse({weekId:'07',type:'help',concepts:[],promptIndex:0,maxWeek:4});assert.equal(r.blocked,true);assert.match(r.message,/later|weeks 1.?4|week 4/i);assert.doesNotMatch(r.message,/debugging process|reproduce the bug/i);});

test('passing teach-back marks teach-back complete and clears recovered concepts',()=>{let s=fresh();s.mastery['04']=P.normalizeMasteryRecord({quizBest:80,quizAttempts:1,practicalComplete:true,conceptsNeedingReview:['loop']});s=P.recordTeachBackResult(s,'04',{passed:true,matchedConcepts:['loop','repeat','instruction'],missingConcepts:[]},'2026-09-27T12:00:00Z');assert.equal(s.mastery['04'].teachBackComplete,true);assert.deepEqual(s.mastery['04'].conceptsNeedingReview,[]);assert.equal(s.mastery['04'].status,'mastered');});
