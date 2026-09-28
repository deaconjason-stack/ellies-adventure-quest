(function(root,factory){
  const P=(typeof module==='object'&&module.exports)?require('./progression.js'):root.AQ_PROGRESS;
  const api=factory(P);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.AQ_UI_MODEL=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(P){
  function todayString(now=new Date()){return typeof now==='string'?now:new Date(now).toISOString().slice(0,10);}
  function masteryChecklist(record={}){
    const started=record.status&&record.status!=='not-started';
    return [
      {key:'lesson',label:'Lesson reviewed',done:!!started},
      {key:'practical',label:'Build/practical evidence completed',done:record.practicalComplete===true},
      {key:'quiz',label:'Knowledge check ≥80%',done:Number(record.quizBest)>=80},
      {key:'teachBack',label:'Teach-back passed',done:record.teachBackComplete===true},
      {key:'mastered',label:'Week mastered',done:record.status==='mastered'}
    ];
  }
  function missionMapModel(missions,state,now){
    const e=P.eligibility(state,todayString(now));
    return missions.map(m=>{
      const n=Number(m.id),accessible=e.accessibleMissionIds.includes(m.id),r=(state.mastery||{})[m.id]||{};
      if(!accessible)return{id:m.id,week:n,state:'locked',clickable:false,title:null,focus:null,lockReason:n<=e.scheduledWeek?'Finish the current mastery check first.':'Opens in a future week.'};
      let status='review';
      if(n===e.currentEligibleWeek)status=r.status==='mastered'?'mastered':'current';else if(r.status==='mastered')status='mastered';
      return{id:m.id,week:n,state:status,clickable:true,title:m.title,focus:m.focus,lockReason:null};
    });
  }
  function currentDashboard(missions,state,now){
    const e=P.eligibility(state,todayString(now)),id=String(e.currentEligibleWeek).padStart(2,'0'),m=missions.find(x=>x.id===id)||{id,title:`Week ${e.currentEligibleWeek}`,focus:''},r=(state.mastery||{})[id]||{},list=masteryChecklist(r),next=list.find(x=>!x.done&&x.key!=='mastered')||list.find(x=>x.key==='mastered');
    return{weekId:id,week:e.currentEligibleWeek,title:m.title,focus:m.focus,status:r.status||'not-started',nextRequirement:next?next.label:'Review this week with Ellie',nextReleaseDate:e.nextReleaseDate,eligibility:e};
  }
  return{masteryChecklist,missionMapModel,currentDashboard};
});
