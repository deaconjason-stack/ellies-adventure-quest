from pathlib import Path

p=Path("career-quest-v7-android/app/src/main/assets/index.html")
s=p.read_text(encoding="utf-8")

start=s.index("function sendEllie(q)")
end=s.index("function listenToUser()")

online=r"""var ELLIE_AI_URL='https://yzihtzekhnfzyeviqzua.supabase.co/functions/v1/ellie-career-ai';
var ELLIE_AI_CLIENT='QIxs2OMS6gRUnotzQDHD73rhgqo9n8WrEP5pZXmSoTI';

function ellieAiPayload(text,history){
  var b=st.ellieBrain||defaultState().ellieBrain,bl=bestAndLow(),best=bl[0],low=bl[1];
  return {
    message:text,
    profile:{
      name:st.name||'Explorer',
      interests:b.interests||[],
      goals:b.goals||[],
      favorites:b.favorites||[],
      wins:b.wins||[],
      struggles:b.struggles||[]
    },
    progress:{
      level:level(),
      xp:st.xp||0,
      totalStars:totalStars(),
      careerStamps:countKeys(st.done),
      strongestSkill:best[0]+' ('+best[1]+' stars)',
      weakestSkill:low[0]+' ('+low[1]+' stars)'
    },
    history:history||[]
  };
}

function ellieFinishReply(reply){
  st.ellieMemory.push({role:'ellie',text:reply,t:(new Date()).getTime()});
  while(st.ellieMemory.length>80)st.ellieMemory.shift();
  st.ellieBrain.lastSeen=(new Date()).getTime();
  save();
  openEllie();
  speak(reply);
}

function ellieShowThinking(){
  var box=document.getElementById('chatBox');
  if(box){
    box.innerHTML+='<div class="chat" id="ellieThinking"><em>Ellie is thinking…</em></div>';
    box.scrollTop=box.scrollHeight;
  }
}

function sendEllie(q){
  var el=document.getElementById('ellieInput'),text=q||((el&&el.value)||''),prior,payload;
  text=String(text).replace(/^\s+|\s+$/g,'');
  if(!text)return;

  prior=st.ellieMemory.slice(Math.max(0,st.ellieMemory.length-12));
  rememberUser(text);
  st.ellieBrain.turns=(st.ellieBrain.turns||0)+1;
  st.ellieBrain.lastTopic=topicFrom(text);
  st.ellieMemory.push({role:'user',text:text,t:(new Date()).getTime()});
  while(st.ellieMemory.length>80)st.ellieMemory.shift();
  persistOnly();
  openEllie();
  ellieShowThinking();

  payload=ellieAiPayload(text,prior);

  fetch(ELLIE_AI_URL,{
    method:'POST',
    headers:{
      'content-type':'application/json',
      'x-ellie-client':ELLIE_AI_CLIENT
    },
    body:JSON.stringify(payload)
  })
  .then(function(r){
    return r.json().then(function(data){
      if(!r.ok)throw new Error((data&&data.error)||('HTTP '+r.status));
      return data;
    });
  })
  .then(function(data){
    var reply=data&&data.reply?String(data.reply).replace(/^\s+|\s+$/g,''):'';
    if(!reply)throw new Error('Empty Ellie reply');
    ellieFinishReply(reply);
  })
  .catch(function(){
    st.ellieBrain.turns=Math.max(0,(st.ellieBrain.turns||1)-1);
    ellieFinishReply(ellieReply(text));
  });
}
"""

s=s[:start]+online+s[end:]
s=s.replace("personal memory on this device","AI conversation • personal memory on this device")
s=s.replace("Talk to Ellie like a person…","Talk naturally to Ellie…")

p.write_text(s,encoding="utf-8")

g=Path("career-quest-v7-android/app/build.gradle")
x=g.read_text()
x=x.replace("applicationId 'com.medisyncd.elliecareer.alive'","applicationId 'com.medisyncd.elliecareer.ai'")
x=x.replace("versionCode 6","versionCode 7")
x=x.replace('versionName "6.0.0"','versionName "7.0.0"')
x=x.replace("versionName '6.0.0'","versionName '7.0.0'")
g.write_text(x)

m=Path("career-quest-v7-android/app/src/main/AndroidManifest.xml")
mx=m.read_text()
mx=mx.replace('android:label="Ellie\\'s Career Quest"','android:label="Ellie Career Quest AI"')
m.write_text(mx)

print("Ellie v7 OpenAI brain wired")
