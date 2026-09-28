const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../assets/progression.js');
const mastered=()=>({status:'mastered',quizBest:100,quizAttempts:1,practicalComplete:true,teachBackComplete:true,masteredAt:'x',conceptsNeedingReview:[]});
const state=(date='2026-09-27',mastery={},path='voyager')=>({version:2,path,enrollment:{startDate:'2026-09-27',initializedAt:'x',highestScheduledWeekSeen:1},mastery,questLog:{},capstone:{},prefs:{theme:'system',largeText:false}});

test('day 1 permits mission 1 and blocks mission 2 direct URL',()=>{
  assert.equal(P.routeDecision(['missions','01'],state(),'2026-09-27').allowed,true);
  const denied=P.routeDecision(['missions','02'],state(),'2026-09-27');
  assert.equal(denied.allowed,false);
  assert.equal(denied.redirectTo,'missions/01');
  assert.match(denied.message,/not available yet/i);
});

test('day 7 still blocks mission 2 until week 1 mastery',()=>{
  assert.equal(P.routeDecision(['missions','02'],state(),'2026-10-04').allowed,false);
  const s=state('2026-09-27',{'01':mastered()});
  assert.equal(P.routeDecision(['missions','02'],s,'2026-10-04').allowed,true);
});

test('changing learning path cannot change eligibility',()=>{
  const a=P.routeDecision(['missions','02'],state('2026-09-27',{},'voyager'),'2026-09-27');
  const b=P.routeDecision(['missions','02'],state('2026-09-27',{},'pioneer'),'2026-09-27');
  assert.equal(a.allowed,b.allowed);
  assert.equal(a.redirectTo,b.redirectTo);
});

test('showcase remains locked until week 14 is the eligible week',()=>{
  assert.equal(P.routeDecision(['showcase'],state(),'2026-09-27').allowed,false);
  const mastery={}; for(let i=1;i<=13;i++) mastery[String(i).padStart(2,'0')]=mastered();
  const s=state('2026-09-27',mastery); s.enrollment.highestScheduledWeekSeen=14;
  assert.equal(P.routeDecision(['showcase'],s,'2026-12-27').allowed,true);
});
