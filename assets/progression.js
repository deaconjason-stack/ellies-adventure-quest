(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.AQ_PROGRESS=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const MISSION_IDS=Array.from({length:14},(_,i)=>String(i+1).padStart(2,'0'));
  function dayNumber(dateString){
    const [y,m,d]=String(dateString).split('-').map(Number);
    if(!y||!m||!d) return NaN;
    return Math.floor(Date.UTC(y,m-1,d)/86400000);
  }
  function scheduledWeek(startDate,nowDate,highestScheduledWeekSeen=1){
    const start=dayNumber(startDate), now=dayNumber(nowDate);
    const raw=Number.isFinite(start)&&Number.isFinite(now)?Math.floor((now-start)/7)+1:1;
    const calculated=Math.max(1,Math.min(14,raw));
    const highest=Math.max(1,Math.min(14,Number(highestScheduledWeekSeen)||1),calculated);
    return {scheduledWeek:highest,highestScheduledWeekSeen:highest};
  }
  function isWeekMastered(record){
    return !!record && record.status==='mastered' && Number(record.quizBest)>=80 && record.practicalComplete===true && record.teachBackComplete===true;
  }
  function firstUnmasteredWeek(mastery={}){
    for(let i=1;i<=14;i++) if(!isWeekMastered(mastery[String(i).padStart(2,'0')])) return i;
    return 14;
  }
  function eligibility(state,nowDate){
    const enrollment=(state&&state.enrollment)||{};
    const sw=scheduledWeek(enrollment.startDate,nowDate,enrollment.highestScheduledWeekSeen);
    const first=firstUnmasteredWeek((state&&state.mastery)||{});
    const currentEligibleWeek=Math.min(sw.scheduledWeek,first);
    const accessibleMissionIds=MISSION_IDS.slice(0,currentEligibleWeek);
    const start=dayNumber(enrollment.startDate);
    const nextReleaseDay=start+sw.scheduledWeek*7;
    const nextReleaseDate=sw.scheduledWeek>=14||!Number.isFinite(nextReleaseDay)?null:new Date(nextReleaseDay*86400000).toISOString().slice(0,10);
    const lockedReason=first<sw.scheduledWeek?'mastery':'time';
    return {scheduledWeek:sw.scheduledWeek,highestScheduledWeekSeen:sw.highestScheduledWeekSeen,currentEligibleWeek,accessibleMissionIds,nextReleaseDate,lockedReason};
  }
  function isMissionAccessible(id,result){return !!result&&result.accessibleMissionIds.includes(String(id).padStart(2,'0'));}
  return {MISSION_IDS,scheduledWeek,firstUnmasteredWeek,eligibility,isMissionAccessible,isWeekMastered};
});
