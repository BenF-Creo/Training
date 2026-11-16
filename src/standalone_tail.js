/* ---------- standalone: offline, storage and screen wake ---------- */
if('serviceWorker' in navigator){ window.addEventListener('load',()=>{ navigator.serviceWorker.register('sw.js').catch(()=>{}); }); }
try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}
let wakeLock=null;
async function keepAwake(){ try{ if(S.active&&'wakeLock' in navigator&&!wakeLock){ wakeLock=await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release',()=>{wakeLock=null}); } else if(!S.active&&wakeLock){ wakeLock.release(); } }catch(e){} }
document.addEventListener('click',()=>setTimeout(keepAwake,300));
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) keepAwake(); });
keepAwake();
