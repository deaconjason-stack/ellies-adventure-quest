(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.AQ_MASTERY_DATA=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const weeks={
    '01':{prompts:['Explain what a sequence is and why order matters in code.','Teach Ellie how step-by-step instructions help a computer complete a task.'],groups:[['sequence','step'],['order','ordered'],['instruction','command']],hint:'Think about a sequence: instructions work when the steps are in the right order.',section:'Logic Track'},
    '02':{prompts:['Explain a variable to someone brand new to coding.','How can a program remember a value that may change?'],groups:[['variable'],['store','remember','hold'],['value','data'],['change','update']],hint:'A variable stores or remembers a value, and that value can change while a program runs.',section:'Key vocabulary'},
    '03':{prompts:['What does a conditional let a program decide?','Explain how an if decision changes what code runs.'],groups:[['condition','conditional','if'],['decision','choose','choice'],['true','false','match']],hint:'A conditional checks a condition and makes a decision about which instructions run.',section:'Logic Track'},
    '04':{prompts:['Why would you use a loop instead of writing the same instruction many times?','Teach Ellie what a loop does.'],groups:[['loop'],['repeat','repeats','repeated'],['instruction','step','code']],hint:'A loop repeats instructions so the same steps do not need to be written again and again.',section:'Logic Track'},
    '05':{prompts:['What is a function and why is it useful?','How does calling a function help organize repeated work?'],groups:[['function'],['task','job','work'],['reuse','repeat','call']],hint:'A function names a reusable task. You call it when the program needs that job done.',section:'Key vocabulary'},
    '06':{prompts:['How do data and variables work together in a game?','Explain how a score can be stored and updated.'],groups:[['data','value'],['variable','store'],['update','change','score']],hint:'Programs store data in variables and update those values when something changes.',section:'Build Track'},
    '07':{prompts:['Explain a good debugging process.','What should you do after you notice a bug?'],groups:[['bug','debug'],['reproduce','repeat'],['fix','change'],['test','verify']],hint:'Debugging means reproduce the bug, isolate the cause, make a focused fix, then verify it with a test.',section:'Logic Track'},
    '08':{prompts:['How can loops and conditionals work together?','Give an example of repeating an action only when a condition is true.'],groups:[['loop','repeat'],['condition','conditional','if'],['true','decision','check']],hint:'A loop can repeat work while a conditional checks when or whether part of that work should happen.',section:'Logic Track'},
    '09':{prompts:['What makes an interface easier for a player to use?','Explain why user feedback matters in a game screen.'],groups:[['user','player'],['interface','screen','layout'],['feedback','clear','readable']],hint:'Interface design focuses on the user: clear layout, readable information, and useful feedback.',section:'Why It Matters'},
    '10':{prompts:['Explain what it means for a function to return a value.','How can a function use an input and send a result back?'],groups:[['function'],['input','parameter','argument'],['return','returns'],['value','result','output']],hint:'A function can receive input, do work, and return a result or value to the code that called it.',section:'Logic Track'},
    '11':{prompts:['What does it mean to combine systems in one program?','How can separate parts of a game work together without becoming confusing?'],groups:[['system','part','component'],['combine','connect','together'],['data','function','interface']],hint:'A larger program combines smaller parts that communicate through clear data, functions, or interfaces.',section:'Build Track'},
    '12':{prompts:['What is refactoring and what should stay the same?','Why clean up code that already works?'],groups:[['refactor','refactoring','clean'],['readable','organized','clear'],['behavior','works','result']],hint:'Refactoring improves code structure and readability without changing the behavior the user depends on.',section:'Why It Matters'},
    '13':{prompts:['How do you prepare a technical project for a demonstration?','What should you test and explain before presenting your project?'],groups:[['demo','demonstrate','present'],['test','verify'],['explain','prepare','practice']],hint:'A dress rehearsal means test the project, practice the demo, and prepare a clear explanation.',section:'Build Track'},
    '14':{prompts:['What evidence will show your family what you learned?','How will you explain your project, challenge, and growth during the showcase?'],groups:[['demonstrate','demo','show'],['evidence','project','build'],['learn','reflection','growth']],hint:'The showcase should demonstrate the build and use evidence to explain what you learned and how you grew.',section:'Family Showcase'}
  };
  const capstoneItems=[
    {week:1,label:'Build and explain a correct sequence for movement.'},{week:2,label:'Use a variable to store a changing game value.'},{week:3,label:'Use a conditional to make a game decision.'},{week:4,label:'Use a loop for repeated behavior.'},{week:5,label:'Create a reusable function.'},{week:6,label:'Track and update score or other game data.'},{week:7,label:'Document one bug from reproduce through verification.'},{week:8,label:'Combine a loop and conditional intentionally.'},{week:9,label:'Improve a player-facing interface or feedback element.'},{week:10,label:'Use a function that returns a useful value.'},{week:11,label:'Connect multiple game systems cleanly.'},{week:12,label:'Refactor code without changing intended behavior.'},{week:13,label:'Practice and test the three-minute demonstration.'},{week:14,label:'Present evidence, reflection, and a Version 2 idea.'}
  ];
  function normalize(text){return String(text||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ');}
  function evaluateTeachBack(id,text,promptIndex=0){
    const d=weeks[id];
    if(!d) return {passed:false,matchedConcepts:[],missingConcepts:['lesson'],hint:'Return to the current lesson and review the key idea.',nextPromptIndex:0,sectionAnchor:'Mission Briefing'};
    const n=normalize(text),matched=[],missing=[];
    d.groups.forEach(group=>{const hit=group.some(term=>n.includes(term));(hit?matched:missing).push(group[0]);});
    const enoughWords=n.trim().split(/\s+/).filter(Boolean).length>=6,passed=enoughWords&&missing.length===0;
    return {passed,matchedConcepts:matched,missingConcepts:passed?[]:missing.length?missing:['explain-more'],hint:passed?'You explained the key idea in your own words.':d.hint,nextPromptIndex:(Number(promptIndex)+1)%d.prompts.length,sectionAnchor:d.section,prompt:d.prompts[(Number(promptIndex)+1)%d.prompts.length]};
  }
  function promptFor(id,index=0){const d=weeks[id];return d?d.prompts[Number(index)%d.prompts.length]:'';}
  function ellieResponse({weekId,type='help',concepts=[],promptIndex=0,maxWeek=1}={}){
    const weekNum=Math.max(1,Math.min(14,Number(weekId)||1)),allowed=Math.max(1,Math.min(14,Number(maxWeek)||1));
    if(weekNum>allowed) return {blocked:true,heading:'We’ll get there together',message:`Great question. We’ll get to that later in the course. For now, let’s use what you already know from Weeks 1–${allowed} to solve today’s mission.`,example:'',actionLabel:`Return to Week ${allowed}`,sectionAnchor:'Mission Briefing'};
    const id=String(weekNum).padStart(2,'0'),d=weeks[id],concept=(Array.isArray(concepts)&&concepts[0])||d.groups[0][0];
    return {blocked:false,heading:`Let’s review ${concept}`,message:d.hint,example:`Example: explain the idea using a small Star Hop situation from Week ${weekNum}, then describe what the code should do.`,actionLabel:type==='remediation'?'Try a related question':'Answer Ellie',sectionAnchor:d.section,prompt:promptFor(id,promptIndex)};
  }
  return {weeks,capstoneItems,evaluateTeachBack,promptFor,ellieResponse};
});
