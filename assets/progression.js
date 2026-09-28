(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.AQ_PROGRESS=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const MISSION_IDS=Array.from({length:14},(_,i)=>String(i+1).padStart(2,'0'));

  const VALID_PATHS=['voyager','commander','pioneer'];
  const VALID_THEMES=['system','light','dark'];
  function validDateString(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))) return false;
    const [y,m,d]=String(value).split('-').map(Number);
    if(m<1||m>12||d<1||d>31) return false;
    const date=new Date(Date.UTC(y,m-1,d));
    return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
  }
  function baseMasteryRecord(){
    return {status:'not-started',quizBest:0,quizAttempts:0,practicalComplete:false,teachBackComplete:false,masteredAt:null,conceptsNeedingReview:[]};
  }
  function normalizeMasteryRecord(raw={}){
    const r={...baseMasteryRecord()};
    const score=Number(raw.quizBest);
    r.quizBest=Number.isFinite(score)?Math.max(0,Math.min(100,score)):0;
    r.quizAttempts=Math.max(0,Math.floor(Number(raw.quizAttempts)||0));
    r.practicalComplete=raw.practicalComplete===true;
    r.teachBackComplete=raw.teachBackComplete===true;
    r.masteredAt=typeof raw.masteredAt==='string'?raw.masteredAt:null;
    r.conceptsNeedingReview=Array.isArray(raw.conceptsNeedingReview)?[...new Set(raw.conceptsNeedingReview.filter(x=>typeof x==='string'&&x.trim()))]:[];
    if(raw.legacyCompleted===true) r.legacyCompleted=true;
    const hasProgress=r.quizBest>0||r.quizAttempts>0||r.practicalComplete||r.teachBackComplete||r.conceptsNeedingReview.length>0||r.legacyCompleted;
    const fully=r.quizBest>=80&&r.practicalComplete&&r.teachBackComplete;
    r.status=fully?'mastered':(hasProgress?'in-progress':'not-started');
    if(!fully) r.masteredAt=null;
    return r;
  }
  function createDefaultV2(today){
    const date=validDateString(today)?today:new Date().toISOString().slice(0,10);
    return {version:2,path:'voyager',enrollment:{startDate:date,initializedAt:new Date(date+'T12:00:00.000Z').toISOString(),highestScheduledWeekSeen:1},mastery:{},questLog:{},capstone:{},prefs:{theme:'system',largeText:false}};
  }
  function migrateV1(rawV1,today){
    const out=createDefaultV2(today);
    const raw=rawV1&&typeof rawV1==='object'?rawV1:{};
    if(VALID_PATHS.includes(raw.path)) out.path=raw.path;
    if(raw.prefs&&typeof raw.prefs==='object'){
      if(VALID_THEMES.includes(raw.prefs.theme)) out.prefs.theme=raw.prefs.theme;
      out.prefs.largeText=raw.prefs.largeText===true;
    }
    if(raw.questLog&&typeof raw.questLog==='object') for(const id of MISSION_IDS) if(raw.questLog[id]&&typeof raw.questLog[id]==='object') out.questLog[id]={...raw.questLog[id]};
    if(raw.capstone&&typeof raw.capstone==='object') out.capstone={...raw.capstone};
    for(const id of MISSION_IDS){
      const score=raw.quizScores&&Number(raw.quizScores[id]);
      const legacy=Array.isArray(raw.completed)&&raw.completed.includes(id);
      if(Number.isFinite(score)||legacy){
        out.mastery[id]=normalizeMasteryRecord({quizBest:Number.isFinite(score)?score:0,quizAttempts:Number.isFinite(score)?1:0,legacyCompleted:legacy});
      }
    }
    return out;
  }
  function sanitizeV2(raw,today){
    const d=createDefaultV2(today);
    if(!raw||typeof raw!=='object') return d;
    const s={...d};
    s.path=VALID_PATHS.includes(raw.path)?raw.path:d.path;
    const e=raw.enrollment&&typeof raw.enrollment==='object'?raw.enrollment:{};
    s.enrollment={
      startDate:validDateString(e.startDate)?e.startDate:d.enrollment.startDate,
      initializedAt:typeof e.initializedAt==='string'?e.initializedAt:d.enrollment.initializedAt,
      highestScheduledWeekSeen:Math.max(1,Math.min(14,Math.floor(Number(e.highestScheduledWeekSeen)||1)))
    };
    s.mastery={};
    if(raw.mastery&&typeof raw.mastery==='object') for(const id of MISSION_IDS) if(raw.mastery[id]&&typeof raw.mastery[id]==='object') s.mastery[id]=normalizeMasteryRecord(raw.mastery[id]);
    s.questLog={};
    if(raw.questLog&&typeof raw.questLog==='object') for(const id of MISSION_IDS) if(raw.questLog[id]&&typeof raw.questLog[id]==='object') s.questLog[id]={...raw.questLog[id]};
    s.capstone=raw.capstone&&typeof raw.capstone==='object'?{...raw.capstone}:{};
    const prefs=raw.prefs&&typeof raw.prefs==='object'?raw.prefs:{};
    s.prefs={theme:VALID_THEMES.includes(prefs.theme)?prefs.theme:'system',largeText:prefs.largeText===true};
    return s;
  }

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


  function cloneState(state){return JSON.parse(JSON.stringify(state));}
  function recomputeMastery(state,id,now){
    const out=cloneState(state);
    out.mastery=out.mastery||{};
    const r=normalizeMasteryRecord(out.mastery[id]||{});
    const complete=r.quizBest>=80&&r.practicalComplete&&r.teachBackComplete;
    r.status=complete?'mastered':((r.quizBest>0||r.quizAttempts>0||r.practicalComplete||r.teachBackComplete||r.conceptsNeedingReview.length||r.legacyCompleted)?'in-progress':'not-started');
    if(complete) r.masteredAt=r.masteredAt||now||new Date().toISOString(); else r.masteredAt=null;
    out.mastery[id]=r;
    return out;
  }
  function recordQuizResult(state,id,percent,missedConcepts=[],now){
    const out=cloneState(state);
    out.mastery=out.mastery||{};
    const r=normalizeMasteryRecord(out.mastery[id]||{});
    const score=Math.max(0,Math.min(100,Number(percent)||0));
    r.quizBest=Math.max(r.quizBest,score);
    r.quizAttempts+=1;
    r.conceptsNeedingReview=[...new Set([...(r.conceptsNeedingReview||[]),...(Array.isArray(missedConcepts)?missedConcepts:[])])];
    if(score>=80&&(!missedConcepts||missedConcepts.length===0)) r.conceptsNeedingReview=[];
    out.mastery[id]=r;
    return recomputeMastery(out,id,now);
  }

  function recordTeachBackResult(state,id,result,now){
    const out=cloneState(state);
    out.mastery=out.mastery||{};
    const r=normalizeMasteryRecord(out.mastery[id]||{});
    r.teachBackComplete=r.teachBackComplete||!!(result&&result.passed);
    if(result&&result.passed) r.conceptsNeedingReview=[];
    else if(result&&Array.isArray(result.missingConcepts)) r.conceptsNeedingReview=[...new Set([...(r.conceptsNeedingReview||[]),...result.missingConcepts])];
    out.mastery[id]=r;
    return recomputeMastery(out,id,now);
  }

  function recordPracticalEvidence(state,id,evidence={}){
    const out=cloneState(state);
    out.mastery=out.mastery||{};
    out.questLog=out.questLog||{};
    const clean={}, prior=out.questLog[id]&&typeof out.questLog[id]==='object'?out.questLog[id]:{};
    for(const key of ['built','tested','challenge','solution','learned','next']) clean[key]=String(evidence[key]||'').trim();
    const merged={...prior,mission:id};
    for(const [key,value] of Object.entries(clean)) if(value) merged[key]=value;
    out.questLog[id]=merged;
    const r=normalizeMasteryRecord(out.mastery[id]||{});
    r.practicalComplete=r.practicalComplete||['built','tested','challenge','solution'].every(k=>String(merged[k]||'').trim().length>0);
    out.mastery[id]=r;
    return recomputeMastery(out,id);
  }


  function visibleResourceWeeks(result){return result&&Array.isArray(result.accessibleMissionIds)?[...result.accessibleMissionIds]:[];}
  function visibleQuestLogMissionIds(result){return visibleResourceWeeks(result);}
  function visibleCapstoneItems(result,items=[]){
    const max=result&&Number(result.currentEligibleWeek)||1;
    return Array.isArray(items)?items.filter(item=>Number(item.week)<=max):[];
  }

  function routeDecision(routeParts,state,nowDate){
    const parts=Array.isArray(routeParts)?routeParts:[];
    const e=eligibility(state,nowDate);
    if(parts[0]==='missions'&&parts[1]){
      const id=String(parts[1]).padStart(2,'0');
      if(!isMissionAccessible(id,e)) return {allowed:false,redirectTo:`missions/${String(e.currentEligibleWeek).padStart(2,'0')}`,message:`That mission is not available yet. Keep working with Ellie on Week ${e.currentEligibleWeek}.`,eligibility:e};
    }
    if(parts[0]==='showcase'&&e.currentEligibleWeek<14) return {allowed:false,redirectTo:`missions/${String(e.currentEligibleWeek).padStart(2,'0')}`,message:`The Family Showcase unlocks in Week 14. Keep working with Ellie on Week ${e.currentEligibleWeek}.`,eligibility:e};
    return {allowed:true,redirectTo:null,message:'',eligibility:e};
  }

  return {MISSION_IDS,scheduledWeek,firstUnmasteredWeek,eligibility,isMissionAccessible,isWeekMastered,createDefaultV2,migrateV1,sanitizeV2,normalizeMasteryRecord,routeDecision,recomputeMastery,recordQuizResult,recordPracticalEvidence,recordTeachBackResult,visibleResourceWeeks,visibleQuestLogMissionIds,visibleCapstoneItems};
});
