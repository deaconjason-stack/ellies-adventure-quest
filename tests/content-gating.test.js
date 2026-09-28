const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../assets/progression.js');
const M=require('../assets/mastery-data.js');

const eligibility={currentEligibleWeek:3,accessibleMissionIds:['01','02','03']};

test('Quest Log and week resources expose only reached weeks',()=>{
  assert.deepEqual(P.visibleResourceWeeks(eligibility),['01','02','03']);
  assert.deepEqual(P.visibleQuestLogMissionIds(eligibility),['01','02','03']);
});

test('Star Hop requirements reveal progressively by eligible week',()=>{
  const items=P.visibleCapstoneItems(eligibility,M.capstoneItems);
  assert.ok(items.length>=3);
  assert.ok(items.every(x=>x.week<=3));
  assert.equal(items.some(x=>x.week>3),false);
});

test('no future titles or requirements are returned by gating helpers',()=>{
  const week1={currentEligibleWeek:1,accessibleMissionIds:['01']};
  assert.deepEqual(P.visibleResourceWeeks(week1),['01']);
  assert.ok(P.visibleCapstoneItems(week1,M.capstoneItems).every(x=>x.week===1));
});
