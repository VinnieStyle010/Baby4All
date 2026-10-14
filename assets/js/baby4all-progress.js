
/* Kids4All2Learn / Baby4All - centrale voortgang, versie 2.
   Behoudt de bestaande publieke API en oude opslagsleutels. */
(function () {
  'use strict';
  const KEY = 'baby4all-progress';
  const LEGACY_STARS = 'baby4all-stars';
  const LEGACY_TOTAL = 'baby4all-total-stars';
  const SUBJECTS = ['language','reading','spelling','math','logic','nature','biology','geography','history','science','technology','creativity','music','movement'];
  const TRAITS = ['baseType','primaryColor','secondaryColor','ears','wings','tail','pattern','bodyCovering','eyes','nose','feet','horns','antennae','mane','teeth'];
  const MAX_NUMBER = Number.MAX_SAFE_INTEGER;
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(MAX_NUMBER, Number(value))) : fallback;
  const integer = (value, fallback = 0) => Math.floor(finite(value, fallback));
  const safeId = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 150;
  const unique = value => Array.isArray(value) ? [...new Set(value)] : [];
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  function defaults() {
    const learning = {};
    SUBJECTS.forEach(s => learning[s] = {stars:0, completed:0});
    const traits = {};
    TRAITS.forEach(t => traits[t] = null);
    return {
      version:2,
      stars:{spendable:0,totalEarned:0},
      learning,
      adventures:{'hoofdstuk-1':{started:false,completed:false,currentPart:1,completedParts:[],clues:[],scenes:{}}},
      egg:{discovered:false,owned:false,hatched:false,stage:0,moments:[],traits},
      companions:[],
      discoveries:{eggs:[],characters:[],vehicles:[],clothing:[],places:[],objects:[]},
      inventory:{clothing:[],vehicles:[],objects:[],roomItems:[]},
      talents:{language:0,math:0,logic:0,creativity:0,nature:0,technology:0,music:0,movement:0,caring:0},
      tasks:{},
      migrations:{legacyStarsImported:false}
    };
  }
  function merge(base, saved) {
    if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
    if (!object(base)) return saved === undefined ? base : saved;
    const result = {...base};
    if (!object(saved)) return result;
    Object.keys(saved).forEach(k => result[k] = k in base ? merge(base[k], saved[k]) : saved[k]);
    return result;
  }
  function raw() {
    try { const data = JSON.parse(localStorage.getItem(KEY)); return object(data) ? data : null; }
    catch (error) { console.warn('Baby4All: opgeslagen voortgang is niet leesbaar.', error); return null; }
  }
  function normalize(p) {
    p.version = 2;
    p.stars.spendable = integer(p.stars.spendable);
    p.stars.totalEarned = Math.max(p.stars.spendable, integer(p.stars.totalEarned));
    p.egg.stage = Math.min(7, integer(p.egg.stage));
    p.egg.moments = unique(p.egg.moments);
    if (p.egg.hatched) { p.egg.owned = true; p.egg.discovered = true; p.egg.stage = 7; }
    if (p.egg.owned) p.egg.discovered = true;
    if (p.egg.discovered) p.egg.stage = Math.max(1,p.egg.stage);
    return p;
  }
  function load() {
    const existing = raw();
    const p = normalize(merge(defaults(), existing));
    // Importeer oude sterren precies één keer; daarna is het centrale saldo leidend.
    if (!p.migrations.legacyStarsImported) {
      const oldSpendable = integer(localStorage.getItem(LEGACY_STARS));
      const oldTotal = integer(localStorage.getItem(LEGACY_TOTAL));
      p.stars.spendable = Math.max(p.stars.spendable, oldSpendable);
      p.stars.totalEarned = Math.max(p.stars.totalEarned, oldTotal, p.stars.spendable);
      p.migrations.legacyStarsImported = true;
      persist(p);
    }
    return p;
  }
  function persist(p) {
    localStorage.setItem(KEY, JSON.stringify(p));
    localStorage.setItem(LEGACY_STARS, String(p.stars.spendable));
    localStorage.setItem(LEGACY_TOTAL, String(p.stars.totalEarned));
    return p;
  }
  function save(p) { if (!object(p)) throw new TypeError('Voortgang moet een object zijn.'); return persist(normalize(merge(defaults(),p))); }
  function earnStars(amount,subject=null) {
    amount=integer(amount);
    if (!amount) return load();
    const p=load();
    p.stars.spendable=Math.min(MAX_NUMBER,p.stars.spendable+amount);
    p.stars.totalEarned=Math.min(MAX_NUMBER,p.stars.totalEarned+amount);
    if (subject && p.learning[subject]) {p.learning[subject].stars+=amount;p.learning[subject].completed+=1;}
    return save(p);
  }
  function spendStars(amount) {
    amount=Number(amount);
    if (!Number.isSafeInteger(amount) || amount<=0) return {success:false,reason:'invalid'};
    const p=load();
    if (p.stars.spendable<amount) return {success:false,reason:'not-enough-stars',balance:p.stars.spendable};
    p.stars.spendable-=amount;save(p);
    return {success:true,balance:p.stars.spendable,totalEarned:p.stars.totalEarned};
  }
  function hasTotalStars(amount) {return load().stars.totalEarned>=integer(amount);}
  function hasLearningProgress(subject,minimumStars=0,minimumCompleted=0) {
    const d=load().learning[subject];return !!d && d.stars>=integer(minimumStars) && d.completed>=integer(minimumCompleted);
  }
  function checkRequirements(req={}) {
    const p=load(),missing=[];
    if (p.stars.totalEarned<integer(req.totalStars)) missing.push({type:'stars',current:p.stars.totalEarned,required:integer(req.totalStars)});
    if (object(req.subjects)) Object.entries(req.subjects).forEach(([subject,r])=>{
      const d=p.learning[subject],stars=integer(r&&r.stars),completed=integer(r&&r.completed);
      if (!d || d.stars<stars || d.completed<completed) missing.push({type:'subject',subject,stars:d?d.stars:0,requiredStars:stars,completed:d?d.completed:0,requiredCompleted:completed});
    });
    return {unlocked:missing.length===0,missing};
  }
  function adventure(p,id) {
    if (!object(p.adventures[id])) p.adventures[id]={started:false,completed:false,currentPart:1,completedParts:[],clues:[],scenes:{}};
    const a=p.adventures[id];
    if (!object(a.scenes)) a.scenes={};
    if (!Array.isArray(a.completedParts)) a.completedParts=[];
    if (!Array.isArray(a.clues)) a.clues=[];
    return a;
  }
  function startAdventure(id) {if (!safeId(id)) return load();const p=load();adventure(p,id).started=true;return save(p);}
  function completeAdventurePart(id,part) {
    if (!safeId(id) || !Number.isSafeInteger(Number(part)) || Number(part)<1) return load();
    const p=load(),a=adventure(p,id),n=Number(part);
    a.started=true;if (!a.completedParts.includes(n)) a.completedParts.push(n);
    a.currentPart=Math.max(integer(a.currentPart,1),n+1);return save(p);
  }
  function saveScene(id,part,scene) {
    if (!safeId(id) || !Number.isSafeInteger(Number(part)) || Number(part)<1 || !safeId(String(scene))) return load();
    const p=load(),a=adventure(p,id);a.started=true;
    a.scenes[String(part)]=String(scene);return save(p);
  }
  function getScene(id,part) {const a=load().adventures[id];return a&&a.scenes ? a.scenes[String(part)]||null : null;}
  function discoverClue(id,clue) {if (!safeId(id)||!safeId(clue)) return load();const p=load(),a=adventure(p,id);if(!a.clues.includes(clue))a.clues.push(clue);return save(p);}
  function addUnique(section,category,id) {if(!safeId(id))return load();const p=load(),list=p[section]&&p[section][category];if(!Array.isArray(list))return p;if(!list.includes(id))list.push(id);return save(p);}
  function discoverCharacter(id) {return addUnique('discoveries','characters',id);}
  function discoverItem(category,id) {return addUnique('discoveries',category,id);}
  function discoverEgg() {const p=load();p.egg.discovered=true;p.egg.stage=Math.max(1,p.egg.stage);return save(p);}
  // Verhaalregel: het ei kan pas worden verkregen wanneer een toekomstige,
  // expliciet toegekende ontgrendeling is geregistreerd.
  const EGG_UNLOCK='mysterieuze-ei-verdiend';
  function eggEligible(p) {return p.adventures['hoofdstuk-1']?.clues?.includes(EGG_UNLOCK)===true;}
  function obtainEgg() {const p=load();if(!eggEligible(p))return {success:false,reason:'egg-locked',progress:p};p.egg.discovered=true;p.egg.owned=true;p.egg.stage=Math.max(1,p.egg.stage);save(p);return {success:true,progress:p};}
  function addEggMoment(id) {
    if(!safeId(id))return load();const p=load();if(!p.egg.owned)return p;
    if(!p.egg.moments.includes(id))p.egg.moments.push(id);
    const n=p.egg.moments.length;
    p.egg.stage=Math.max(p.egg.stage,n>=5?6:n>=4?5:n>=3?4:n>=2?3:n>=1?2:1);
    return save(p);
  }
  function setEggTrait(trait,value) {const p=load();if(!p.egg.owned || !Object.prototype.hasOwnProperty.call(p.egg.traits,trait))return p;p.egg.traits[trait]=value;return save(p);}
  function hatchEgg(companion) {
    const p=load();
    if(!p.egg.owned)return {success:false,reason:'egg-not-owned'};
    if(p.egg.stage<6)return {success:false,reason:'egg-not-ready'};
    // De uiteindelijke uitbroedmissie moet dit bewijs later toekennen.
    if(!p.egg.moments.includes('uitbroedavontuur-voltooid'))return {success:false,reason:'hatching-adventure-required'};
    if(p.egg.hatched)return {success:false,reason:'already-hatched'};
    p.egg.hatched=true;p.egg.stage=7;
    if(companion && !p.companions.some(c=>JSON.stringify(c)===JSON.stringify(companion)))p.companions.push(companion);
    save(p);return {success:true,progress:p};
  }
  function taskStatus(id) {
    const task=load().tasks[id];
    if(!task)return {available:true,remaining:0};
    if(task.once===true)return {available:false,remaining:0,reason:'already-completed',lastReward:task.lastReward,timesCompleted:task.timesCompleted||0};
    const cooldown=Number.isFinite(task.cooldownMs)?Math.max(0,task.cooldownMs):3600000;
    const remaining=Math.max(0,cooldown-(Date.now()-integer(task.lastReward)));
    return {available:remaining===0,remaining,lastReward:task.lastReward,timesCompleted:task.timesCompleted||0,reason:remaining?'cooldown':null};
  }
  function completeTask(id,options={}) {
    if(!safeId(id))return {success:false,rewarded:false,reason:'invalid-task'};
    const p=load(),existing=p.tasks[id],once=options.once===true || (existing&&existing.once===true);
    if(once&&existing&&existing.timesCompleted>0)return {success:false,rewarded:false,reason:'already-completed'};
    const status=taskStatus(id);
    if(!status.available)return {success:false,rewarded:false,reason:status.reason||'cooldown',remaining:status.remaining};
    const reward=integer(options.stars),subject=options.subject||null;
    p.stars.spendable=Math.min(MAX_NUMBER,p.stars.spendable+reward);
    p.stars.totalEarned=Math.min(MAX_NUMBER,p.stars.totalEarned+reward);
    if(reward>0&&subject&&p.learning[subject]){p.learning[subject].stars+=reward;p.learning[subject].completed+=1;}
    p.tasks[id]={timesCompleted:(existing?.timesCompleted||0)+1,lastReward:Date.now(),once:!!once,cooldownMs:once?0:integer(options.cooldownMs,3600000)};
    save(p);return {success:true,rewarded:true,stars:reward,subject,balance:p.stars.spendable,totalEarned:p.stars.totalEarned};
  }
  function formatCooldown(ms) {const n=Math.ceil(finite(ms)/60000);return n<=0?'nu':n===1?'ongeveer 1 minuut':n<60?'ongeveer '+n+' minuten':'ongeveer '+Math.ceil(n/60)+' uur';}
  function resetAllProgress() {localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_STARS);localStorage.removeItem(LEGACY_TOTAL);return load();}
  // Import bij eerste gebruik, maar nooit opnieuw op basis van een hoger oud saldo.
  load();
  window.Baby4AllProgress={load,save,earnStars,spendStars,hasTotalStars,hasLearningProgress,checkRequirements,startAdventure,completeAdventurePart,saveScene,getScene,discoverClue,discoverCharacter,discoverItem,discoverEgg,obtainEgg,addEggMoment,setEggTrait,hatchEgg,taskStatus,completeTask,formatCooldown,resetAllProgress};
})();
