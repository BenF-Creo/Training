/* ================= app ================= */
const $=id=>document.getElementById(id);
function load(k){try{return localStorage.getItem('gymplan:'+k)||''}catch(e){return ''}}
function save(k,v){try{localStorage.setItem('gymplan:'+k,v)}catch(e){}}
const pad2=n=>String(n).padStart(2,'0');
const mmss=t=>Math.floor(t/60)+':'+pad2(t%60);
const dstr=t=>t.getFullYear()+'-'+pad2(t.getMonth()+1)+'-'+pad2(t.getDate());
const today=()=>dstr(new Date());
const fmtD=d=>{const [y,m,dd]=d.split('-').map(Number);return new Date(y,m-1,dd).toLocaleDateString('en-AU',{day:'numeric',month:'short'})};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dur=ms=>{const m=Math.round(ms/60000);return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min'};
const clock=ms=>{const t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60);return (h?h+':'+pad2(m):m)+':'+pad2(t%60)};
const CHEV='<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>';
const CHECK='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg>';
const BACK='<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M11 3L5 9l6 6"/></svg>';

const LB=0.45359237;
const toKg=lb=>Math.round(lb*LB*10)/10, toLb=kg=>Math.round(kg/LB*2)/2;
const isLb=k=>(S.units||{})[k]==='lb';

/* ---------- state ---------- */
let S={custom:[],swaps:{},units:{},lifts:[],body:[],seat:{},sessions:[],active:null,cardio:[],skips:null};
try{const c=JSON.parse(load('state')||'null'); if(c&&Array.isArray(c.lifts)) S=Object.assign(S,c);}catch(e){}
function registerCustom(){ (S.custom||[]).forEach(c=>{ if(EX[c.k]||!EX[c.of]) return;
  addVariant({k:c.k,of:c.of,name:c.name,diff:'Your own machine. Use these instructions as a guide and follow the sticker on the machine for the set-up.'});
  UNIT[c.k]=UNIT[c.of]; GRP[c.k]=GRP[c.of]; EQP[c.k]='Machine'; if(RLAB[c.of]) RLAB[c.k]=RLAB[c.of]; }); }
registerCustom();
const UI={open:{},extra:{},libq:'',libeq:'All',sync:STANDALONE?'Saved on this phone':'Saved on this device',swapMode:'today',swapQ:''};
let JUSTDONE=null, dbDoc=null, saveTimer=null;
function persist(){
  save('state',JSON.stringify(S));
  if(!dbDoc) return;
  clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    try{await dbDoc.set(S); UI.sync='Saved to your account';}
    catch(e){ if(e&&e.code==='unavailable'){setTimeout(()=>dbDoc.set(S).catch(()=>{}),800+Math.random()*800);} else UI.sync='Saved on this device only'; }
  },500);
}

/* ---------- lookups ---------- */
const nameOf=k=>EX[k]?EX[k].name:k;
const skipList=()=>(S.skips&&S.skips.d===today())?S.skips.list:[];
const sid=(w,slot)=>w+'|'+slot.k;
function slotKey(w,slot){ const x=(S.swaps||{})[sid(w,slot)]; if(!x) return slot.k; if(x.d!=='always'&&x.d!==today()) return slot.k; return EX[x.k]?x.k:slot.k; }
const rlab=k=>unitOf(k)==='sec'?'sec':(RLAB[k]||'reps');
function repsText(slot,k){ return /[a-z]/i.test(slot.reps)?slot.reps:slot.reps+' '+(unitOf(k)==='sec'?'sec':'reps'); }
function rxLine(slot,k){ return slot.sets+' sets · '+repsText(slot,k)+(slot.rest?' · rest '+mmss(slot.rest):''); }
function groupsOf(w){ const out=[]; w.slots.forEach((s,i)=>{ const L=s.g[0]; const g=out[out.length-1]; if(g&&g.L===L) g.idx.push(i); else out.push({L,idx:[i]}); }); return out; }
function groupOf(w,i){ return groupsOf(w).find(g=>g.idx.includes(i)); }
function estMin(w){ const s=w.slots.reduce((t,x)=>t+x.sets*(50+x.rest),0); return Math.round((s/60+8)/5)*5; }

/* ---------- stats ---------- */
function entries(k){return S.lifts.filter(x=>x.k===k)}
function better(a,b,u){ if(!b) return true; if(u==='kg') return a.w>b.w||(a.w===b.w&&a.r>b.r); return a.r>b.r; }
function best(list,u){let b=null; list.forEach(x=>{if(better(x,b,u)) b=x}); return b}
function fmtSet(x,k){ if(!x) return ''; const u=unitOf(k); return u==='kg'?`${x.w} kg × ${x.r}${RLAB[k]?' m':''}`:u==='sec'?`${x.r} sec`:`${x.r} reps`; }
function sessions(k){ const m={}; entries(k).forEach(x=>(m[x.d]=m[x.d]||[]).push(x)); return Object.keys(m).sort().map(d=>({d,sets:m[d].sort((a,b)=>a.s-b.s)})); }
function sessionSummary(ss,k){ const u=unitOf(k), l=rlab(k);
  if(u==='kg'){ const ws=[...new Set(ss.sets.map(x=>x.w))]; return ws.length===1?`${ws[0]} kg: ${ss.sets.map(x=>x.r).join(', ')} ${l}`:ss.sets.map(x=>`${x.w}×${x.r}`).join(', '); }
  return ss.sets.map(x=>x.r).join(', ')+' '+l; }
const doneToday=k=>S.lifts.filter(x=>x.k===k&&x.d===today()).length;
function setsSince(start,end){ return S.lifts.filter(x=>x.t&&x.t>=start&&(!end||x.t<=end)); }
function cardioSince(start,end){ return (S.cardio||[]).filter(x=>x.t>=start&&(!end||x.t<=end)); }
function metrics(list){
  const vol=Math.round(list.filter(x=>unitOf(x.k)==='kg'&&!RLAB[x.k]).reduce((a,x)=>a+x.w*x.r,0));
  return {sets:list.length,reps:list.filter(x=>unitOf(x.k)!=='sec'&&!RLAB[x.k]).reduce((a,x)=>a+x.r,0),vol,ex:new Set(list.map(x=>x.k)).size,pbs:list.filter(x=>x.pb).length};
}
function nextWorkout(){ const ss=(S.sessions||[]).filter(x=>ORDER.includes(x.w)).sort((a,b)=>a.start-b.start); if(!ss.length) return ORDER[0]; return ORDER[(ORDER.indexOf(ss[ss.length-1].w)+1)%ORDER.length]; }
function weekStart(){ const n=new Date(); return new Date(n.getFullYear(),n.getMonth(),n.getDate()-((n.getDay()+6)%7)).getTime(); }
function weekStats(){ const ss=(S.sessions||[]), wk=weekStart(), main=ss.filter(x=>ORDER.includes(x.w));
  let streak=0; for(let i=0;i<520;i++){const a=wk-i*7*864e5,b=a+7*864e5; const n=main.filter(x=>x.start>=a&&x.start<b).length; if(i===0&&n<3) continue; if(n>=3) streak++; else break;}
  return {wk,thisWeek:main.filter(x=>x.start>=wk).length,extras:ss.filter(x=>!ORDER.includes(x.w)&&x.start>=wk).length,last30:ss.filter(x=>x.start>=Date.now()-30*864e5).length,streak,
    avg:main.length?main.reduce((a,x)=>a+(x.end-x.start),0)/main.length:0,cmin:ss.filter(x=>x.start>=wk).reduce((t,x)=>t+(x.cmin||0),0)}; }

/* ---------- small UI helpers ---------- */
function toast(t){ const el=$('toast'); el.textContent=t; el.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>{el.hidden=true},2600); }
function ask(msg,ok,danger,sub){
  return new Promise(res=>{
    const m=$('modal'), okB=$('mok'), noB=$('mno');
    $('mmsg').textContent=msg; $('msub').textContent=sub||''; $('msub').hidden=!sub; okB.textContent=ok||'OK'; okB.classList.toggle('danger',!!danger);
    m.hidden=false;
    const done=v=>{m.hidden=true; okB.onclick=noB.onclick=m.onclick=null; res(v);};
    okB.onclick=()=>done(true); noB.onclick=()=>done(false); m.onclick=e=>{if(e.target===m) done(false)};
  });
}
function openSheet(html){ $('sheetin').innerHTML=html; $('sheet').hidden=false; $('sheetin').scrollTop=0; }
function closeSheet(){ $('sheet').hidden=true; $('sheetin').innerHTML=''; }
$('sheet').addEventListener('click',e=>{ if(e.target===$('sheet')) closeSheet(); });
function lineChart(pts,label){
  if(pts.length<2) return `<p class="empty">${pts.length?'Log one more entry to see a chart.':'No entries yet.'}</p>`;
  const Wd=320,H=130,pl=38,pr=10,pt=12,pb=24;
  const vs=pts.map(p=>p.v); let lo=Math.min(...vs), hi=Math.max(...vs); if(hi===lo){hi+=1;lo-=1}
  const pad=(hi-lo)*0.15; lo-=pad; hi+=pad;
  const X=i=>pl+(Wd-pl-pr)*(i/(pts.length-1)), Y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
  const path=pts.map((p,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
  const r=n=>Math.round(n*10)/10, last=pts.length-1;
  return `<svg viewBox="0 0 ${Wd} ${H}" class="chart" role="img" aria-label="${esc(label)} over time">
    <line x1="${pl}" y1="${Y(hi-pad)}" x2="${Wd-pr}" y2="${Y(hi-pad)}" stroke="var(--line)"/>
    <line x1="${pl}" y1="${Y(lo+pad)}" x2="${Wd-pr}" y2="${Y(lo+pad)}" stroke="var(--line)"/>
    <text x="${pl-6}" y="${Y(hi-pad)+4}" text-anchor="end">${r(hi-pad)}</text>
    <text x="${pl-6}" y="${Y(lo+pad)+4}" text-anchor="end">${r(lo+pad)}</text>
    <path d="${path} L${X(last)},${H-pb} L${X(0)},${H-pb} Z" fill="var(--accent-soft)"/>
    <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(last)}" cy="${Y(pts[last].v)}" r="4.5" fill="var(--accent)" stroke="var(--bg)" stroke-width="2"/>
    <text x="${pl}" y="${H-6}">${fmtD(pts[0].d)}</text>
    <text x="${Wd-pr}" y="${H-6}" text-anchor="end">${fmtD(pts[last].d)}</text>
  </svg>`;
}
function framesHTML(e){
  const P0=P[e.pose||e.k]||P[e.k]; if(!P0) return '';
  const bones=P0.bones||SIDE, labs=P0.labels||['Start','Finish'], view=e.view||P0.view;
  return `<div class="frames${P0.c?' three':''}">
    <div class="frame">${svg(P0.a,'var(--fig)',bones)}<div class="lab">${labs[0]}</div></div>
    <div class="arrow" aria-hidden="true">${P0.bad?'vs':'&#8594;'}</div>
    <div class="frame ${P0.bad?'bad':'end'}">${svg(P0.b,P0.bad?'var(--wrong)':'var(--move)',bones)}<div class="lab">${labs[1]}</div></div>
    ${P0.c?`<div class="arrow" aria-hidden="true">&#8594;</div><div class="frame end">${svg(P0.c,'var(--move)',bones)}<div class="lab">${labs[2]}</div></div>`:''}
  </div>${view?`<p class="view">${view}</p>`:''}${e.diff?`<p class="diff"><b>What’s different.</b> ${esc(e.diff)}</p>`:''}`;
}
const acc=(name,def)=>(name in UI.open?UI.open[name]:def)?'open':'';
function howHTML(e,open){
  return `<details data-acc="how" ${acc('how',open)}><summary>How to do it</summary><div class="how">
    <h4>Set up</h4><ol>${e.setup.map(x=>`<li>${x}</li>`).join('')}</ol>
    <h4>The movement</h4><ol>${e.doit.map(x=>`<li>${x}</li>`).join('')}</ol>
    <h4>You should feel it in</h4><p>${e.feel}</p>
    <h4>Avoid</h4><ul class="avoid">${e.avoid.map(x=>`<li>${x}</li>`).join('')}</ul>
  </div></details>`;
}
function progressHTML(k){
  const u=unitOf(k), ss=sessions(k), hist=ss.slice(-8).reverse();
  const pts=ss.map(s=>({d:s.d,v:u==='kg'?Math.max(...s.sets.map(x=>x.w)):Math.max(...s.sets.map(x=>x.r))}));
  return `<details data-acc="prog" ${acc('prog',false)}><summary>Progress</summary><div class="how">
    <p class="tiny">${u==='kg'?'Heaviest weight each session (kg)':u==='sec'?'Longest hold each session (sec)':'Most reps each session'}</p>
    ${lineChart(pts,nameOf(k))}
    ${hist.length?`<ul class="hl">${hist.map(s=>`<li><span>${fmtD(s.d)}</span><span>${sessionSummary(s,k)}</span><button class="del" data-a="delsets" data-k="${k}" data-d="${s.d}">Delete</button></li>`).join('')}</ul>`:''}
  </div></details>`;
}
function statHTML(k){
  const u=unitOf(k), pb=best(entries(k),u), past=sessions(k).filter(s=>s.d<today()), last=past[past.length-1];
  return `<dl class="statline"><dt>Best</dt><dd>${pb?fmtSet(pb,k)+` <span class="muted">· ${fmtD(pb.d)}</span>`:'<span class="muted">None yet</span>'}</dd>
    <dt>Last time</dt><dd>${last?sessionSummary(last,k)+` <span class="muted">· ${fmtD(last.d)}</span>`:'<span class="muted">First session</span>'}</dd></dl>`;
}

/* ---------- navigation ---------- */
const NAV={tab:'home',stack:[]};
const TABS=[['home','Today','<path d="M3 10.5L11 4l8 6.5V19H3z"/><path d="M9 19v-5h4v5"/>'],['workouts','Workouts','<path d="M2 11h18M5 7v8M17 7v8M8 5v12M14 5v12"/>'],['library','Library','<path d="M4 4h6v6H4zM12 4h6v6h-6zM4 12h6v6H4zM12 12h6v6h-6z"/>'],['progress','Progress','<path d="M3 18l5-6 4 3 7-9"/><path d="M3 20h16"/>']];
const cur=()=>NAV.stack[NAV.stack.length-1]||{v:NAV.tab};
function go(v){ NAV.stack.push(v); UI.open={}; render(true); }
function back(){ NAV.stack.pop(); UI.open={}; render(true); }
function setTab(t){ NAV.tab=t; NAV.stack=[]; UI.open={}; render(true); }
function render(top){
  const v=$('view'), st=v.scrollTop, c=cur();
  v.innerHTML=`<div class="screen">${SCREENS[c.v](c)}</div>`;
  v.scrollTop=top?0:st;
  $('tabs').innerHTML=TABS.map(([id,l,ic])=>`<button data-a="tab" data-t="${id}" ${NAV.tab===id?'aria-current="page"':''}><svg viewBox="0 0 22 22" aria-hidden="true">${ic}</svg>${l}</button>`).join('');
  renderSession();
  if(c.v==='library') renderLibList();
}
const topbar=(label,right)=>`<div class="topbar"><button class="back" data-a="back">${BACK}${label}</button><div class="tbtns">${right||''}</div></div>`;

/* ---------- screens ---------- */
const SCREENS={};
function summaryHTML(x,title){
  const cardio=x.w==='cardio';
  const t=cardio?[['Time',(x.cmin||Math.round((x.end-x.start)/60000))+' min'],['Machine',x.ctype||'Cardio','txt'],['Distance',x.dist?x.dist+' km':'Not logged',x.dist?'':'txt'],['Calories',x.cal||'Not logged',x.cal?'':'txt'],['Heart rate',x.hr||'Not logged',x.hr?'':'txt'],['Effort',x.rpe?LVL[x.rpe].n:'Not logged','txt']]
    :[['Time',dur(x.end-x.start)],['Sets',x.sets],['Personal bests',x.pbs],['Lifted',x.vol.toLocaleString('en-AU')+' kg'],['Cardio',x.cmin?x.cmin+' min':'None'],['Skipped',(x.skipped||[]).length]];
  return `<div class="card done"><h3>${title}</h3><div class="tiles">${t.map(([l,v,c])=>`<div class="tile" style="background:var(--bg)"><small>${l}</small><b class="${c||''}">${v}</b></div>`).join('')}</div></div>`;
}
SCREENS.home=()=>{
  const a=S.active, nx=W[a?a.w:nextWorkout()], st=weekStats(), now=new Date();
  const ss=(S.sessions||[]).slice().sort((x,y)=>y.start-x.start), last=ss[0];
  const days=['M','T','W','T','F','S','S'].map((l,i)=>{ const d=dstr(new Date(st.wk+i*864e5+432e5)); const day=ss.filter(x=>x.d===d);
    return `<div class="${day.some(x=>ORDER.includes(x.w))?'w':day.length?'c':''}${d===today()?' t':''}"><i></i>${l}</div>`; }).join('');
  return `<div><p class="eyebrow">${now.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})}</p><h1>${a?'In progress':'Up next'}</h1></div>
  ${last&&JUSTDONE===last.id?summaryHTML(last,(last.w==='cardio'?'Cardio':W[last.w].name)+' done'):''}
  <div class="hero">
    <div><p class="eyebrow">${nx.extra?'Extra session':'Workout '+nx.n}</p><h2>${nx.name}</h2><p class="sub">${nx.focus||''}</p></div>
    ${nx.slots.length?`<p class="tiny">About ${estMin(nx)} min · ${nx.slots.length} exercises · ${nameOf(slotKey(nx.id,nx.slots[0]))} first</p>`:''}
    ${a?`<button class="btn" data-a="openw" data-w="${nx.id}">Continue workout</button>`:`<button class="btn" data-a="start" data-w="${nx.id}">Start workout</button><button class="btn ghost small" data-a="openw" data-w="${nx.id}">Look through it first</button>`}
  </div>
  <div class="section"><div class="week">${days}</div>
    <div class="tiles"><div class="tile"><small>Weights this week</small><b>${st.thisWeek}<span class="muted" style="font-size:16px;font-weight:400"> of 3</span></b></div><div class="tile"><small>Weeks in a row</small><b>${st.streak}</b></div><div class="tile"><small>Last 30 days</small><b>${st.last30}</b></div></div></div>
  <div class="section"><h3>Extras</h3><div class="rows listwrap">
    <button class="row" data-a="openw" data-w="det"><span class="main"><b>Details</b><span>${W.det.focus} · about ${estMin(W.det)} min</span></span>${CHEV}</button>
    <button class="row" data-a="go" data-v="cardio"><span class="main"><b>Cardio</b><span>Incline walk, bike intervals or machine mix</span></span>${CHEV}</button>
  </div></div>
  ${last&&JUSTDONE!==last.id?`<p class="tiny">Last session: ${last.w==='cardio'?'Cardio':W[last.w]?W[last.w].long:last.w}, ${fmtD(last.d)}.</p>`:''}
  <div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><button class="link" data-a="go" data-v="guide">How this plan works</button><span class="tiny">${UI.sync}</span></div>`;
};
SCREENS.workouts=()=>{
  const nx=nextWorkout();
  const row=w=>`<button class="row" data-a="openw" data-w="${w.id}"><span class="tag">${w.extra?'+':w.n}</span><span class="main"><b>${w.name}${!w.extra&&w.id===nx&&!S.active?' <span class="muted" style="font-weight:500">· up next</span>':''}</b><span>${w.focus}</span></span><span class="meta">${estMin(w)} min</span>${CHEV}</button>`;
  return `<div><p class="eyebrow">Do them in order, whatever the day</p><h1>Workouts</h1></div>
  <div class="rows listwrap">${WORKOUTS.filter(w=>!w.extra).map(row).join('')}</div>
  <div class="section"><h3>Extras</h3><p class="sub">Add these on a day you are not lifting. They don’t change which workout is up next.</p><div class="rows listwrap">
    ${row(W.det)}
    ${CPLANS.map(p=>`<button class="row" data-a="go" data-v="cardio"><span class="tag">+</span><span class="main"><b>${p.name}</b><span>Cardio · ${p.machine==='Mixed'?'bike, cross-trainer, rower':p.machine.toLowerCase()}</span></span><span class="meta">${Math.round(ptotal(p)/60)} min</span>${CHEV}</button>`).join('')}
  </div></div>`;
};
function cardioRow(w,part){
  const cur_=(S.cardio||[]).find(x=>x.d===today()&&x.w===w&&x.part===part);
  return `<button class="row" data-a="cardiosheet" data-w="${w}" data-part="${part}"><span class="tag">${part==='warm'?'↑':'↓'}</span><span class="main"><b>${part==='warm'?'Warm-up':'Finish: incline walk'}</b><span>${part==='warm'?'5 min easy cardio, then lighter sets of your first lift':'Optional. 10 min, 5 to 5.5 km/h, incline 8 to 12%'}</span></span><span class="meta${cur_?' ok':''}">${cur_?cur_.min+' min':'Log'}</span>${CHEV}</button>`;
}
SCREENS.workout=c=>{
  const w=W[c.w], a=S.active, sk=skipList();
  const lastS=(S.sessions||[]).filter(x=>x.w===w.id).sort((x,y)=>y.start-x.start)[0];
  const row=i=>{ const s=w.slots[i], k=slotKey(w.id,s), d=doneToday(k), skipped=sk.includes(sid(w.id,s));
    return `<button class="row${skipped?' skipped':''}" data-a="openex" data-w="${w.id}" data-i="${i}"><span class="tag">${s.g}</span><span class="main"><b>${esc(nameOf(k))}</b><span>${skipped?'Skipped today':s.sets+' × '+repsText(s,k)+(k!==s.k?' · swapped':'')}</span></span><span class="meta${d>=s.sets?' ok':''}">${skipped?'':d+'/'+s.sets}</span>${CHEV}</button>`; };
  const list=groupsOf(w).map(g=>g.idx.length===1?row(g.idx[0]):`<div class="grp"><p class="cap">${g.idx.length>2?'Circuit':'Superset'} · back to back, then rest ${mmss(w.slots[g.idx[g.idx.length-1]].rest)}</p>${g.idx.map(row).join('')}</div>`).join('');
  return `${topbar('Back')}
  <div><p class="eyebrow">${w.extra?'Extra session':'Workout '+w.n} · about ${estMin(w)} min</p><h1>${w.name}</h1><p class="sub">${w.focus}. ${w.blurb}</p></div>
  ${lastS&&JUSTDONE===lastS.id?summaryHTML(lastS,w.name+' done'):''}
  ${!a?`<button class="btn" data-a="start" data-w="${w.id}">Start workout</button>`:a.w!==w.id?`<p class="note">${W[a.w].long} is still running. Finish it from the bar at the top before starting this one.</p>`:''}
  <div class="rows listwrap">${cardioRow(w.id,'warm')}${list}${cardioRow(w.id,'cool')}</div>
  ${a&&a.w===w.id?`<button class="btn" data-a="finish">Finish workout</button><button class="link" data-a="cancel" style="align-self:center">Cancel this workout</button>`:''}
  ${lastS&&JUSTDONE!==lastS.id?`<p class="tiny">Last done ${fmtD(lastS.d)}: ${dur(lastS.end-lastS.start)}, ${lastS.sets} sets.</p>`:''}`;
};
function nextTarget(w,i){
  const sk=skipList(), ok=j=>!sk.includes(sid(w.id,w.slots[j])), left=j=>ok(j)&&doneToday(slotKey(w.id,w.slots[j]))<w.slots[j].sets;
  const g=groupOf(w,i), p=g.idx.indexOf(i);
  if(g.idx.length>1){
    for(let q=p+1;q<g.idx.length;q++) if(ok(g.idx[q])) return g.idx[q];
    const again=g.idx.find(j=>left(j)); if(again!=null&&again!==i) return again;
  }
  for(let j=g.idx[g.idx.length-1]+1;j<w.slots.length;j++) if(ok(j)) return j;
  return null;
}
function setsHTML(w,i){
  const slot=w.slots[i], k=slotKey(w.id,slot), u=unitOf(k), lu=u==='kg'&&isLb(k), t=today();
  const todays=entries(k).filter(x=>x.d===t), past=sessions(k).filter(s=>s.d<t), last=past[past.length-1];
  const shown=x=>x?(lu?(x.lb!=null?x.lb:toLb(x.w)):x.w):'';
  const src=todays.length?[...todays].sort((a,b)=>b.s-a.s)[0]:last?last.sets[0]:null, lastW=shown(src);
  const n=Math.max(slot.sets,UI.extra[k]||0,...todays.map(x=>x.s));
  const ph=(slot.reps.match(/^[\d–]+/)||[''])[0], rl=rlab(k);
  let rows='';
  for(let s=1;s<=n;s++){
    const done=todays.find(x=>x.s===s), wv=done?shown(done):lastW;
    const wIn=u==='kg'?`<div class="field"><input class="w" id="w${s}" type="number" inputmode="decimal" step="0.5" min="0" aria-label="Set ${s} weight" value="${wv}" placeholder="0"><span>${lu?'lb':'kg'}</span></div>`:'';
    rows+=`<div class="setrow${u==='kg'?'':u==='sec'?' hold':' one'}${done?' done':''}" data-s="${s}"><span class="sn">${s}</span>${wIn}
      <div class="field"><input class="r" id="r${s}" type="number" inputmode="numeric" min="0" aria-label="Set ${s} ${rl}" value="${done?done.r:''}" placeholder="${ph}"><span>${rl}</span></div>
      ${u==='sec'?`<button class="holdbtn" data-a="hold" data-s="${s}">Timer</button>`:''}
      <button class="tick" data-a="save" data-s="${s}" aria-label="Save set ${s}">${CHECK}</button>
      ${lu?`<div class="conv">${wv!==''&&+wv>0?'= '+toKg(+wv)+' kg':''}</div>`:''}</div>`;
  }
  let hint='';
  if(last&&u==='kg'&&!RLAB[k]){ const top=+((slot.reps.match(/(\d+)(?!.*\d)/)||[])[1]||0); const ws=new Set(last.sets.map(x=>x.w));
    if(top&&last.sets.length>=slot.sets&&ws.size===1&&last.sets.every(x=>x.r>=top)) hint=`<p class="hint">You hit ${top} on every set last time. Add the smallest weight step today.</p>`; }
  return `<div class="section"><div class="sethead"><p class="eyebrow">Log your sets</p>${u==='kg'?`<div class="seg" role="group" aria-label="Weight unit on this machine"><button data-a="unit" data-u="kg" aria-pressed="${!lu}">kg</button><button data-a="unit" data-u="lb" aria-pressed="${lu}">lb</button></div>`:''}</div>
    <div class="sets">${rows}</div>
    <button class="link" data-a="addset" style="align-self:flex-start">Add a set</button>
    ${statHTML(k)}${hint}</div>`;
}
SCREENS.ex=c=>{
  const w=W[c.w], i=c.i, slot=w.slots[i], k=slotKey(w.id,slot), e=EX[k], id=sid(w.id,slot), skipped=skipList().includes(id);
  const g=groupOf(w,i), others=g.idx.filter(j=>j!==i), nt=nextTarget(w,i);
  const ntLabel=nt==null?'Back to workout':(nt<=i?'Back to ':'Next: ')+w.slots[nt].g+' · '+nameOf(slotKey(w.id,w.slots[nt]));
  return `${topbar(w.name,`<button class="chip" data-a="swap">Swap</button><button class="chip" data-a="${skipped?'unskip':'skip'}">${skipped?'Undo skip':'Skip'}</button>`)}
  <div><p class="eyebrow">${slot.g} · ${i+1} of ${w.slots.length}</p><h1 style="font-size:32px">${esc(e.name)}</h1><p class="sub num">${rxLine(slot,k)}</p>${k!==slot.k?`<p class="tiny" style="color:var(--accent-ink);font-weight:600">Swapped in for ${esc(nameOf(slot.k))}</p>`:''}</div>
  ${others.length?`<p class="note">${others.length>1?'Circuit':'Superset'} with ${others.map(j=>w.slots[j].g+' '+esc(nameOf(slotKey(w.id,w.slots[j])))).join(' and ')}. Do one set of each back to back, then rest ${mmss(w.slots[g.idx[g.idx.length-1]].rest)}.</p>`:''}
  ${slot.note?`<p class="note">${slot.note}</p>`:''}
  ${skipped?`<div class="card soft"><p><b>Skipped for today.</b> It will be noted in your workout summary.</p><button class="btn ghost small" data-a="unskip">Equipment free? Undo skip</button></div>`:`
  <div class="section">${framesHTML(e)}</div>
  ${setsHTML(w,i)}
  <div class="accs">${howHTML(e,!entries(k).length)}${progressHTML(k)}
    <details data-acc="seat" ${acc('seat',!!S.seat[k])}><summary>Your set-up notes</summary><div class="how"><div class="fld"><label for="seat">Seat height, pin, rack or handle position</label><input type="text" id="seat" data-seat="${k}" value="${esc(S.seat[k]||'')}" placeholder="e.g. seat 4, rack hole 12"></div></div></details></div>`}
  <div class="exnav"><button class="prev" data-a="prevex" aria-label="Previous exercise" ${i===0?'disabled style="opacity:.35"':''}>${BACK}</button><button class="btn" data-a="nextex" data-n="${nt==null?'':nt}"><span>${esc(ntLabel)}</span></button></div>`;
};
SCREENS.info=c=>{
  const k=c.k, e=EX[k];
  return `${topbar('Library')}
  <div><p class="eyebrow">${GNAME[GRP[k]]||''}${EQP[k]?' · '+EQP[k]:''}</p><h1 style="font-size:32px">${esc(e.name)}</h1></div>
  <div class="section">${framesHTML(e)}</div>
  ${statHTML(k)}
  <div class="accs">${howHTML(e,true)}${progressHTML(k)}</div>
  <p class="tiny">To use this in a session, open any exercise in a workout and tap Swap.</p>`;
};
SCREENS.library=()=>`<div><p class="eyebrow">${Object.keys(EX).length} exercises</p><h1>Library</h1></div>
  <input class="search" id="libq" type="search" placeholder="Search exercises" value="${esc(UI.libq)}" aria-label="Search exercises">
  <div class="chips">${['All',...EQTAGS.map(t=>t[0])].map(t=>`<button class="chip" data-a="libeq" data-t="${t}" aria-pressed="${UI.libeq===t}">${t}</button>`).join('')}</div>
  <div id="liblist" class="section" style="gap:22px"></div>`;
function exRow(k,action,extra){ const pb=best(entries(k),unitOf(k));
  return `<button class="row" data-a="${action}" data-k="${k}"><span class="main"><b>${esc(nameOf(k))}</b><span>${EQP[k]||''}${pb?' · best '+fmtSet(pb,k):''}</span></span>${extra||''}${CHEV}</button>`; }
function libMatch(k){ const q=UI.libq.trim().toLowerCase(); return (UI.libeq==='All'||EQP[k]===UI.libeq)&&(!q||nameOf(k).toLowerCase().includes(q)); }
function renderLibList(){
  const el=$('liblist'); if(!el) return;
  const h=GROUPS.map(([id,name])=>{ const ks=Object.keys(EX).filter(k=>GRP[k]===id&&libMatch(k)); return ks.length?`<div class="section"><h3>${name}</h3><div class="rows listwrap">${ks.map(k=>exRow(k,'info')).join('')}</div></div>`:''; }).join('');
  el.innerHTML=h||'<p class="empty">Nothing matches. Try a different word or filter.</p>';
}
SCREENS.progress=()=>{
  const st=weekStats(), ss=(S.sessions||[]).slice().sort((a,b)=>b.start-a.start);
  const body=[...S.body].sort((a,b)=>a.d<b.d?-1:1);
  const wPts=body.filter(x=>x.kg>0).map(x=>({d:x.d,v:x.kg})), cPts=body.filter(x=>x.waist>0).map(x=>({d:x.d,v:x.waist}));
  const change=(pts,u)=>{ if(pts.length<2) return ''; const dl=Math.round((pts[pts.length-1].v-pts[0].v)*10)/10; return `<p class="hint">${dl>0?'+':''}${dl} ${u} since ${fmtD(pts[0].d)}</p>`; };
  let pb='';
  GROUPS.forEach(([id,name])=>{ const ks=Object.keys(EX).filter(k=>GRP[k]===id&&entries(k).length); if(!ks.length) return;
    pb+=`<tr class="g"><th colspan="3">${name}</th></tr>`+ks.map(k=>{const b=best(entries(k),unitOf(k)); return `<tr><td>${esc(nameOf(k))}</td><td>${fmtSet(b,k)}</td><td class="muted">${fmtD(b.d)}</td></tr>`;}).join(''); });
  const line=x=>x.w==='cardio'?`${x.cmin} min${x.ctype?' '+x.ctype.toLowerCase():''}${x.dist?', '+x.dist+' km':''}${x.cal?', '+x.cal+' cal':''}`
    :`${dur(x.end-x.start)}, ${x.sets} sets, ${x.vol.toLocaleString('en-AU')} kg${x.cmin?`, ${x.cmin} min cardio`:''}${x.pbs?`, ${x.pbs} PB${x.pbs>1?'s':''}`:''}${x.skipped&&x.skipped.length?`, skipped ${x.skipped.map(nameOf).join(', ')}`:''}`;
  return `<div><p class="eyebrow">Your training record</p><h1>Progress</h1></div>
  <div class="tiles"><div class="tile"><small>Weights this week</small><b>${st.thisWeek}<span class="muted" style="font-size:16px;font-weight:400"> of 3</span></b></div><div class="tile"><small>Extras this week</small><b>${st.extras}</b></div><div class="tile"><small>Weeks in a row</small><b>${st.streak}</b></div>
    <div class="tile"><small>Last 30 days</small><b>${st.last30}</b></div><div class="tile"><small>Average session</small><b>${st.avg?Math.round(st.avg/60000):0}<span class="muted" style="font-size:16px;font-weight:400"> min</span></b></div><div class="tile"><small>Cardio this week</small><b>${st.cmin}<span class="muted" style="font-size:16px;font-weight:400"> min</span></b></div></div>
  <div class="section"><h3>Body</h3>
    <div class="fgrid"><div class="fld full"><label for="bd">Date</label><input type="date" id="bd" value="${today()}"></div>
      <div class="fld"><label for="bkg">Weight (kg)</label><input type="number" id="bkg" inputmode="decimal" step="0.1" min="0" placeholder="e.g. 68.4"></div>
      <div class="fld"><label for="bw">Waist (cm)</label><input type="number" id="bw" inputmode="decimal" step="0.5" min="0" placeholder="at belly button"></div></div>
    <button class="btn small" data-a="bodysave">Save measurement</button>
    <p class="tiny">Weigh in first thing in the morning. Measure your waist relaxed, at belly-button height. For your goal the waist number matters more than the scale.</p>
    <div class="card"><p class="eyebrow">Body weight (kg)</p>${change(wPts,'kg')}${lineChart(wPts,'Body weight')}</div>
    <div class="card"><p class="eyebrow">Waist (cm)</p>${change(cPts,'cm')}${lineChart(cPts,'Waist')}</div>
    ${body.length?`<ul class="hl">${[...body].reverse().slice(0,10).map(x=>`<li><span>${fmtD(x.d)}</span><span>${x.kg?x.kg+' kg':''}${x.kg&&x.waist?', ':''}${x.waist?x.waist+' cm':''}</span><button class="del" data-a="delbody" data-d="${x.d}">Delete</button></li>`).join('')}</ul>`:''}
  </div>
  <div class="section"><h3>Sessions</h3>${ss.length?`<ul class="hl">${ss.slice(0,15).map(x=>`<li><span>${fmtD(x.d)}</span><span>${x.w==='cardio'?'Cardio':W[x.w]?W[x.w].long:x.w}<span class="sd">${line(x)}</span></span><button class="del" data-a="delsess" data-id="${x.id}">Delete</button></li>`).join('')}</ul>`:'<p class="empty">Finished sessions will show here.</p>'}</div>
  <div class="section"><h3>Personal bests</h3>${pb?`<table class="pbt">${pb}</table>`:'<p class="empty">Log a set and your best lifts will show here.</p>'}</div>
  <div class="section"><h3>Backup</h3><p class="sub">${STANDALONE?'Your training record is stored on this phone. Save a backup now and then, and before changing phones.':'Copy your whole training record to move it into the standalone app, or to keep a backup.'}</p>
    <button class="btn ghost small" data-a="export">Copy my data</button>${STANDALONE?'<button class="btn ghost small" data-a="exportfile">Save a backup file</button>':''}<button class="btn ghost small" data-a="importopen">Import data</button></div>`;
};
SCREENS.guide=()=>`${topbar('Back')}
  <div><p class="eyebrow">Read once</p><h1>How this plan works</h1></div>
  <div class="prose"><h3>The week</h3><p>Train three days a week. Do Workouts 1 to 4 in order and start again, whatever day it is. Details and cardio are extras for the days in between, and they don’t change what’s up next.</p></div>
  <div class="prose"><h3>How a session runs</h3><ul>
    <li><b>Warm-up.</b> Five easy minutes on a bike or treadmill, then two lighter sets of your first lift.</li>
    <li><b>A is the main lift.</b> Heavy, low reps, long rests. This is where strength is built, so it gets your best effort.</li>
    <li><b>B, C and D are supersets.</b> Two exercises back to back with no rest between them, then rest. B1, B2, rest, repeat. It keeps your heart rate up and gets more work into the hour.</li>
    <li><b>The last block is a finisher.</b> Short and hard: dips, a sled, a carry or a circuit.</li>
    <li><b>Finish with a 10 minute incline walk</b> if you have time. Skip it after Legs.</li></ul></div>
  <div class="prose"><h3>Picking a weight</h3><p>Choose a weight where the last two reps of each set are hard but still look like the drawing. On the main lift, finish each set knowing you had one or two reps left. On everything else, the last set can go until your form is about to slip.</p><p><b>When to go up.</b> Once you hit the top of the rep range on every set, add the smallest weight step next time. The app tells you when.</p></div>
  <div class="prose"><h3>Free weights</h3><p>Squats, bench and deadlifts are in here because they do more than machines. Start each one with the empty bar, set the safety arms, and add weight slowly. If a rack is taken or a lift doesn’t feel right on the day, tap Swap. Every exercise has machine, cable and dumbbell alternatives.</p></div>
  <div class="prose"><h3>Calves and other stubborn areas</h3><p>Calves, forearms and rear shoulders respond to frequency and slow reps. Calves are trained in Legs, Full body and Details. Pause at the bottom and top of every rep and don’t bounce.</p></div>
  <div class="prose"><h3>The honest bit about belly fat</h3><p>You can’t burn fat from one spot. Ab exercises strengthen the muscle underneath, and the fat on top goes only when your overall body fat drops. For someone lean everywhere else, that means building muscle while eating at about maintenance with plenty of protein.</p><ul>
    <li>Protein at every meal. About 1.6 g per kg of bodyweight a day.</li><li>Cut liquid calories and alcohol first.</li><li>Seven to nine hours of sleep.</li><li>Track your waist every week or two. The scale may barely move while you add muscle and lose fat.</li></ul></div>`;

/* ---------- actions ---------- */
function slotCtx(){ const c=cur(); if(c.v!=='ex') return null; const w=W[c.w], slot=w.slots[c.i]; return {c,w,i:c.i,slot,k:slotKey(w.id,slot),id:sid(w.id,slot)}; }
function logSet(s,row){
  const x=slotCtx(); if(!x) return; const k=x.k, u=unitOf(k);
  const raw=u==='kg'?parseFloat(row.querySelector('.w').value):0, r=parseInt(row.querySelector('.r').value,10);
  if(u==='kg'&&!(raw>=0&&isFinite(raw))){ row.querySelector('.w').focus(); return; }
  if(!(r>0)){ row.querySelector('.r').focus(); return; }
  const lu=u==='kg'&&isLb(k), w=lu?toKg(raw):raw, d=today();
  const others=S.lifts.filter(e=>!(e.k===k&&e.d===d&&e.s===s)), prev=best(others.filter(e=>e.k===k),u);
  const entry={d,k,s,w,r,t:Date.now()}; if(lu) entry.lb=raw;
  const isPB=!!(prev&&better(entry,prev,u)); if(isPB) entry.pb=1;
  S.lifts=[...others,entry];
  if(!S.active) S.active={w:x.w.id,start:Date.now()};
  persist();
  if(isPB) toast('New personal best');
  if(x.slot.rest>0) startRest(x.slot.rest,nameOf(k)); else { initAudio(); const nt=nextTarget(x.w,x.i); if(nt!=null&&nt!==x.i&&!isPB) toast('Now '+x.w.slots[nt].g+' · '+nameOf(slotKey(x.w.id,x.w.slots[nt]))); }
  render();
}
async function startWorkout(w){
  if(S.active&&S.active.w!==w){ if(!await ask('Finish '+W[S.active.w].long+' first?','Finish and start',false,'It is still running. Finishing saves it to your log.')) return; await finishWorkout(true); }
  if(!S.active){ S.active={w,start:Date.now()}; persist(); }
  JUSTDONE=null; NAV.tab='workouts'; NAV.stack=[{v:'workout',w}]; UI.open={}; render(true);
}
async function finishWorkout(silent){
  const a=S.active; if(!a) return;
  let end=Date.now(); const list=setsSince(a.start,end), cl=cardioSince(a.start,end);
  if(!list.length&&!cl.length){
    if(silent||await ask('Nothing was logged','Discard',true,'Discard this workout? It won’t appear in your log.')){ S.active=null; persist(); render(); }
    return;
  }
  if(!silent&&!await ask('Finish '+W[a.w].long+'?','Finish workout')) return;
  const lastT=Math.max(...list.map(x=>x.t),...cl.map(x=>x.t)); if(end-lastT>2*3600000) end=lastT+10*60000;
  const m=metrics(list), skipped=skipList().filter(x=>x.startsWith(a.w+'|')).map(x=>x.split('|')[1]), mainC=cl.find(x=>x.part==='main')||{};
  const sess={id:String(a.start),w:a.w,d:today(),start:a.start,end,...m,cmin:cl.reduce((t,x)=>t+(x.min||0),0),skipped,dist:Math.round(cl.reduce((t,x)=>t+(x.dist||0),0)*100)/100,cal:cl.reduce((t,x)=>t+(x.cal||0),0),hr:mainC.hr||0,rpe:mainC.rpe||0,ctype:mainC.type||''};
  S.sessions=[...(S.sessions||[]),sess]; S.active=null; JUSTDONE=sess.id;
  S.skips={d:today(),list:skipList().filter(x=>!x.startsWith(a.w+'|'))};
  stopRest(); persist();
  if(!silent){ NAV.tab='home'; NAV.stack=[]; render(true); } else render();
}
function toggleSkip(on){ const x=slotCtx(); if(!x) return; const l=skipList().filter(i=>i!==x.id); if(on) l.push(x.id); S.skips={d:today(),list:l};
  if(on&&!S.active) S.active={w:x.w.id,start:Date.now()}; persist(); render(); }

/* swap sheet */
let SWAP=null;
function swapListHTML(){
  const {w,slot}=SWAP, curK=slotKey(w.id,slot), q=UI.swapQ.trim().toLowerCase(), g=GRP[slot.k];
  const opt=(k,del)=>`<div style="display:grid;grid-template-columns:1fr auto"><button class="sopt" data-a="pick" data-k="${k}"><span><b>${esc(nameOf(k))}</b><span>${k===slot.k?'Original':EQP[k]||''}</span></span>${k===curK?'<em>Current</em>':''}</button>${del?`<button class="del" data-a="delcustom" data-k="${k}">Remove</button>`:''}</div>`;
  if(q){ const ks=Object.keys(EX).filter(k=>nameOf(k).toLowerCase().includes(q)); return ks.length?ks.map(k=>opt(k)).join(''):'<p class="empty">Nothing matches that.</p>'; }
  const alts=altsFor(slot.k), rest=Object.keys(EX).filter(k=>GRP[k]===g&&k!==slot.k&&!alts.includes(k)&&!k.startsWith('c_'));
  const mine=(S.custom||[]).filter(c=>GRP[c.of]===g&&EX[c.k]);
  return opt(slot.k)+(alts.length?`<p class="shead">Closest alternatives</p>`+alts.map(k=>opt(k)).join(''):'')
    +(rest.length?`<p class="shead">More for ${GNAME[g].toLowerCase()}</p>`+rest.map(k=>opt(k)).join(''):'')
    +`<p class="shead">Your machines</p>`+mine.map(c=>opt(c.k,true)).join('');
}
function openSwap(){
  const x=slotCtx(); if(!x) return; SWAP=x; UI.swapQ=''; UI.swapMode='today';
  openSheet(`<h3>Swap exercise</h3>
    <div class="seg" role="group" aria-label="How long to swap for" style="align-self:flex-start"><button data-a="swapmode" data-m="today" aria-pressed="true">Today only</button><button data-a="swapmode" data-m="always" aria-pressed="false">Every time</button></div>
    <input class="search" id="swapq" type="search" placeholder="Search the whole library" aria-label="Search the whole library">
    <div id="swaplist">${swapListHTML()}</div>
    <div class="addmine"><input class="search" type="text" id="custname" maxlength="60" placeholder="Add a machine that isn’t listed" aria-label="Machine name"><button class="btn small" data-a="addcustom">Add</button></div>
    <p class="tiny">A machine you add uses the ${esc(nameOf(x.slot.k).toLowerCase())} drawing and keeps its own personal bests.</p>
    <button class="btn ghost small" data-a="closesheet">Go back</button>`);
}
function pickSwap(k){ const {w,slot,id}=SWAP; S.swaps=S.swaps||{};
  if(k===slot.k) delete S.swaps[id]; else S.swaps[id]={k,d:UI.swapMode==='always'?'always':today()};
  closeSheet(); persist(); render(true); }

/* warm-up and cool-down sheet */
const CTYPES=['Treadmill walk','Exercise bike','Cross-trainer','Rower','Stairs','Other'];
let CSH=null;
function openCardioSheet(w,part){
  CSH={w,part}; const d=today(), cur_=(S.cardio||[]).find(x=>x.d===d&&x.w===w&&x.part===part);
  const prev=cur_||(S.cardio||[]).filter(x=>x.part===part).sort((a,b)=>b.t-a.t)[0]||{};
  const type=prev.type||(part==='warm'?'Exercise bike':'Treadmill walk'), v=f=>cur_&&cur_[f]?cur_[f]:'', ph=(f,def)=>prev[f]?String(prev[f]):def;
  const first=W[w].slots[0], fk=slotKey(w,first), lb=unitOf(fk)==='kg'&&isLb(fk);
  const f=(id,label,val,phv,step)=>`<div class="fld"><label for="${id}">${label}</label><input id="${id}" type="number" inputmode="decimal" min="0" step="${step||1}" value="${val}" placeholder="${phv||''}"></div>`;
  openSheet(`<h3>${part==='warm'?'Warm-up':'Finish: cardio'}</h3>
    <p class="sub">${part==='warm'?'Five easy minutes, then two lighter sets of '+esc(nameOf(fk).toLowerCase())+' before your working sets.':'Treadmill at 5 to 5.5 km/h, incline 8 to 12%, hands off the rails. Tap Save to log the usual.'}</p>
    <div class="fgrid"><div class="fld full"><label for="ctype">Machine</label><select id="ctype">${CTYPES.map(t=>`<option${t===type?' selected':''}>${t}</option>`).join('')}</select></div>
      ${f('cmin','Minutes',v('min'),ph('min',part==='warm'?'5':'10'),0.5)}${f('cspeed','Speed (km/h) or level',v('speed'),ph('speed',part==='warm'?'':'5.5'),0.1)}
      ${f('cinc','Incline (%)',v('inc'),ph('inc',part==='warm'?'':'10'),0.5)}${f('cdist','Distance (km)',v('dist'),'',0.01)}
      ${f('ccal','Calories (machine)',v('cal'),'')}${f('chr','Avg heart rate',v('hr'),'')}
      ${part==='warm'?`${unitOf(fk)==='kg'?f('cww','Warm-up set weight ('+(lb?'lb':'kg')+')',cur_&&cur_.ww?(lb?(cur_.wwlb||toLb(cur_.ww)):cur_.ww):'','',0.5):''}${f('cwr','Warm-up set '+rlab(fk),v('wr'),'')}`:''}</div>
    <div class="mbtns"><button class="btn ghost" data-a="closesheet">Go back</button><button class="btn" data-a="cardiosave">Save</button></div>`);
}
function saveCardioSheet(){
  const {w,part}=CSH, g=id=>{const el=$(id); if(!el) return 0; const n=parseFloat(el.value); return isFinite(n)?n:0;}, gp=id=>g(id)||parseFloat($(id).placeholder)||0;
  const fk=slotKey(w,W[w].slots[0]), lb=unitOf(fk)==='kg'&&isLb(fk);
  const e={d:today(),w,part,t:Date.now(),type:$('ctype').value,min:gp('cmin'),speed:gp('cspeed'),inc:gp('cinc'),dist:g('cdist'),cal:g('ccal'),hr:g('chr'),ww:lb?toKg(g('cww')):g('cww'),wwlb:lb?g('cww'):0,wr:g('cwr')};
  if(!e.min){ $('cmin').focus(); return; }
  S.cardio=(S.cardio||[]).filter(x=>!(x.d===e.d&&x.w===w&&x.part===part)); S.cardio.push(e);
  if(!S.active) S.active={w,start:Date.now()-e.min*60000};
  closeSheet(); persist(); render();
}

/* ---------- session bar ---------- */
let sessIv=null;
function renderSession(){
  const bar=$('sess'), a=S.active; clearInterval(sessIv);
  if(!a){ bar.hidden=true; return; }
  bar.hidden=false;
  const old=Date.now()-a.start>6*3600000;
  $('sessname').textContent=W[a.w].long+(old?' · started '+new Date(a.start).toLocaleDateString('en-AU',{day:'numeric',month:'short'}):' · in progress');
  const upd=()=>{ $('sessclock').textContent=clock(Date.now()-a.start); };
  upd(); sessIv=setInterval(upd,1000);
}
$('sessgo').onclick=()=>{ const a=S.active; if(!a) return; if(a.w==='cardio'){ NAV.tab='workouts'; NAV.stack=[{v:'cardio'}]; } else { NAV.tab='workouts'; NAV.stack=[{v:'workout',w:a.w}]; } UI.open={}; render(true); };
$('sessfin').onclick=()=>{ finishWorkout(false); };

/* ---------- rest timer ---------- */
const TM={end:0,total:0,iv:null,ctx:null,name:''};
function initAudio(){ try{ TM.ctx=TM.ctx||new (window.AudioContext||window.webkitAudioContext)(); TM.ctx.resume&&TM.ctx.resume(); }catch(e){} }
function beep(n,hz){
  try{ const c=TM.ctx; if(!c) return;
    for(let i=0;i<n;i++){ const o=c.createOscillator(), g=c.createGain(); o.frequency.value=hz||880; o.connect(g); g.connect(c.destination);
      const t0=c.currentTime+i*0.35; g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(0.4,t0+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.25); o.start(t0); o.stop(t0+0.3); }
  }catch(e){}
}
const buzz=p=>{ try{navigator.vibrate&&navigator.vibrate(p)}catch(e){} };
function startRest(sec,name){ initAudio(); TM.total=sec; TM.end=Date.now()+sec*1000; TM.name=name;
  $('restname').textContent='Rest · '+name; $('rest').classList.remove('over'); $('rest').hidden=false;
  clearInterval(TM.iv); clearTimeout(TM.to); TM.iv=setInterval(restTick,250); restTick(); }
function stopRest(){ clearInterval(TM.iv); clearTimeout(TM.to); $('rest').hidden=true; $('rest').classList.remove('over'); }
function restTick(){
  const left=Math.max(0,Math.ceil((TM.end-Date.now())/1000));
  $('restclock').textContent=left?mmss(left):'Go';
  $('restbar').style.width=(100*(1-left/TM.total))+'%';
  if(left===0){ clearInterval(TM.iv); $('rest').classList.add('over'); $('restname').textContent='Rest over · next set'; beep(3); buzz([300,150,300]); TM.to=setTimeout(stopRest,8000); }
}
$('reststop').onclick=stopRest;
$('restplus').onclick=()=>{ if($('rest').classList.contains('over')){ startRest(15,TM.name); return; } TM.end+=15000; TM.total+=15; restTick(); };

/* ---------- hold timer ---------- */
const HD={iv:null,s:0,go:0,hits:{},tg:null};
function startHold(s){
  const x=slotCtx(); if(!x) return; initAudio();
  const m=x.slot.reps.match(/(\d+)–(\d+)/); Object.assign(HD,{s,go:Date.now()+3000,hits:{},tg:m?[+m[1],+m[2]]:null,ready:true});
  $('hname').textContent=nameOf(x.k)+' · set '+s; $('hold').classList.remove('hit'); $('hold').hidden=false;
  clearInterval(HD.iv); HD.iv=setInterval(holdTick,100); holdTick();
}
function holdTick(){
  const now=Date.now(), tg=HD.tg;
  if(now<HD.go){ const c=Math.ceil((HD.go-now)/1000); $('hclock').textContent=c; $('htarget').textContent='Get into position'; $('hstop').textContent='Starting'; if(!HD.hits['c'+c]){HD.hits['c'+c]=1; beep(1,600);} return; }
  if(HD.ready){ HD.ready=false; $('hstop').textContent='Stop and save'; beep(1,1100); buzz(150); }
  const sec=Math.floor((now-HD.go)/1000); $('hclock').textContent=sec;
  if(!tg){ $('htarget').textContent='Hold as long as you can with good form'; return; }
  if(sec<tg[0]) $('htarget').textContent='Aim for '+tg[0]+' to '+tg[1]+' sec';
  else if(sec<tg[1]){ $('htarget').textContent='Target reached. Keep going if your form holds.'; $('hold').classList.add('hit'); if(!HD.hits.lo){HD.hits.lo=1; beep(1); buzz(200);} }
  else { $('htarget').textContent='Top of the range. Stop when ready.'; if(!HD.hits.hi){HD.hits.hi=1; beep(2); buzz([200,100,200]);} }
}
function endHold(){ clearInterval(HD.iv); $('hold').hidden=true; }
$('hcancel').onclick=endHold;
$('hstop').onclick=()=>{ const now=Date.now(); if(now<HD.go){ endHold(); return; } const sec=Math.floor((now-HD.go)/1000); endHold(); if(sec<1) return;
  const row=document.querySelector(`.setrow[data-s="${HD.s}"]`); if(!row) return; row.querySelector('.r').value=sec; logSet(HD.s,row); };

/* ---------- cardio ---------- */
const CPLAN=Object.fromEntries(CPLANS.map(p=>[p.id,p]));
const LVL={1:{c:'var(--eq)',n:'Easy'},2:{c:'var(--accent)',n:'Moderate'},3:{c:'var(--warn)',n:'Hard'}};
const ptotal=p=>p.phases.reduce((a,x)=>a+x.s,0);
function timelineSVG(p){
  const Wd=320,H=56,tot=ptotal(p); let x=0;
  const bars=p.phases.map(ph=>{const w=Wd*ph.s/tot,h=ph.l*16; const r=`<rect x="${x.toFixed(1)}" y="${H-h}" width="${Math.max(w-1,1).toFixed(1)}" height="${h}" rx="2" fill="${LVL[ph.l].c}"/>`; x+=w; return r;}).join('');
  return `<svg viewBox="0 0 ${Wd} ${H+16}" class="tline" role="img" aria-label="Effort over ${Math.round(tot/60)} minutes">${bars}<text x="0" y="${H+13}">0</text><text x="${Wd}" y="${H+13}" text-anchor="end">${Math.round(tot/60)} min</text></svg>`;
}
let CT_PRE=null;
SCREENS.cardio=()=>{
  const d=today(), cur_=(S.cardio||[]).find(x=>x.d===d&&x.w==='cardio'&&x.part==='main'), pre=CT_PRE||{};
  const v=f=>pre[f]!=null&&pre[f]!==''?pre[f]:(cur_&&cur_[f]?cur_[f]:''), type=v('type')||'Treadmill walk';
  const lastBy=id=>(S.cardio||[]).filter(x=>x.w==='cardio'&&x.plan===id).sort((a,b)=>b.t-a.t)[0];
  const lastS=(S.sessions||[]).filter(x=>x.w==='cardio').sort((x,y)=>y.start-x.start)[0];
  const f=(id,label,val,step)=>`<div class="fld"><label for="${id}">${label}</label><input id="${id}" type="number" inputmode="decimal" min="0" step="${step||1}" value="${val}"></div>`;
  return `${topbar('Back')}
  <div><p class="eyebrow">Extra session</p><h1>Cardio</h1><p class="sub">Best on a day you are not lifting, and not the day before Legs. One or two a week is plenty.</p></div>
  ${lastS&&JUSTDONE===lastS.id?summaryHTML(lastS,'Cardio done'):''}
  <div class="card soft"><p class="eyebrow">The talk test</p><div class="lvls">${[1,2,3].map(l=>`<div class="lvl"><i style="background:${LVL[l].c}"></i><div><b>${LVL[l].n}</b><span>${['You could chat in full sentences.','Breathing harder. Short sentences only.','A word or two at most. You couldn’t keep it up for long.'][l-1]}</span></div></div>`).join('')}</div></div>
  ${CPLANS.map(p=>{const lb=lastBy(p.id); return `<div class="card"><div><h3>${p.name}</h3><p class="sub">${Math.round(ptotal(p)/60)} min · ${p.machine==='Mixed'?'bike, cross-trainer, rower':p.machine.toLowerCase()}</p></div>
    <p class="tiny">${p.blurb}</p>${timelineSVG(p)}
    <details data-acc="steps-${p.id}" ${acc('steps-'+p.id,false)}><summary>Every step</summary><ol class="phl">${p.phases.filter((x,i,a)=>!(/^(Hard|Recover)/.test(x.n))||i===a.findIndex(y=>y.n.startsWith(x.n.split(' ')[0]))).map(x=>`<li><span class="dot" style="background:${LVL[x.l].c}"></span><b>${x.n.replace(/ 1 of 8/,' (×8)')}</b> · ${x.s>=60?Math.round(x.s/60)+' min':x.s+' sec'}<br><span class="muted">${x.t}</span></li>`).join('')}</ol>
    ${p.id==='mix'?`<div class="section" style="padding-bottom:14px">${framesHTML({k:'rower',pose:'rower'})}</div>`:''}</details>
    <button class="btn small" data-a="cstart" data-p="${p.id}">Start guided ${p.name.toLowerCase()}</button>
    ${lb?`<p class="tiny">Last done ${fmtD(lb.d)}: ${lb.min} min${lb.dist?', '+lb.dist+' km':''}${lb.cal?', '+lb.cal+' cal':''}.</p>`:''}</div>`;}).join('')}
  <div class="section" id="cmainlog"><h3>Log a session</h3><p class="sub">Fills in when a guided session ends. Use it for anything else too, like a walk outside.</p>
    <div class="fgrid"><div class="fld full"><label for="mtype">Machine</label><select id="mtype">${[...CTYPES,'Mixed'].map(t=>`<option${t===type?' selected':''}>${t}</option>`).join('')}</select></div>
    ${f('mmin','Minutes',v('min'),0.5)}${f('mdist','Distance (km)',v('dist'),0.01)}${f('mcal','Calories (machine)',v('cal'))}${f('mhr','Avg heart rate',v('hr'))}
    <div class="fld full"><label>How hard did it feel?</label><div class="rpe">${[['1','Easy'],['2','Moderate'],['3','Hard']].map(([n,t])=>`<button class="chip" data-a="rpe" data-n="${n}" aria-pressed="${String(v('rpe'))===n}">${t}</button>`).join('')}</div></div></div>
    <button class="btn" data-a="cmainsave" data-plan="${pre.plan||(cur_&&cur_.plan)||''}">${cur_?'Update cardio session':'Save cardio session'}</button></div>`;
};
async function saveCardioMain(btn){
  const g=id=>{const n=parseFloat($(id).value);return isFinite(n)?n:0}, min=g('mmin'); if(!min){ $('mmin').focus(); return; }
  const rp=document.querySelector('.rpe [aria-pressed="true"]');
  const e={d:today(),w:'cardio',part:'main',t:Date.now(),type:$('mtype').value,min,dist:g('mdist'),cal:g('mcal'),hr:g('mhr'),rpe:rp?+rp.dataset.n:0,plan:btn.dataset.plan||''};
  S.cardio=(S.cardio||[]).filter(x=>!(x.d===e.d&&x.w==='cardio'&&x.part==='main')); S.cardio.push(e); CT_PRE=null;
  if(!S.active) S.active={w:'cardio',start:Date.now()-min*60000};
  persist();
  if(S.active.w==='cardio') await finishWorkout(true); else toast('Cardio added to your workout');
  render(true);
}
const CT={p:null,start:0,pausedAt:0,paused:0,iv:null,lastIdx:-1,warned:{}};
const ctElapsed=()=>((CT.pausedAt||Date.now())-CT.start-CT.paused)/1000;
const ctSave=()=>save('ct',CT.p?JSON.stringify({p:CT.p.id,start:CT.start,pausedAt:CT.pausedAt,paused:CT.paused}):'');
function startGuided(id,resume){
  initAudio(); CT.p=CPLAN[id]; Object.assign(CT,resume||{start:Date.now(),pausedAt:0,paused:0}); CT.lastIdx=-1; CT.warned={};
  if(!S.active){ S.active={w:'cardio',start:CT.start}; persist(); renderSession(); }
  $('ctname').textContent=CT.p.name; $('ctimer').hidden=false; ctSave();
  clearInterval(CT.iv); CT.iv=setInterval(ctTick,250); ctTick();
}
function ctTick(){
  const p=CT.p, el=ctElapsed(), tot=ptotal(p);
  if(el>=tot){ endGuided(true); return; }
  let acc_=0,i=0; while(i<p.phases.length&&acc_+p.phases[i].s<=el){acc_+=p.phases[i].s;i++;}
  const ph=p.phases[i], left=Math.ceil(acc_+ph.s-el), nx=p.phases[i+1];
  if(i!==CT.lastIdx){ if(CT.lastIdx>=0){ beep(1,ph.l===3?1300:1000); buzz(ph.l===3?[200,80,200]:250); } CT.lastIdx=i; }
  if(left<=3&&left>=1&&!CT.warned[i+'_'+left]&&!CT.pausedAt){ CT.warned[i+'_'+left]=1; beep(1,600); }
  $('ctimer').className='lvl'+ph.l;
  $('ctphase').textContent=ph.n; $('ctclock').textContent=mmss(left); $('cttarget').textContent=ph.t; $('ctlevel').textContent=LVL[ph.l].n;
  $('ctnext').textContent=nx?'Next: '+nx.n+' ('+(nx.s>=60?Math.round(nx.s/60)+' min':nx.s+' sec')+')':'Last step';
  $('ctleft').textContent=mmss(Math.ceil(tot-el))+' left'; $('ctpos').style.width=(100*el/tot)+'%';
  $('ctpause').textContent=CT.pausedAt?'Resume':'Pause';
}
function endGuided(done){
  clearInterval(CT.iv); const p=CT.p, min=Math.max(1,Math.round(Math.min(ctElapsed(),ptotal(p))/60));
  $('ctimer').hidden=true; CT.p=null; ctSave();
  if(done){ beep(3,1000); buzz([300,150,300]); }
  CT_PRE={type:p.machine,min,plan:p.id}; NAV.tab='workouts'; NAV.stack=[{v:'cardio'}]; render(true);
  setTimeout(()=>{ const l=$('cmainlog'); if(l) l.scrollIntoView({behavior:'smooth',block:'start'}); },60);
}
$('ctpause').onclick=()=>{ if(CT.pausedAt){ CT.paused+=Date.now()-CT.pausedAt; CT.pausedAt=0; } else CT.pausedAt=Date.now(); ctSave(); ctTick(); };
$('ctskip').onclick=()=>{ const el=ctElapsed(); let a=0; for(const ph of CT.p.phases){ a+=ph.s; if(a>el){ CT.start-=(a-el)*1000; break; } } ctSave(); ctTick(); };
$('ctend').onclick=async()=>{ $('ctimer').hidden=true; if(await ask('End the session now?','End session',true,'You can still log what you did.')) endGuided(false); else $('ctimer').hidden=false; };
document.addEventListener('visibilitychange',()=>{ if(document.hidden) return; if(CT.p) ctTick(); if(!$('rest').hidden&&!$('rest').classList.contains('over')) restTick(); });

/* ---------- events ---------- */
const ACT={
  tab:t=>setTab(t.dataset.t), back:()=>back(), go:t=>go({v:t.dataset.v}),
  openw:t=>{ const w=t.dataset.w; if(w==='cardio'){ go({v:'cardio'}); return; } if(cur().v==='workout'&&cur().w===w) return; go({v:'workout',w}); },
  start:t=>startWorkout(t.dataset.w), finish:()=>finishWorkout(false),
  cancel:async()=>{ if(!S.active) return; if(!await ask('Cancel this workout?','Cancel workout',true,'The timer is thrown away and nothing goes in your log. Sets you saved stay in your exercise history.')) return; S.active=null; S.skips={d:today(),list:[]}; stopRest(); persist(); render(); },
  openex:t=>go({v:'ex',w:t.dataset.w,i:+t.dataset.i}), info:t=>go({v:'info',k:t.dataset.k}),
  prevex:()=>{ const c=cur(); if(c.i>0){ NAV.stack[NAV.stack.length-1]={v:'ex',w:c.w,i:c.i-1}; UI.open={}; render(true); } },
  nextex:t=>{ const c=cur(); if(t.dataset.n===''){ back(); return; } NAV.stack[NAV.stack.length-1]={v:'ex',w:c.w,i:+t.dataset.n}; UI.open={}; render(true); },
  save:t=>logSet(+t.dataset.s,t.closest('.setrow')), hold:t=>startHold(+t.dataset.s),
  addset:()=>{ const x=slotCtx(); UI.extra[x.k]=Math.max(x.slot.sets,UI.extra[x.k]||0,...entries(x.k).filter(e=>e.d===today()).map(e=>e.s))+1; render(); },
  unit:t=>{ const x=slotCtx(); S.units=S.units||{}; S.units[x.k]=t.dataset.u; persist(); render(); },
  skip:()=>toggleSkip(true), unskip:()=>toggleSkip(false), swap:()=>openSwap(),
  swapmode:t=>{ UI.swapMode=t.dataset.m; t.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===t)); },
  pick:t=>pickSwap(t.dataset.k), closesheet:()=>closeSheet(),
  addcustom:()=>{ const inp=$('custname'), name=inp.value.trim(); if(!name){ inp.focus(); return; } const c={k:'c_'+Date.now().toString(36),of:SWAP.slot.k,slot:SWAP.slot.k,name}; S.custom=[...(S.custom||[]),c]; registerCustom(); pickSwap(c.k); },
  delcustom:async t=>{ const k=t.dataset.k, c=(S.custom||[]).find(x=>x.k===k); if(!c) return; $('sheet').hidden=true;
    if(await ask('Remove '+c.name+'?','Remove',true,'Sets you logged on it stay in your history.')){ S.custom=S.custom.filter(x=>x.k!==k); Object.keys(S.swaps||{}).forEach(id=>{ if(S.swaps[id].k===k) delete S.swaps[id]; }); persist(); render(); }
    $('sheet').hidden=false; $('swaplist').innerHTML=swapListHTML(); },
  cardiosheet:t=>openCardioSheet(t.dataset.w,t.dataset.part), cardiosave:()=>saveCardioSheet(),
  cstart:t=>startGuided(t.dataset.p), cmainsave:t=>saveCardioMain(t),
  rpe:t=>t.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===t)),
  libeq:t=>{ UI.libeq=t.dataset.t; t.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===t)); renderLibList(); },
  bodysave:()=>{ const d=$('bd').value||today(), kg=parseFloat($('bkg').value), waist=parseFloat($('bw').value); if(!(kg>0)&&!(waist>0)){ $('bkg').focus(); return; }
    S.body=S.body.filter(x=>x.d!==d); S.body.push({d,kg:kg>0?kg:0,waist:waist>0?waist:0}); persist(); toast('Saved'); render(); },
  delbody:async t=>{ if(await ask('Delete this measurement?','Delete',true)){ S.body=S.body.filter(x=>x.d!==t.dataset.d); persist(); render(); } },
  delsess:async t=>{ if(await ask('Delete this session from your log?','Delete',true,'Your sets stay saved.')){ S.sessions=S.sessions.filter(x=>x.id!==t.dataset.id); persist(); render(); } },
  export:async()=>{ const txt=JSON.stringify(S); try{ await navigator.clipboard.writeText(txt); toast('Copied. Paste it into Import in the other app.'); }
    catch(e){ openSheet(`<h3>Copy your data</h3><p class="sub">Select all of the text below and copy it.</p><textarea class="ta" id="exptxt" readonly></textarea><button class="btn ghost small" data-a="closesheet">Done</button>`); $('exptxt').value=txt; $('exptxt').select(); } },
  exportfile:()=>{ try{ const u=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'})), l=document.createElement('a'); l.href=u; l.download='training-backup-'+today()+'.json'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(u),5000); }catch(e){ toast('Could not save a file. Use Copy my data instead.'); } },
  importopen:()=>openSheet(`<h3>Import data</h3><p class="sub">Paste the text you copied from the other app, or choose a backup file. This replaces what is stored here.</p><textarea class="ta" id="imptxt" placeholder="Paste here" aria-label="Paste your data here"></textarea><input type="file" id="impfile" accept=".json,application/json,text/plain" aria-label="Choose a backup file"><div class="mbtns"><button class="btn ghost" data-a="closesheet">Go back</button><button class="btn" data-a="importdo">Import</button></div>`),
  importdo:async()=>{ let txt=$('imptxt').value.trim(); const f=$('impfile').files[0]; if(!txt&&f) txt=await f.text();
    let d=null; try{ d=JSON.parse(txt); }catch(e){} if(!d||!Array.isArray(d.lifts)){ toast('That doesn’t look like training data'); return; }
    $('sheet').hidden=true;
    if(!await ask('Replace the data in this app?','Import',false,d.lifts.length+' sets, '+((d.sessions||[]).length)+' sessions and '+((d.body||[]).length)+' measurements will be loaded.')){ $('sheet').hidden=false; return; }
    S=Object.assign({custom:[],swaps:{},units:{},lifts:[],body:[],seat:{},sessions:[],active:null,cardio:[],skips:null},d); if(S.active&&!W[S.active.w]) S.active=null;
    registerCustom(); closeSheet(); persist(); toast('Imported'); render(true); },
  delsets:async t=>{ if(await ask('Delete these sets?','Delete',true)){ S.lifts=S.lifts.filter(x=>!(x.k===t.dataset.k&&x.d===t.dataset.d)); persist(); render(); } }
};
document.addEventListener('click',ev=>{ const t=ev.target.closest('[data-a]'); if(!t||t.disabled) return; const f=ACT[t.dataset.a]; if(f) f(t); });
document.addEventListener('input',ev=>{ const el=ev.target;
  if(el.dataset&&el.dataset.seat){ S.seat[el.dataset.seat]=el.value; persist(); }
  else if(el.id==='libq'){ UI.libq=el.value; renderLibList(); }
  else if(el.id==='swapq'){ UI.swapQ=el.value; $('swaplist').innerHTML=swapListHTML(); }
  else if(el.classList.contains('w')){ const c=el.closest('.setrow').querySelector('.conv'); if(c) c.textContent=+el.value>0?'= '+toKg(+el.value)+' kg':''; }
});
document.addEventListener('toggle',ev=>{ const d=ev.target; if(d.dataset&&d.dataset.acc) UI.open[d.dataset.acc]=d.open; },true);
document.addEventListener('keydown',ev=>{ if(ev.key==='Enter'&&ev.target.id==='custname') ACT.addcustom(); });

/* ---------- boot ---------- */
if(S.active&&W[S.active.w]){ NAV.tab='workouts'; NAV.stack=[S.active.w==='cardio'?{v:'cardio'}:{v:'workout',w:S.active.w}]; }
else if(S.active) S.active=null;
render(true);
try{ const r=JSON.parse(load('ct')||'null'); if(r&&CPLAN[r.p]&&Date.now()-r.start<3*3600000) startGuided(r.p,{start:r.start,pausedAt:r.pausedAt,paused:r.paused}); }catch(e){}

/*SYNC-START*/
(async()=>{
  try{
    if(!window.claude||!window.claude.use) return;
    const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
    if(!db||!user) return;
    const id=await user.id(); if(!id) return;
    const ref=db.doc('data/users/'+id+'/gym');
    const snap=await ref.get();
    dbDoc=ref;
    if(snap.exists){
      const r=snap.data()||{};
      const key=x=>x.d+'|'+x.k+'|'+x.s;
      const lifts=new Map((r.lifts||[]).map(x=>[key(x),x])); S.lifts.forEach(x=>{if(!lifts.has(key(x))) lifts.set(key(x),x)});
      const bodyM=new Map((r.body||[]).map(x=>[x.d,x])); S.body.forEach(x=>{if(!bodyM.has(x.d)) bodyM.set(x.d,x)});
      const sm=new Map((r.sessions||[]).map(x=>[x.id,x])); (S.sessions||[]).forEach(x=>{if(!sm.has(x.id)) sm.set(x.id,x)});
      const ck=x=>x.d+'|'+x.w+'|'+x.part; const cm=new Map((r.cardio||[]).map(x=>[ck(x),x])); (S.cardio||[]).forEach(x=>{const o=cm.get(ck(x)); if(!o||x.t>o.t) cm.set(ck(x),x)});
      const cu=new Map((r.custom||[]).map(x=>[x.k,x])); (S.custom||[]).forEach(x=>{if(!cu.has(x.k)) cu.set(x.k,x)});
      S={custom:[...cu.values()],swaps:Object.assign({},r.swaps||{},S.swaps||{}),units:Object.assign({},r.units||{},S.units||{}),lifts:[...lifts.values()],body:[...bodyM.values()],seat:Object.assign({},S.seat,r.seat||{}),sessions:[...sm.values()],active:S.active||r.active||null,cardio:[...cm.values()],skips:S.skips||r.skips||null};
      if(S.active&&!W[S.active.w]) S.active=null;
    }
    UI.sync='Saved to your account';
    registerCustom(); persist();
    const typing=document.activeElement&&/INPUT|SELECT/.test(document.activeElement.tagName);
    if(!typing&&$('sheet').hidden) render(); else renderSession();
  }catch(e){ dbDoc=null; }
})();
/*SYNC-END*/

