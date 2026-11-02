/* 現場管理 core.js v1.0.1 (2026-11-02)
 * 共通処理：設定・ログイン（Gen-Canと共有）・GAS通信・データ保持・画面切替・部品
 * - GASはGen-Canと同じもの（config.js の GAS_URL）を使い、サーバー側の変更はしていません。
 * - ログイン情報は Gen-Can と同じ localStorage キー（genba_session / genba_user / genba_admin）を共有します。
 * - このアプリのキャッシュは "genba_kanri_" で始まるキーに保存します（Gen-Canのログアウトでも一緒に消えます）。
 */
(function(){
'use strict';

var CFG = window.GENBA_CONFIG || {};
var APP = { name:'現場管理', version:'v1.0.1', build:'gk-20261102-1-0-1', updated:'2026-11-02' };
var KP = 'genba_kanri_';
var GK = window.GK = { APP:APP, CFG:CFG, KP:KP };

/* 更新履歴（アプリ内「情報」画面に表示） */
GK.CHANGELOG = [
  { v:'v1.0.1', d:'2026-11-02', items:[
    '通信が途中で切れた時は、保存できていたかを確かめてから結果を表示（日報・現場・工程・配置・指摘・検査の二重登録を防止）',
    '保存の直後は必ず最新のデータを読み直す。保存ボタンの二度押しを防止',
    '指摘・図面の写真送信に失敗した時、画面が固まらずに入力を残したままお知らせ',
    'ログインし直しても入力中の内容が消えないように',
    'カメラの切替を素早く押した時にカメラが点いたままになる不具合、PDF図面のページを素早く切り替えた時のピンの取り違えを修正',
    '日報は現場を必須に（Gen-Canと同じ）。起動直後でも作業員・車両の一覧が後から表示されるように',
    '検査の「否」を指摘に登録する時の重複を防止。写真の拡大表示を戻るボタンで閉じるように'
  ]},
  { v:'v1.0.0', d:'2026-11-02', items:[
    '最初の版。Gen-Canのデータ（現場・工程・日報・予定・写真・メモ）をそのまま使う現場管理特化アプリとして作成。',
    '現場一覧・詳細・工程表（現場ごとの工程と全現場の工期）',
    '工事写真（小黒板カメラ・工種別フォルダ・写真台帳PDF/Excel）',
    '作業日報（Gen-Canと同じ人工計算）・人員配置（週間ボード）',
    '図面・指摘（図面にピンを立てて是正を管理）・検査（チェックリスト）',
    'GAS（サーバー）の変更は不要。'
  ]}
];

/* ===================== 小さな道具 ===================== */
var U = GK.u = {};
U.esc = function(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); };
U.pad = function(n){ return ('0'+n).slice(-2); };
U.ymd = function(d){ d=d||new Date(); return d.getFullYear()+'-'+U.pad(d.getMonth()+1)+'-'+U.pad(d.getDate()); };
U.today = function(){ return U.ymd(new Date()); };
U.d10 = function(v){ var s=String(v||'').trim().replace(/\//g,'-'); var m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); return m? m[1]+'-'+U.pad(+m[2])+'-'+U.pad(+m[3]) : ''; };
U.parse = function(s){ var t=U.d10(s); if(!t) return null; var a=t.split('-'); return new Date(+a[0],+a[1]-1,+a[2]); };
U.addDays = function(s,n){ var d=U.parse(s)||new Date(); d.setDate(d.getDate()+n); return U.ymd(d); };
U.diffDays = function(a,b){ var x=U.parse(a), y=U.parse(b); if(!x||!y) return 0; return Math.round((y-x)/86400000); };
U.DOW = '日月火水木金土';
U.md = function(s){ var d=U.parse(s); return d? (d.getMonth()+1)+'/'+d.getDate()+'('+U.DOW[d.getDay()]+')' : ''; };
U.mdS = function(s){ var d=U.parse(s); return d? (d.getMonth()+1)+'/'+d.getDate() : ''; };
U.jp = function(s){ var d=U.parse(s); return d? d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日('+U.DOW[d.getDay()]+')' : ''; };
U.hm = function(v){ var m=/(\d{1,2}):(\d{2})/.exec(String(v||'')); return m? U.pad(+m[1])+':'+m[2] : ''; };
U.toMin = function(t){ var m=/^(\d{1,2}):(\d{2})/.exec(String(t||'')); return m? (+m[1])*60+(+m[2]) : null; };
U.numv = function(v){ var n=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,'')); return isNaN(n)?0:n; };
U.round2 = function(n){ return Math.round((Number(n)||0)*100)/100; };
U.uid = function(p){ return (p||'')+Date.now().toString(36)+Math.floor(Math.random()*1679616).toString(36); };
U.stamp = function(d){ d=d||new Date(); return d.getFullYear()+U.pad(d.getMonth()+1)+U.pad(d.getDate())+'_'+U.pad(d.getHours())+U.pad(d.getMinutes())+U.pad(d.getSeconds()); };
/* Driveのファイル名に使えない文字・空白を除いて短くする（Gen-Canのファイル名規則と同じ考え方） */
U.safeName = function(s,max){ return String(s||'').replace(/[\\\/:*?"<>|\r\n\t]/g,'').replace(/[\s　]+/g,'').slice(0,max||40); };
U.normName = function(s){ return String(s||'').replace(/[\s　]+/g,''); };
/* 予定の「担当」欄（名前を ・ 、 , / 空白 で区切った文字列）を名前の配列にする（Gen-Canの人員配置と同じ規則） */
U.ownerTokens = function(str){ return String(str||'').split(/[・、,，\/\s　]+/).map(U.normName).filter(Boolean); };
U.qs = function(o){ return Object.keys(o).filter(function(k){return o[k]!==undefined&&o[k]!==null;}).map(function(k){
  var v=o[k]; if(typeof v==='object') v=JSON.stringify(v); return encodeURIComponent(k)+'='+encodeURIComponent(String(v)); }).join('&'); };
U.sleep = function(ms){ return new Promise(function(r){ setTimeout(r,ms); }); };
U.jsonParse = function(s,def){ try{ var o=JSON.parse(s); return o==null?def:o; }catch(e){ return def; } };
U.debounce = function(fn,ms){ var t; return function(){ var a=arguments,self=this; clearTimeout(t); t=setTimeout(function(){fn.apply(self,a);},ms||250); }; };
U.$ = function(sel,root){ return (root||document).querySelector(sel); };
U.$$ = function(sel,root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); };
/* 同時実行数を制限する（写真の読み込みなど） */
U.limiter = function(n){ var act=0,q=[]; function next(){ if(act>=n||!q.length) return; act++; var j=q.shift();
  Promise.resolve().then(j.fn).then(function(v){act--;j.ok(v);next();},function(e){act--;j.ng(e);next();}); }
  return function(fn){ return new Promise(function(ok,ng){ q.push({fn:fn,ok:ok,ng:ng}); next(); }); }; };

/* ===================== イベント ===================== */
var EV = {};
GK.on = function(n,fn){ (EV[n]=EV[n]||[]).push(fn); return function(){ EV[n]=(EV[n]||[]).filter(function(f){return f!==fn;}); }; };
GK.emit = function(n,d){ (EV[n]||[]).slice().forEach(function(f){ try{f(d);}catch(e){ console.error(e); } }); };

/* ===================== 画面部品 ===================== */
var toastT;
GK.toast = function(msg,opt){ opt=opt||{}; var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.toggle('err',!!opt.err); t.classList.add('show'); clearTimeout(toastT);
  toastT=setTimeout(function(){t.classList.remove('show');}, opt.ms||(opt.err?5000:2800)); };
var busyN=0, busyT;
GK.busy = function(on,txt){ var b=document.getElementById('busy');
  if(on){ busyN++; if(txt) document.getElementById('busyTxt').textContent=txt; clearTimeout(busyT); busyT=setTimeout(function(){ if(busyN>0) b.hidden=false; },150); }
  else { busyN=Math.max(0,busyN-1); if(!busyN){ clearTimeout(busyT); b.hidden=true; document.getElementById('busyTxt').textContent='処理中…'; } } };
GK.sync = function(txt){ var s=document.getElementById('tbSync'); if(!s) return; if(txt){ s.textContent=txt; s.hidden=false; } else s.hidden=true; };

/* ボトムシート（入力画面・確認画面） */
var sheets=[];
GK.sheet = function(o){
  o=o||{}; var root=document.getElementById('sheetRoot');
  var bg=document.createElement('div'); bg.className='sheet-bg';
  bg.innerHTML='<div class="sheet" role="dialog" aria-modal="true" aria-label="'+U.esc(o.title||'')+'">'+
    '<div class="sheet-h"><b>'+U.esc(o.title||'')+'</b><button type="button" class="sheet-x" aria-label="閉じる">×</button></div>'+
    '<div class="sheet-b">'+(o.html||'')+'</div>'+(o.foot?'<div class="sheet-f">'+o.foot+'</div>':'')+'</div>';
  root.appendChild(bg);
  var api={ el:bg, body:bg.querySelector('.sheet-b'), closed:false,
    close:function(v){ if(api.closed) return; api.closed=true; bg.remove(); sheets=sheets.filter(function(s){return s!==api;});
      document.removeEventListener('keydown',onKey); if(o.onClose) o.onClose(v); },
    $:function(s){ return bg.querySelector(s); }, $$:function(s){ return U.$$(s,bg); } };
  function onKey(e){ if(e.key==='Escape' && sheets[sheets.length-1]===api && !o.noEsc) api.close(); }
  document.addEventListener('keydown',onKey);
  bg.querySelector('.sheet-x').onclick=function(){ api.close(); };
  bg.addEventListener('click',function(e){ if(e.target===bg && !o.modal) api.close(); });
  sheets.push(api);
  if(o.onOpen) o.onOpen(api);
  setTimeout(function(){ var f=bg.querySelector('[autofocus]'); if(f) try{f.focus();}catch(e){} },60);
  return api;
};
GK.closeSheets = function(){ sheets.slice().forEach(function(s){ s.close(); }); };
GK.confirm = function(msg,opt){ opt=opt||{};
  return new Promise(function(res){ var done=false;
    var s=GK.sheet({ title:opt.title||'確認', html:'<div style="white-space:pre-wrap;font-size:15px">'+U.esc(msg)+'</div>',
      foot:'<button type="button" class="btn" data-n>'+U.esc(opt.cancel||'やめる')+'</button><button type="button" class="btn '+(opt.danger?'danger':'primary')+'" data-y>'+U.esc(opt.ok||'OK')+'</button>',
      onClose:function(){ if(!done){done=true;res(false);} } });
    s.$('[data-n]').onclick=function(){ done=true; s.close(); res(false); };
    s.$('[data-y]').onclick=function(){ done=true; s.close(); res(true); };
  }); };

/* 画像の拡大表示 */
var viewers=[];
GK.closeViewers = function(){ viewers.slice().forEach(function(c){ c(); }); };
GK.viewer = function(o){
  var v=document.createElement('div'); v.className='viewer';
  v.innerHTML='<div class="vh"><b>'+U.esc(o.title||'')+'</b><button class="x" type="button" aria-label="閉じる">×</button></div><div class="vb"><div class="spin"></div></div><div class="vf"></div>';
  document.body.appendChild(v);
  var close=function(){ if(!v.parentNode) return; v.remove(); viewers=viewers.filter(function(c){ return c!==close; }); document.removeEventListener('keydown',k); if(o.onClose) o.onClose(); };
  viewers.push(close);
  var k=function(e){ if(e.key==='Escape') close(); };
  document.addEventListener('keydown',k);
  v.querySelector('.x').onclick=close;
  var vb=v.querySelector('.vb');
  Promise.resolve(typeof o.src==='function'?o.src():o.src).then(function(src){
    vb.innerHTML=''; var img=new Image(); img.alt=o.title||''; img.src=src; vb.appendChild(img);
  }).catch(function(e){ vb.innerHTML='<div style="color:#fff">画像を表示できませんでした：'+U.esc(e.message||e)+'</div>'; });
  var vf=v.querySelector('.vf');
  (o.actions||[]).forEach(function(a){ var b=document.createElement(a.href?'a':'button'); b.className='btn '+(a.cls||''); b.textContent=a.label;
    if(a.href){ b.href=a.href; b.target='_blank'; b.rel='noopener'; } else { b.type='button'; b.onclick=function(){ a.onClick(close); }; } vf.appendChild(b); });
  if(!vf.children.length) vf.remove();
  return { close:close };
};

/* ===================== ログイン情報（Gen-Canと共有） ===================== */
var S = GK.session = { role:'' };
S.sess = function(){ return U.jsonParse(localStorage.getItem('genba_session')||'null',null); };
S.user = function(){ return U.jsonParse(localStorage.getItem('genba_user')||'null',null); };
S.sessionTok = function(){ var s=S.sess(); if(s&&s.token&&(!s.expiresAt||Date.now()<Number(s.expiresAt))) return s.token; return ''; };
S.adminTok = function(){ try{ return localStorage.getItem('genba_admin')||''; }catch(e){ return ''; } };
S.token = function(){ return S.adminTok()||S.sessionTok(); };
S.save = function(res){ try{
  if(res&&res.token) localStorage.setItem('genba_session',JSON.stringify({token:res.token,role:res.role||'general',expiresAt:res.expiresAt||0}));
  if(res&&res.worker) localStorage.setItem('genba_user',JSON.stringify(res.worker));
}catch(e){} };
S.roleNow = function(){
  if(S.role) return S.role;
  var u=S.user(); if(u&&u.appRole) return u.appRole;
  var s=S.sess(); return (s&&s.role)||'staff';
};
S.me = function(){ var u=S.user()||{}; return { id:String(u['作業員ID']||''), name:String(u['氏名']||''), user:u }; };
/* ログアウト：Gen-Canのログアウトと同じ範囲を消す（共有端末対策） */
S.logout = function(){
  try{ GK.api.get('logout',{},{retry:0,timeout:6000}).catch(function(){}); }catch(e){}
  try{
    localStorage.removeItem('genba_session'); localStorage.removeItem('genba_admin'); localStorage.removeItem('genba_user');
    var rm=[]; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(/^(genba_|tb_|gencan_)/.test(k)&&k!=='genba_reminders') rm.push(k); }
    rm.forEach(function(k){ localStorage.removeItem(k); }); sessionStorage.clear();
  }catch(e){}
  try{ GK.idb.clear(); }catch(e){}
  setTimeout(function(){ location.replace(location.pathname); },300);
};

/* 権限（GAS側の制限に合わせて画面のボタンを出し分ける） */
var CAN = GK.can = {};
CAN.role = function(){ var r=String(S.roleNow()||'').toLowerCase(); return r==='general'?'staff':r; };
CAN.admin = function(){ return CAN.role()==='admin'; };
CAN.manage = function(){ var r=CAN.role(); return r==='admin'||r==='manager'; };
CAN.write = function(){ var r=CAN.role(); return r!=='viewer'&&r!=='disabled'; };
CAN.reports = function(){ return CAN.write(); };
CAN.board = function(){ var r=CAN.role(); return r==='admin'||r==='manager'||r==='staff'; };
GK.roleLabel = function(r){ return {admin:'管理者',manager:'現場責任者',staff:'社員',field:'現場作業員',viewer:'閲覧のみ',disabled:'停止'}[r]||'社員'; };

/* ===================== GAS通信 ===================== */
var GAS = String(CFG.GAS_URL||'');
var API = GK.api = {};
function jsonp(params,timeout){
  return new Promise(function(resolve,reject){
    if(!/^https:\/\//.test(GAS)){ reject(new Error('通信先（config.js の GAS_URL）が設定されていません')); return; }
    var cb='gk_'+Date.now().toString(36)+'_'+Math.floor(Math.random()*1e7);
    var q=Object.assign({},params,{callback:cb,_build:APP.build,_ts:Date.now()});
    var s=document.createElement('script'), done=false;
    var t=setTimeout(function(){ fin(netErr('タイムアウトしました（電波の良い場所でもう一度お試しください）')); }, timeout||25000);
    function fin(err,res){ if(done) return; done=true; clearTimeout(t);
      window[cb]=function(){ try{ delete window[cb]; }catch(e){} };   /* 遅れて届いた応答でエラーにならないように */
      if(s.parentNode) s.parentNode.removeChild(s);
      if(err) reject(err); else resolve(res||{}); }
    window[cb]=function(res){ fin(null,res); };
    s.async=true; s.charset='utf-8';
    s.onerror=function(){ fin(netErr('通信エラー（電波・ネット接続を確認してください）')); };
    s.src=GAS+(GAS.indexOf('?')>=0?'&':'?')+U.qs(q);
    document.head.appendChild(s);
  });
}
/* 通信が途中で切れた等のエラー（サーバーに届いたかどうか分からない）には net 印を付ける */
function netErr(msg){ var e=new Error(msg); e.net=true; return e; }
/* 書き込みが通信エラーになった時、実は保存できていないかを読み直して確かめる（二重登録防止）
 * reload：最新データを読み直す関数／found：保存済みならtrue。保存できていれば成功扱い、だめなら元のエラー */
GK.verifySaved = function(err,reload,found){
  if(!err||!err.net) return Promise.reject(err);
  return Promise.resolve().then(reload).then(function(){ if(found()) return true; throw err; },function(){ throw err; });
};
/* ボタンの二度押し防止：押した瞬間に無効化し、失敗した時だけ戻す */
GK.lockBtn = function(btn){ if(!btn||btn.disabled) return false; btn.disabled=true; return true; };
API.urlLength = function(action,params){ return (GAS+'?'+U.qs(Object.assign({action:action,secret:S.token(),callback:'gk_xxxxxxxx_xxxxxxx',_build:APP.build,_ts:Date.now()},params||{}))).length; };
function isAuthErr(res){ return res&&res.ok===false&&/認証/.test(String(res.error||'')); }
/* 読み取り（失敗時は自動でもう1回） */
API.get = function(action,params,opt){
  opt=opt||{}; var retry=(opt.retry==null)?1:opt.retry, authRetried=false;
  function attempt(n){
    var sent=S.token();
    return jsonp(Object.assign({action:action,secret:sent},params||{}),opt.timeout).then(function(res){
      if(isAuthErr(res)&&!authRetried){
        /* 管理者用トークン（genba_admin）が無効なら外して、通常のログインで再試行（Gen-Canと同じ扱い）。
           同時に出した別の通信が先に外していた場合や、その間にログインし直した場合も、新しいトークンで1回だけ送り直す */
        if(sent&&sent===S.adminTok()){ try{ localStorage.removeItem('genba_admin'); }catch(e){} }
        if(S.token()&&S.token()!==sent){ authRetried=true; return attempt(n); }
      }
      if(isAuthErr(res)&&!opt.noAuthRedirect) GK.authFail();
      return res;
    },function(err){ if(n>0) return U.sleep(800).then(function(){ return attempt(n-1); }); throw err; });
  }
  return attempt(retry);
};
/* 結果がok以外ならエラーにする */
API.call = function(action,params,opt){
  return API.get(action,params,opt).then(function(res){
    if(!res||res.ok!==true) throw new Error((res&&res.error)||'エラーが発生しました'); return res; });
};
/* POST（応答を読める形。Gen-Canの書類アップロードと同じ方式） */
API.post = function(action,params,opt){
  opt=opt||{};
  if(!/^https:\/\//.test(GAS)) return Promise.reject(new Error('通信先（config.js の GAS_URL）が設定されていません'));
  var ctl=('AbortController' in window)?new AbortController():null;
  var t=setTimeout(function(){ if(ctl) ctl.abort(); }, opt.timeout||60000);
  var body=Object.assign({action:action,secret:S.token(),_build:APP.build,_ts:Date.now()},params||{});
  return fetch(GAS,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),signal:ctl?ctl.signal:undefined})
    .then(function(r){ return r.json(); })
    .then(function(res){ clearTimeout(t); if(isAuthErr(res)) GK.authFail(); if(!res||res.ok!==true) throw new Error((res&&res.error)||'エラーが発生しました'); return res; },
      function(err){ clearTimeout(t); throw netErr(err&&err.name==='AbortError'?'タイムアウトしました':'通信エラー（電波・ネット接続を確認してください）'); });
};
/* 書き込み：短ければJSONP（Gen-Canと同じ）、長ければPOST。書き込みは自動再送しない（二重登録防止）。
   GASの処理待ちで遅くなることがあるので、待ち時間は読み取りより長い45秒 */
API.write = function(action,params,opt){
  opt=Object.assign({retry:0,timeout:45000},opt||{});
  if(API.urlLength(action,params)<=6500) return API.call(action,params,opt);
  var p={}; Object.keys(params||{}).forEach(function(k){ p[k]=params[k]; });
  return API.post(action,p,opt);
};
API.postNoCors = function(obj){
  obj=Object.assign({secret:S.token(),_build:APP.build,_ts:Date.now()},obj);
  return fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(obj)});
};

/* ===================== 画像・ファイルの道具 ===================== */
var IMG = GK.img = {};
IMG.fromFile = function(file){
  if(window.createImageBitmap){
    return createImageBitmap(file,{imageOrientation:'from-image'}).catch(function(){ return IMG.fromUrl(URL.createObjectURL(file)); });
  }
  return IMG.fromUrl(URL.createObjectURL(file));
};
IMG.fromUrl = function(url){ return new Promise(function(ok,ng){ var i=new Image(); i.onload=function(){ok(i);}; i.onerror=function(){ng(new Error('画像を読み込めませんでした'));}; i.src=url; }); };
IMG.size = function(src){ return { w:src.videoWidth||src.naturalWidth||src.width, h:src.videoHeight||src.naturalHeight||src.height }; };
/* 長辺maxPxに縮小したcanvasを返す（cropは {x,y,w,h}） */
IMG.toCanvas = function(src,maxPx,crop){
  var sz=IMG.size(src); crop=crop||{x:0,y:0,w:sz.w,h:sz.h};
  var k=Math.min(1,(maxPx||1920)/Math.max(crop.w,crop.h));
  var c=document.createElement('canvas'); c.width=Math.round(crop.w*k); c.height=Math.round(crop.h*k);
  var g=c.getContext('2d'); g.imageSmoothingQuality='high'; g.drawImage(src,crop.x,crop.y,crop.w,crop.h,0,0,c.width,c.height); return c;
};
IMG.blob = function(canvas,type,q){ return new Promise(function(ok,ng){ canvas.toBlob(function(b){ b?ok(b):ng(new Error('画像を作れませんでした')); },type||'image/jpeg',q||0.85); }); };
IMG.b64 = function(blob){ return new Promise(function(ok,ng){ var r=new FileReader(); r.onload=function(){ ok(String(r.result).split(',')[1]||''); }; r.onerror=function(){ ng(new Error('ファイルを読めませんでした')); }; r.readAsDataURL(blob); }); };
IMG.fromB64 = function(b64,mime){ var bin=atob(b64), n=bin.length, a=new Uint8Array(n); for(var i=0;i<n;i++) a[i]=bin.charCodeAt(i); return new Blob([a],{type:mime||'application/octet-stream'}); };
GK.thumb = function(id,w){ return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w'+(w||400); };
GK.driveView = function(id){ return 'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view'; };

/* 端末内の一時保存（図面など何度も見るファイル）。IndexedDB。消えても再取得するだけ */
var IDB = GK.idb = {};
var idbP=null;
function idbOpen(){ if(idbP) return idbP; idbP=new Promise(function(ok,ng){ try{ var r=indexedDB.open('genba_kanri',1);
  r.onupgradeneeded=function(){ r.result.createObjectStore('files',{keyPath:'k'}); }; r.onsuccess=function(){ ok(r.result); }; r.onerror=function(){ ng(r.error); }; }catch(e){ ng(e); } }); return idbP; }
IDB.get = function(k){ return idbOpen().then(function(db){ return new Promise(function(ok){ try{ var q=db.transaction('files').objectStore('files').get(k); q.onsuccess=function(){ ok(q.result?q.result.v:null); }; q.onerror=function(){ ok(null); }; }catch(e){ ok(null); } }); }).catch(function(){ return null; }); };
IDB.set = function(k,v){ return idbOpen().then(function(db){ return new Promise(function(ok){ try{
  var tx=db.transaction('files','readwrite'), st=tx.objectStore('files'); st.put({k:k,v:v,t:Date.now()});
  var all=st.getAll(); all.onsuccess=function(){ var rows=all.result||[]; if(rows.length>40){ rows.sort(function(a,b){return a.t-b.t;}).slice(0,rows.length-40).forEach(function(r){ st.delete(r.k); }); } };
  tx.oncomplete=function(){ ok(true); }; tx.onerror=function(){ ok(false); }; }catch(e){ ok(false); } }); }).catch(function(){ return false; }); };
IDB.clear = function(){ return idbOpen().then(function(db){ try{ db.transaction('files','readwrite').objectStore('files').clear(); }catch(e){} }).catch(function(){}); };

/* Driveのファイル本体を取得（GASの getPhotoB64。誰でも使える読み取り） */
var fileLim=U.limiter(3);
GK.fileBlob = function(fileId,opt){ opt=opt||{};
  var key='f_'+fileId;
  return (opt.noCache?Promise.resolve(null):IDB.get(key)).then(function(hit){
    if(hit) return hit;
    return fileLim(function(){ return API.call('getPhotoB64',{fileId:fileId},{timeout:opt.timeout||60000}); }).then(function(res){
      var b=IMG.fromB64(res.b64||'',res.mime||'application/octet-stream'); if(opt.cache!==false) IDB.set(key,b); return b; });
  });
};
/* サムネイルが出ない時（共有設定のないファイル）だけGAS経由で取り直す */
var thumbFail={};
document.addEventListener('error',function(e){
  var img=e.target; if(!img||img.tagName!=='IMG'||!img.dataset||!img.dataset.fid||img.dataset.fb) return;
  img.dataset.fb='1'; var fid=img.dataset.fid;
  if(thumbFail[fid]){ img.dispatchEvent(new CustomEvent('gk-thumb-ng')); return; }
  GK.fileBlob(fid).then(function(b){ if(!/^image\//.test(b.type)) throw new Error('not image'); img.src=URL.createObjectURL(b); })
    .catch(function(){ thumbFail[fid]=1; img.dispatchEvent(new CustomEvent('gk-thumb-ng')); });
},true);

/* ===================== 写真・ファイルの送信（Gen-Canと同じ方式） =====================
 * uploadPhoto を no-cors POST で送り、confirmUpload でDriveに保存されたか確認してからファイルIDを受け取る。
 * 送信中はバッジを表示し、画面を閉じようとしたら警告する（送信中に閉じると届かないため）。 */
var UP = GK.uploader = { jobs:[], active:0, max:2 };
UP.add = function(job){
  return new Promise(function(ok,ng){ job.ok=ok; job.ng=ng; job.state='wait'; job.tries=0; UP.jobs.push(job); UP.render(); UP.pump(); });
};
UP.pending = function(){ return UP.jobs.filter(function(j){ return j.state==='wait'||j.state==='run'; }).length; };
UP.failed = function(){ return UP.jobs.filter(function(j){ return j.state==='fail'; }); };
UP.pump = function(){
  while(UP.active<UP.max){ var j=UP.jobs.filter(function(x){return x.state==='wait';})[0]; if(!j) break; UP.run(j); }
};
UP.confirm = function(j,polls){
  var n=0, delays=[1000,1200,1500,1800,2000,2500,3000,3000,3500,4000,4000,5000];
  polls=polls||delays.length;
  function poll(){
    return U.sleep(delays[Math.min(n,delays.length-1)]).then(function(){
      return API.get('confirmUpload',{id:j.pid,dest:j.dest,name:j.name},{retry:1,timeout:30000}); })
      .then(function(res){ if(res&&res.ok&&res.found) return res.file||{name:j.name};
        n++; if(n<polls) return poll(); throw new Error('保存を確認できませんでした'); },
      function(err){ n++; if(n<polls) return poll(); throw err; });
  }
  return poll();
};
UP.run = function(j){
  j.state='run'; j.tries++; UP.active++; UP.render();
  var p=(j.b64?Promise.resolve(j.b64):IMG.b64(j.blob)).then(function(b64){
    j.b64=b64;
    var o={action:'uploadPhoto',id:j.pid,dest:j.dest||'photo',name:j.name,mime:j.mime||'image/jpeg',data:b64};
    if(j.kind) o.kind=j.kind;
    return API.postNoCors(o);
  }).then(function(){ return UP.confirm(j); });
  p.then(function(file){
    j.state='done'; UP.active--; j.b64=null; j.blob=null; UP.jobs=UP.jobs.filter(function(x){return x!==j;});
    UP.render(); j.ok(file); GK.emit('uploaded',{job:j,file:file}); UP.pump();
  },function(err){
    UP.active--;
    if(j.tries<2){ j.state='wait'; UP.render(); UP.retryCheck(j).then(function(file){ if(file){ j.state='done'; UP.jobs=UP.jobs.filter(function(x){return x!==j;}); UP.render(); j.ok(file); GK.emit('uploaded',{job:j,file:file}); } UP.pump(); }); return; }
    /* failFast：指摘・図面の登録など、画面で完了を待っている送信は、ここで失敗を返す（画面が固まらないように。入力は画面に残る） */
    if(j.failFast){ UP.jobs=UP.jobs.filter(function(x){return x!==j;}); j.b64=null; j.blob=null; UP.render(); j.ng(err); UP.pump(); return; }
    j.state='fail'; j.err=err; UP.render(); GK.toast('写真・ファイルの送信に失敗しました：'+(j.label||j.name),{err:true}); UP.pump();
  });
};
/* 再送の前に、実は届いていないかもう一度だけ確認する（二重保存防止） */
UP.retryCheck = function(j){
  j.state='run'; UP.active++;
  return API.get('confirmUpload',{id:j.pid,dest:j.dest,name:j.name},{retry:1,timeout:30000}).then(function(res){
    UP.active--; if(res&&res.ok&&res.found) return res.file||{name:j.name}; j.state='wait'; return null; },
    function(){ UP.active--; j.state='wait'; return null; });
};
UP.retryFailed = function(){ UP.failed().forEach(function(j){ j.state='wait'; j.tries=0; }); UP.render(); UP.pump(); };
UP.dropFailed = function(){ UP.failed().forEach(function(j){ UP.jobs=UP.jobs.filter(function(x){return x!==j;}); j.ng(j.err||new Error('送信を取り消しました')); }); UP.render(); };
UP.render = function(){
  var el=document.getElementById('upq');
  var pend=UP.pending(), fail=UP.failed().length;
  if(!pend&&!fail){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement('button'); el.id='upq'; el.type='button'; el.className='upq'; document.body.appendChild(el);
    el.onclick=function(){ if(UP.failed().length){ GK.confirm('送信できなかった写真・ファイルが '+UP.failed().length+' 件あります。\nもう一度送りますか？',{ok:'もう一度送る',cancel:'取り消す'}).then(function(y){ y?UP.retryFailed():UP.dropFailed(); }); }
      else GK.toast('写真・ファイルを送信しています。完了するまでアプリを閉じないでください'); }; }
  el.classList.toggle('err',!!fail&&!pend);
  el.innerHTML=pend?'<span class="dot"></span>送信中 '+pend+'件'+(fail?'・失敗 '+fail+'件':''):'⚠ 送信失敗 '+fail+'件（タップ）';
};
window.addEventListener('beforeunload',function(e){ if(UP.pending()||UP.failed().length){ e.preventDefault(); e.returnValue=''; return ''; } });

/* ===================== データ（Gen-Canと同じシート） ===================== */
var D = GK.data = { projects:[], workers:[], reports:[], vehicles:[], customers:[], contacts:[], schedules:[],
  reportMaterials:[], products:[], features:{}, t:{rd:0,cal:0} };
var C = GK.cache = {};
C.get = function(k){ try{ return U.jsonParse(localStorage.getItem(KP+k)||'null',null); }catch(e){ return null; } };
C.set = function(k,v){ try{ localStorage.setItem(KP+k,JSON.stringify(v)); return true; }catch(e){ return false; } };
C.del = function(k){ try{ localStorage.removeItem(KP+k); }catch(e){} };

D.restore = function(){
  var rd=C.get('rd'); if(rd){ ['projects','workers','reports','vehicles','customers','contacts','reportMaterials','products'].forEach(function(k){ if(rd[k]) D[k]=rd[k]; }); D.features=rd.features||{}; }
  var cal=C.get('cal'); if(cal&&cal.schedules) D.schedules=cal.schedules;
};
var rdP=null, calP=null;
/* 読み込み中の要求があればそれを使う。fresh＝保存の直後など「保存後のデータ」が必要な時は、
   読み込み中の要求が終わるのを待ってから、改めて読み直す（古いデータで「保存できていない」と誤判定しないため） */
function chainLoad(cur,fresh,fn,set){
  if(cur&&!fresh) return cur;
  var p=(cur?cur.then(function(){},function(){}):Promise.resolve()).then(fn);
  set(p);
  var clear=function(){ set(null,p); GK.sync(''); };
  p.then(clear,clear);
  return p;
}
/* reportData：現場・作業員・日報・車両・（v158）材料 を一度に取得（Gen-Canの日報画面と同じ） */
D.loadRD = function(fresh){
  return chainLoad(rdP,fresh,loadRD_,function(p,old){ if(old){ if(rdP===old) rdP=null; } else rdP=p; });
};
function loadRD_(){
  GK.sync('更新中…');
  return API.call('reportData',{},{timeout:40000}).then(function(res){
    ['projects','workers','reports','vehicles','customers','contacts'].forEach(function(k){ if(res[k]) D[k]=res[k]; });
    D.reportMaterials=res.reportMaterials||[]; D.products=res.products||[]; D.features=res.features||{};
    D.t.rd=Date.now();
    var pack={projects:D.projects,workers:D.workers,reports:D.reports,vehicles:D.vehicles,customers:D.customers,contacts:D.contacts,reportMaterials:D.reportMaterials,products:D.products,features:D.features};
    if(!C.set('rd',pack)){ pack.reports=[]; pack.reportMaterials=[]; C.set('rd',pack); }   /* 容量不足なら日報以外だけ保存 */
    GK.emit('data','rd'); return D;
  });
}
/* calendarData：予定（スケジュール）を含む */
D.loadCal = function(fresh){
  return chainLoad(calP,fresh,loadCal_,function(p,old){ if(old){ if(calP===old) calP=null; } else calP=p; });
};
function loadCal_(){
  GK.sync('更新中…');
  return API.call('calendarData',{},{timeout:40000}).then(function(res){
    D.schedules=res.schedules||[]; ['projects','workers','customers','vehicles','contacts'].forEach(function(k){ if(res[k]) D[k]=res[k]; });
    D.t.cal=Date.now(); C.set('cal',{schedules:D.schedules}); GK.emit('data','cal'); return D;
  });
}
D.fresh = function(kind,maxAge){ return Date.now()-(D.t[kind]||0) < (maxAge||60000); };
D.ensure = function(kind,maxAge){ if(D.fresh(kind,maxAge)) return Promise.resolve(D); return kind==='cal'?D.loadCal():D.loadRD(); };
D.project = function(id){ id=String(id||''); for(var i=0;i<D.projects.length;i++) if(String(D.projects[i]['案件ID'])===id) return D.projects[i]; return null; };
D.worker = function(id){ id=String(id||''); for(var i=0;i<D.workers.length;i++) if(String(D.workers[i]['作業員ID'])===id) return D.workers[i]; return null; };
D.pname = function(p){ if(!p) return ''; return String(p['略称']||p['案件名']||p['現場名']||''); };
D.status = function(p){ var s=String((p&&p['ステータス'])||'').trim(); return s==='進行中'?'施工中':s; };
D.STATUSES = ['見積中','受注','段取済','施工中','完了','請求済'];
D.ACTIVE = {'受注':1,'段取済':1,'施工中':1};
D.activeProjects = function(){
  return D.projects.filter(function(p){ return D.ACTIVE[D.status(p)]; }).sort(function(a,b){
    var o={'施工中':0,'段取済':1,'受注':2}; var x=o[D.status(a)]-o[D.status(b)]; if(x) return x;
    return String(U.d10(a['工期開始'])||'9').localeCompare(String(U.d10(b['工期開始'])||'9')); });
};
D.wname = function(w){ return String((w&&(w['略称']||w['氏名']))||''); };
D.isPartner = function(w){ return String((w&&w['区分'])||'').indexOf('協力')>=0; };
D.meWorker = function(){ var me=S.me(); return D.worker(me.id)||me.user||null; };
/* 予定の担当欄に自分が入っているか（略称・氏名のどちらでも一致） */
D.isMine = function(sch,w){ w=w||D.meWorker(); if(!w) return false;
  var names={}; [w['略称'],w['氏名']].forEach(function(n){ n=U.normName(n); if(n) names[n]=1; });
  return U.ownerTokens(sch['担当']).some(function(t){ return names[t]; }); };
D.schedCovers = function(s,day){ var a=U.d10(s['日付']); if(!a) return false; var b=U.d10(s['終了日'])||a; return a<=day&&day<=b; };
D.statusCls = function(st){ return {'見積中':'gray','受注':'violet','段取済':'cyan','施工中':'blue','完了':'green','請求済':'gray'}[st]||'gray'; };

/* ===================== 現場を選ぶ（共通の選択画面） ===================== */
GK.pickProject = function(opt){ opt=opt||{};
  return new Promise(function(resolve){
    var picked=false;
    var s=GK.sheet({ title:opt.title||'現場を選ぶ', html:'<div class="search"><span aria-hidden="true">🔍</span><input type="search" placeholder="現場名・顧客・場所で探す" data-q autofocus></div><div class="chips scroll" data-f style="margin-bottom:8px"></div><div data-l></div>',
      onClose:function(){ if(!picked) resolve(null); } });
    var filt='active';
    var f=s.$('[data-f]');
    f.innerHTML='<button type="button" class="chip on" data-v="active">進行中</button><button type="button" class="chip" data-v="all">すべて</button>';
    f.onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; filt=b.dataset.v; U.$$('.chip',f).forEach(function(c){c.classList.toggle('on',c===b);}); draw(); };
    function draw(){
      var q=U.normName(s.$('[data-q]').value).toLowerCase();
      var arr=(filt==='active'?D.activeProjects():D.projects.slice().reverse()).filter(function(p){
        if(!q) return true; return U.normName([p['案件名'],p['略称'],p['顧客'],p['場所']].join(' ')).toLowerCase().indexOf(q)>=0; });
      var l=s.$('[data-l]');
      if(!arr.length){ l.innerHTML='<div class="empty">'+(D.projects.length?'該当する現場がありません':'現場を読み込み中です…')+'</div>'; return; }
      l.innerHTML='<div class="list">'+arr.slice(0,200).map(function(p){ var st=D.status(p);
        return '<button type="button" class="item" data-id="'+U.esc(p['案件ID'])+'"><div class="grow"><div class="t ellipsis">'+U.esc(D.pname(p))+'</div><div class="s ellipsis">'+U.esc([p['顧客'],p['場所']].filter(Boolean).join('・'))+'</div></div><span class="badge '+D.statusCls(st)+'">'+U.esc(st||'—')+'</span></button>'; }).join('')+'</div>';
    }
    s.$('[data-q]').oninput=U.debounce(draw,150);
    s.$('[data-l]').onclick=function(e){ var b=e.target.closest('[data-id]'); if(!b) return; picked=true; var p=D.project(b.dataset.id); s.close(); resolve(p); };
    draw();
    if(!D.projects.length) D.loadRD().then(draw).catch(function(){});
  });
};

/* ===================== 画面切替（ルーター） ===================== */
var routes=[], cur=null, navStack=[];
GK.route = function(pattern,o){
  var keys=[]; var re=new RegExp('^'+pattern.replace(/:([a-zA-Z]+)/g,function(_,k){ keys.push(k); return '([^/]+)'; })+'$');
  routes.push({re:re,keys:keys,o:o});
};
var replacing=false;
GK.go = function(path,replace){ var h='#'+path; if(location.hash===h){ render(true); return; } if(replace){ replacing=true; location.replace(h); } else location.hash=h; };
GK.parseHash = function(){ var h=decodeURIComponent(location.hash.replace(/^#/,''))||'/today'; var i=h.indexOf('?');
  var path=i>=0?h.slice(0,i):h, q=new URLSearchParams(i>=0?h.slice(i+1):''); return {path:path,q:q,raw:h}; };
GK.setTitle = function(t){ document.getElementById('tbTitle').textContent=t||APP.name; document.title=(t&&t!==APP.name)?t+'｜'+APP.name:APP.name; };
GK.setActions = function(html,bind){ var r=document.getElementById('tbRight'); r.innerHTML=html||''; if(bind) bind(r); };
GK.refresh = function(){ render(true); };
function render(isRefresh){
  var h=GK.parseHash();
  var m=null, r=null;
  for(var i=0;i<routes.length;i++){ m=routes[i].re.exec(h.path); if(m){ r=routes[i]; break; } }
  if(!r){ GK.go('/today',true); return; }
  var params={}; r.keys.forEach(function(k,i){ params[k]=decodeURIComponent(m[i+1]); });
  if(cur&&cur.cleanup){ try{ cur.cleanup(); }catch(e){ console.error(e); } }
  GK.closeSheets(); GK.closeViewers();
  var o=r.o, old=document.getElementById('view');
  /* 画面ごとに入れ物を作り直す（前の画面で付けたクリック処理などが残らないように） */
  var view=old.cloneNode(false); old.parentNode.replaceChild(view,old);
  document.body.classList.toggle('no-tab',!!o.noTab);
  view.classList.toggle('full',!!o.full);
  U.$$('#tabbar a').forEach(function(a){ a.classList.toggle('on',a.dataset.tab===o.tab); });
  GK.setTitle(typeof o.title==='function'?o.title(params,h.q):o.title);
  GK.setActions('');
  var back=document.getElementById('tbBack');
  var parent=typeof o.back==='function'?o.back(params,h.q):o.back;
  back.hidden=!parent;
  back.onclick=function(){ if(navStack.length>1) history.back(); else GK.go(parent,true); };
  /* 文字サイズの拡大（zoom）は図面の操作と相性が悪いので、図面画面だけ標準に戻す */
  applyFontScale(o.noZoom);
  view.innerHTML='';
  if(!isRefresh) window.scrollTo(0,0);
  cur={ key:h.raw, cleanup:null };
  try{
    var ret=o.render(view,params,h.q);
    if(typeof ret==='function') cur.cleanup=ret;
  }catch(e){ console.error(e); view.innerHTML='<div class="card">画面の表示でエラーが発生しました：'+U.esc(e.message)+'</div>'; }
}
window.addEventListener('hashchange',function(){
  var h=location.hash;
  /* アプリ内の移動履歴（戻るボタン用）。置き換えた移動は履歴を増やさない（ブラウザの履歴と合わせる） */
  if(replacing){ replacing=false; if(navStack.length) navStack[navStack.length-1]=h; else navStack.push(h); }
  else if(navStack.length>1&&navStack[navStack.length-2]===h) navStack.pop(); else navStack.push(h);
  if(navStack.length>50) navStack=navStack.slice(-50);
  render();
});

/* ===================== 文字サイズ（Gen-Canと同じ設定を共有） ===================== */
function applyFontScale(off){ try{ var v=localStorage.getItem('gc_pref_fontscale')||'1'; document.documentElement.style.zoom=(!off&&v&&v!=='1')?v:''; }catch(e){} }
GK.setFontScale = function(v){ try{ localStorage.setItem('gc_pref_fontscale',String(v||'1')); }catch(e){} applyFontScale(false); };

/* ===================== ログイン画面 ===================== */
var authShown=false;
GK.authFail = function(){
  if(authShown) return; authShown=true;
  /* 入力中のシートは閉じずに隠すだけ（同じ人がログインし直したら元に戻す） */
  document.getElementById('sheetRoot').hidden=true;
  showLogin('ログインの有効期限が切れました。もう一度ログインしてください。');
};
function showLogin(msg){
  document.getElementById('app').hidden=true;
  var lg=document.getElementById('login'); lg.hidden=false;
  document.getElementById('lgErr').textContent=msg||'';
  var u=S.user(); if(u&&u['ログインID']) document.getElementById('lgId').value=u['ログインID'];
}
function bindLogin(){
  document.getElementById('lgVer').textContent=APP.name+' '+APP.version;
  document.getElementById('loginForm').addEventListener('submit',function(e){
    e.preventDefault();
    var id=document.getElementById('lgId').value.trim(), pw=document.getElementById('lgPw').value, err=document.getElementById('lgErr'), btn=document.getElementById('lgBtn');
    if(!id){ err.textContent='ログインIDを入力してください'; return; }
    err.textContent=''; btn.disabled=true; btn.textContent='確認中…';
    var tries=0;
    (function attempt(){
      tries++;
      jsonp({action:'login',id:id,pw:pw},25000).then(function(res){
        btn.disabled=false; btn.textContent='ログイン';
        if(res&&res.ok&&res.worker&&res.token){
          try{ localStorage.removeItem('genba_admin'); }catch(e){}
          S.save(res); S.role=res.role||''; document.getElementById('lgPw').value='';
          authShown=false; document.getElementById('login').hidden=true; startApp();
        } else err.textContent=(res&&res.error)||'ログインできませんでした';
      },function(e){
        if(tries<2){ setTimeout(attempt,700); return; }
        btn.disabled=false; btn.textContent='ログイン'; err.textContent=e.message||'通信エラー';
      });
    })();
  });
}

/* ===================== 起動 ===================== */
var started=false;
function checkRole(){
  return API.get('checkRole',{},{retry:1,timeout:20000}).then(function(r){
    if(r&&r.ok){
      S.role=r.role||'';
      if(S.adminTok()&&S.role!=='admin'){ try{ localStorage.removeItem('genba_admin'); }catch(e){} }
      /* ログイン期限の延長（Gen-Can v43.29と同じ：同じトークンが返った時だけ期限を延ばす） */
      try{ var s=S.sess(); if(s&&s.token&&s.expiresAt&&r.token===s.token&&Number(r.expiresAt)>Number(s.expiresAt)){ s.expiresAt=Number(r.expiresAt); localStorage.setItem('genba_session',JSON.stringify(s)); } }catch(e){}
      if(S.role==='disabled'){ GK.toast('このアカウントは利用停止中です',{err:true}); }
      GK.emit('role',S.role);
    }
  }).catch(function(){ /* 電波が悪いだけの時はそのまま使えるようにする */ });
}
var startedUser='';
function startApp(){
  document.getElementById('app').hidden=false;
  var me=S.me().id;
  /* ログイン切れから同じ人がログインし直した時は、入力中の画面をそのまま残す（作り直すと入力が消えるため） */
  var keep=started&&me&&me===startedUser&&document.getElementById('view').childNodes.length>0;
  if(!keep) D.restore();
  if(!started){ started=true; navStack=[location.hash||'#/today']; }
  startedUser=me;
  document.getElementById('sheetRoot').hidden=false;
  if(keep){ GK.toast('ログインしました（入力中の内容はそのままです。保存できなかった場合はもう一度「保存」を押してください）',{ms:6000}); }
  else { GK.closeSheets(); render(); }
  /* 権限が確定して変わった時だけ画面を描き直す（入力中のフォームを消さないため） */
  var before=CAN.role();
  checkRole().then(function(){ if(CAN.role()!==before) GK.refresh(); });
  D.loadRD().catch(function(e){ GK.toast('データを読み込めませんでした：'+e.message,{err:true}); });
}
GK.boot = function(){
  applyFontScale(false);
  bindLogin();
  if('serviceWorker' in navigator){ try{ navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(function(){}); }catch(e){} }
  window.addEventListener('online',function(){ GK.toast('通信が回復しました'); });
  window.addEventListener('offline',function(){ GK.toast('オフラインです。電波の届く場所で保存・読み込みしてください',{err:true,ms:6000}); });
  if(!S.token()){ showLogin(''); return; }
  startApp();
};

})();
