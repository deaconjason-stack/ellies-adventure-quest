const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=()=>fs.readFileSync('assets/app.js','utf8');
const html=()=>fs.readFileSync('index.html','utf8');

test('browser app enforces routeDecision before rendering future-sensitive routes',()=>{
  assert.match(app(),/routeDecision\(/);
  assert.match(app(),/currentEligibleWeek/);
});

test('manual completion is removed and mastery UI is present',()=>{
  assert.doesNotMatch(app(),/data-complete|Mark mission .*complete/i);
  assert.match(app(),/masteryChecklist/);
  assert.match(app(),/data-teachback/);
  assert.match(app(),/Knowledge Check.*80%/s);
});

test('full future workbook download is not exposed in paced student resources',()=>{
  assert.doesNotMatch(app(),/data-workbook|Student_Workbook\.docx/);
  assert.match(app(),/week-specific|unlocked mission/i);
});

test('index loads progression mastery and UI model before app',()=>{
  const h=html();
  const p=h.indexOf('assets/progression.js');
  const m=h.indexOf('assets/mastery-data.js');
  const u=h.indexOf('assets/ui-model.js');
  const a=h.indexOf('assets/app.js');
  assert.ok(p>=0&&m>p&&u>m&&a>u);
  assert.match(h,/version 2/i);
});

test('Ellie feedback is announced accessibly',()=>{
  assert.match(app(),/aria-live="polite"/);
});
