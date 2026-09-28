const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../assets/progression.js');
const U=require('../assets/ui-model.js');

const missions=Array.from({length:14},(_,i)=>({id:String(i+1).padStart(2,'0'),title:`Title ${i+1}`,focus:`Focus ${i+1}`}));
const fresh=()=>P.createDefaultV2('2026-09-27');

test('mission map hides future titles and marks only week 1 current for a new student',()=>{
  const rows=U.missionMapModel(missions,fresh(),'2026-09-27');
  assert.equal(rows[0].state,'current');
  assert.equal(rows[0].title,'Title 1');
  assert.equal(rows[1].state,'locked');
  assert.equal(rows[1].title,null);
  assert.equal(rows[1].clickable,false);
});

test('mastery checklist has four requirements plus computed week mastered',()=>{
  const list=U.masteryChecklist({quizBest:80,practicalComplete:true,teachBackComplete:false,status:'in-progress'});
  assert.equal(list.length,5);
  assert.equal(list.find(x=>x.key==='quiz').done,true);
  assert.equal(list.find(x=>x.key==='teachBack').done,false);
  assert.equal(list.find(x=>x.key==='mastered').done,false);
});

test('dashboard points to the current eligible week and next missing requirement',()=>{
  const d=U.currentDashboard(missions,fresh(),'2026-09-27');
  assert.equal(d.weekId,'01');
  assert.equal(d.title,'Title 1');
  assert.match(d.nextRequirement,/lesson|build|quiz|teach/i);
});

test('quiz retakes rotate question order without changing the question set',()=>{
  const quiz=['a','b','c','d','e'];
  const first=U.orderedQuiz(quiz,0);
  const retry=U.orderedQuiz(quiz,1);
  assert.deepEqual(first.map(x=>x.question),quiz);
  assert.notDeepEqual(retry.map(x=>x.question),first.map(x=>x.question));
  assert.deepEqual(retry.map(x=>x.question).sort(),[...quiz].sort());
  assert.deepEqual(retry.map(x=>x.originalIndex).sort((a,b)=>a-b),[0,1,2,3,4]);
});

test('future-week support resources stay hidden until their week is reached',()=>{
  assert.equal(U.supportResources(1).some(x=>x.id==='debugging'),false);
  assert.equal(U.supportResources(7).some(x=>x.id==='debugging'),true);
});
