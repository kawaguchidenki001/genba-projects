
var GAS_URL=(window.GENBA_CONFIG&&window.GENBA_CONFIG.GAS_URL)||'https://script.google.com/macros/s/AKfycbyk8p6_gi6e3wdhQdWL0Oswz4BUtP3gR37PeFJJ9rO5mVhTRt4CikpQhK_bBwt1Ftr-/exec';
var APP_VERSION=(window.GENBA_CONFIG&&window.GENBA_CONFIG.APP_VERSION)||'v2026.06.20-43.8.1';
var BUILD_ID=(window.GENBA_CONFIG&&window.GENBA_CONFIG.BUILD)||'20260620-v43-8-1-cache-lock';
(function(){try{var b=document.getElementById('verBadge');if(b)b.textContent=APP_VERSION;var lv=document.getElementById('loginVer');if(lv)lv.textContent=APP_VERSION;localStorage.setItem('gencan_build',BUILD_ID);}catch(e){}})();

function genbaSessionTok(){
  try{
    var s=JSON.parse(localStorage.getItem('genba_session')||'null');
    if(s&&s.token&&(!s.expiresAt || Date.now()<Number(s.expiresAt)))return s.token;
  }catch(e){}
  return '';
}
function genbaSaveSession(res){
  try{
    if(res&&res.token)localStorage.setItem('genba_session',JSON.stringify({token:res.token,role:res.role||'general',expiresAt:res.expiresAt||0}));
  }catch(e){}
}
function genbaClearSession(){try{localStorage.removeItem('genba_session');localStorage.removeItem('genba_admin');}catch(e){}}
var T_GENERAL='';

function genbaRoleFromUser(u){
  try{
    if(!u) return 'staff';
    var r=String(u.appRole||u.role||u['権限']||'').trim().toLowerCase();
    if(r==='管理者'||r==='admin')return 'admin';
    if(r==='現場責任者'||r==='責任者'||r==='manager')return 'manager';
    if(r==='社員'||r==='staff')return 'staff';
    if(r==='現場作業員'||r==='作業員'||r==='常用'||r==='field')return 'field';
    if(r==='閲覧のみ'||r==='閲覧'||r==='viewer')return 'viewer';
    if(r==='停止'||r==='利用停止'||r==='disabled')return 'disabled';
    var k=String(u['区分']||''); if(/常用|協力|外注|応援|下請/.test(k))return 'field';
  }catch(e){}
  return 'staff';
}
function genbaRoleLabel(role){return {admin:'管理者',manager:'現場責任者',staff:'社員',field:'現場作業員',viewer:'閲覧のみ',disabled:'停止'}[role]||'社員';}
function genbaAllowedMenu(role){
  var all=['quick','start','projects','report','timecard','calendar','files','photos','aitools','toolbox','material','vehicles','tools','safety','estimate','daicho','admin','setup','version','faq','support','help'];
  var sets={
    admin:all,
    manager:['quick','start','projects','report','timecard','calendar','files','photos','aitools','toolbox','material','vehicles','tools','safety','estimate','daicho','version','faq','support','help'],
    staff:['quick','start','projects','report','timecard','calendar','files','photos','aitools','toolbox','material','vehicles','tools','version','faq','support','help'],
    field:['quick','start','projects','report','timecard','files','photos','toolbox','version','faq','support','help'],
    viewer:['projects','files','photos','version','faq','support','help'],
    disabled:['version','faq','support','help']
  };
  var out={}, arr=sets[role]||sets.staff; arr.forEach(function(x){out[x]=1;}); return out;
}
function genbaMenuKeyFromHref(href){
  href=String(href||'');
  var m=href.match(/\.\/([^\/]+)\//); return m?m[1]:'';
}
function applyRootPermissions(u){
  var role=genbaRoleFromUser(u), allow=genbaAllowedMenu(role);
  document.querySelectorAll('a.sq').forEach(function(a){
    var k=genbaMenuKeyFromHref(a.getAttribute('href')||'');
    if(!k)return;
    a.style.display=allow[k]?'':'none';
  });
  var b=document.getElementById('permBadge');
  if(b){ b.style.display='inline-flex'; b.textContent='権限：'+genbaRoleLabel(role); }
  var n=document.getElementById('permNote'); if(n)n.classList.add('show');
}

function gUser(){try{return JSON.parse(localStorage.getItem('genba_user')||'null');}catch(e){return null;}}
function setErr(m){document.getElementById('lgerr').textContent=m||'';}
function showMenu(u){var lg=document.getElementById('login');if(lg)lg.style.display='none';var w=document.querySelector('.wrap');if(w)w.style.display='block';
  document.getElementById('meName').textContent=u&&u['氏名']?u['氏名']+' さん':'';applyRootPermissions(u);}
function showLogin(){var w=document.querySelector('.wrap');if(w)w.style.display='none';var lg=document.getElementById('login');if(lg)lg.style.display='flex';}
var loadCnt=0,loadShownAt=0;
function showLoad(){loadCnt++;if(loadCnt===1){loadShownAt=Date.now();document.getElementById('loading').classList.add('show');}}
function hideLoad(){loadCnt=Math.max(0,loadCnt-1);if(loadCnt===0){var w=Math.max(0,600-(Date.now()-loadShownAt));setTimeout(function(){if(loadCnt===0)document.getElementById('loading').classList.remove('show');},w);}}
function maybeStorePasswordCredential(id,pw){
  // ブラウザのパスワード保存機能に渡すだけです。アプリ側にはパスワードを保存しません。
  try{
    if(!id||!pw||!('credentials' in navigator)||!window.PasswordCredential)return;
    var cred=new PasswordCredential({id:id,name:id,password:pw});
    navigator.credentials.store(cred).catch(function(){});
  }catch(e){}
}
function buildQuery_(params){
  var q=[];
  for(var k in params){ if(Object.prototype.hasOwnProperty.call(params,k) && params[k]!==undefined && params[k]!==null){ q.push(encodeURIComponent(k)+'='+encodeURIComponent(String(params[k]))); } }
  return q.join('&');
}
function jsonpCall_(params,onOk,onNg,timeoutMs){
  if(!GAS_URL || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(GAS_URL)){
    if(onNg)onNg('bad_url');
    return;
  }
  var cb='cb_'+Date.now()+'_'+Math.floor(Math.random()*1e6);
  params=params||{}; params.callback=cb; params._build=BUILD_ID; params._ts=Date.now();
  var s=document.createElement('script'), done=false;
  var timer=setTimeout(function(){finish('timeout');}, timeoutMs||25000);
  function finish(kind,res){
    if(done)return; done=true;
    clearTimeout(timer);
    try{delete window[cb];}catch(e){window[cb]=undefined;}
    if(s.parentNode)s.parentNode.removeChild(s);
    if(kind==='ok'){ if(onOk)onOk(res||{}); }
    else{ if(onNg)onNg(kind); }
  }
  window[cb]=function(res){finish('ok',res);};
  s.async=true; s.charset='utf-8';
  try{s.referrerPolicy='no-referrer-when-downgrade';}catch(e){}
  s.onerror=function(){finish('load_error');};
  s.src=GAS_URL+(GAS_URL.indexOf('?')>=0?'&':'?')+buildQuery_(params);
  document.head.appendChild(s);
}
function doLogin(){
  var id=document.getElementById('lgid').value.trim(),pw=document.getElementById('lgpw').value;
  if(!id){setErr('IDを入力してください');return;}
  setErr('');var btn=document.getElementById('lgbtn');btn.disabled=true;btn.textContent='確認中…';showLoad();
  var attempts=0;
  function finish(){hideLoad();btn.disabled=false;btn.textContent='ログイン';}
  function tryLogin(){
    attempts++;
    jsonpCall_({action:'login',id:id,pw:pw},function(res){
      finish();
      if(res&&res.ok&&res.worker){maybeStorePasswordCredential(id,pw);genbaSaveSession(res);localStorage.setItem('genba_user',JSON.stringify(res.worker));showMenu(res.worker);}
      else setErr((res&&res.error)||'ログインできませんでした');
    },function(kind){
      if(attempts<2){ setTimeout(tryLogin,700); return; }
      finish();
      var msg='通信エラー：Google Apps Scriptに接続できません。';
      if(kind==='bad_url') msg='通信設定エラー：config.js の GAS_URL を確認してください。';
      else if(kind==='timeout') msg='通信タイムアウト：GASのデプロイ状態、公開範囲、URLを確認してください。';
      setErr(msg+'（'+APP_VERSION+'）');
    },25000);
  }
  tryLogin();
}

function isTestLoginVisible_(){
  try{
    var cfg=window.GENBA_CONFIG||{};
    var q=new URLSearchParams(location.search||'');
    return !!cfg.TEST_LOGIN_ENABLED && (q.get('test')==='1' || q.get('testlogin')==='1');
  }catch(e){return false;}
}
function setupTestLoginButton_(){
  var show=isTestLoginVisible_();
  var b=document.getElementById('testLoginBtn'), n=document.getElementById('testLoginNote');
  if(b)b.style.display=show?'block':'none';
  if(n)n.style.display=show?'block':'none';
}
function doTestLogin(){
  if(!isTestLoginVisible_()){setErr('テストログインは無効です');return;}
  setErr('');var btn=document.getElementById('testLoginBtn');if(btn){btn.disabled=true;btn.textContent='テスト確認中…';}
  showLoad();
  jsonpCall_({action:'testLogin'},function(res){
    hideLoad();if(btn){btn.disabled=false;btn.textContent='テストログイン';}
    if(res&&res.ok&&res.worker){genbaSaveSession(res);localStorage.setItem('genba_user',JSON.stringify(res.worker));showMenu(res.worker);}
    else setErr((res&&res.error)||'テストログインできませんでした');
  },function(kind){
    hideLoad();if(btn){btn.disabled=false;btn.textContent='テストログイン';}
    setErr('テストログイン通信エラー：GAS側のtestLogin有効化と再デプロイを確認してください（'+kind+'）');
  },25000);
}
setupTestLoginButton_();
function logout(){genbaClearSession();localStorage.removeItem('genba_user');location.reload();}
function jsonpGet(action,onOk,extra){
  var params={action:action,secret:genbaSessionTok()};
  if(extra){
    String(extra).replace(/^&/,'').split('&').forEach(function(part){
      if(!part)return; var kv=part.split('=');
      var k=decodeURIComponent(kv[0]||''), v=decodeURIComponent((kv.slice(1).join('=')||''));
      if(k)params[k]=v;
    });
  }
  jsonpCall_(params,function(res){if(res&&res.ok)onOk(res);},function(){},25000);
}
function escD(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function hm5(v){var t=String(v||'').slice(0,5);return t;}

function renderTodayTodo(d){
  var panel=document.getElementById('todayTodoPanel'), list=document.getElementById('todayTodoList'), badge=document.getElementById('todayTodoBadge');
  if(!panel||!list||!badge||!d)return;
  var items=[];
  var schedules=d.schedules||[];
  if(schedules.length){
    var first=schedules[0]||{};
    var t=hm5(first['開始'])?(hm5(first['開始'])+(hm5(first['終了'])?'〜'+hm5(first['終了']):'')):'終日';
    items.push({icon:'🗓',title:'今日の予定 '+schedules.length+'件',text:t+'　'+(first['案件名']||first['予定内容']||'予定を確認'),url:'./calendar/'});
  }else{
    items.push({icon:'🗓',title:'今日の予定はありません',text:'予定がある場合はカレンダーから追加できます。',url:'./calendar/'});
  }
  var ws=d.workers||[], miss=ws.filter(function(w){return !w['提出'];});
  if(ws.length){
    if(miss.length){
      items.push({icon:'📝',title:'日報未提出 '+miss.length+'名',text:miss.slice(0,4).map(function(w){return w['略称']||w['氏名'];}).join('・')+(miss.length>4?' ほか':''),url:'./report/'});
    }else{
      items.push({icon:'📝',title:'日報は全員提出済み',text:'今日の日報提出状況は順調です。',url:'./report/'});
    }
  }
  var va=d.vehicleAlerts||[];
  if(va.length){items.push({icon:'🚚',title:'車両アラート '+va.length+'件',text:(va[0]['車両名']||'車両')+'　'+(va[0]['種類']||'期限')+'を確認してください。',url:'./vehicles/'});}
  var ar=d.ar||{};
  if((ar['期限超過']||0)>0){items.push({icon:'💴',title:'入金期限超過 '+ar['期限超過']+'件',text:'未入金の請求を確認してください。',url:'./estimate/'});}
  var due=d.dueProjects||[];
  if(due.length){items.push({icon:'⏳',title:'工期間近 '+due.length+'件',text:(due[0]['案件名']||'案件')+' の工期を確認してください。',url:'./projects/'});}
  var warn=(miss.length)+(va.length)+(ar['期限超過']||0)+(due.length);
  badge.textContent=warn?('要確認 '+warn+'件'):'順調です';
  badge.className='todoBadge'+(warn?' warn':'');
  list.innerHTML=items.slice(0,5).map(function(x){return '<div class="todoItem"><div class="todoIcon">'+escD(x.icon)+'</div><div class="todoMain"><b>'+escD(x.title)+'</b><span>'+escD(x.text)+'</span></div><a class="todoLink" href="'+escD(x.url)+'">開く →</a></div>';}).join('');
  panel.classList.add('show');
}

function renderDash(d){
  if(!d)return;
  renderTodayTodo(d);
  var dash=document.getElementById('dash'); if(!dash)return; var any=false;
  // 今日の予定
  var sc=document.getElementById('dSched'),list=d.schedules||[];
  var h='<div class="dttl">🗓 今日の予定（'+list.length+'件）</div>';
  if(!list.length){h+='<div class="dempty">今日の予定はありません</div>';}
  else{
    list.slice(0,4).forEach(function(e){
      var t=hm5(e['開始'])?(hm5(e['開始'])+(hm5(e['終了'])?'〜'+hm5(e['終了']):'')):'終日';
      h+='<div class="drow"><span class="dtime">'+escD(t)+'</span><span class="dname">'+escD(e['案件名']||e['予定内容']||'(予定)')+'</span>'+(e['担当']?'<span class="dwho">'+escD(e['担当'])+'</span>':'')+'</div>';
    });
    if(list.length>4)h+='<a class="dmore" href="./calendar/">他'+(list.length-4)+'件をカレンダーで見る →</a>';
  }
  if(list.length){sc.innerHTML=h;sc.style.display='block';any=true;}else{sc.style.display='none';}
  // 日報＋案件
  var ws=d.workers||[],sub=ws.filter(function(w){return w['提出'];}).length;
  var pc=d.projCounts||{};
  var h2='<div class="dttl">📝 今日の日報・案件</div><div class="dchips">';
  h2+='<span class="dchip">日報 提出 '+sub+'/'+ws.length+'名</span>';
  ['見積中','受注','段取済','施工中','完了'].forEach(function(k){if(pc[k])h2+='<span class="dchip">'+escD(k)+' '+pc[k]+'件</span>';});
  h2+='</div>';
  var miss=ws.filter(function(w){return !w['提出'];}).map(function(w){return w['略称']||w['氏名'];});
  if(sub>0&&miss.length)h2+='<div class="dempty" style="margin-top:6px;">未提出: '+escD(miss.join('・'))+'</div>';
  var rp=document.getElementById('dRep');rp.innerHTML=h2;rp.style.display='block';any=true;
  // あなたの勤怠
  var meEl=document.getElementById('dMe');
  if(d.me){
    var stTxt=d.me['状態']==='出勤中'?('出勤中（'+escD(d.me['出勤'])+'〜）'):escD(d.me['状態']);
    var hMe='<div class="dttl">⏱ あなたの勤怠</div><div class="dchips">'
      +'<span class="dchip"'+(d.me['状態']==='出勤中'?' style="background:#dcfce7;color:#166534;"':'')+'>'+stTxt+'</span>'
      +'<span class="dchip">今月出勤 '+(d.me['今月出勤日数']||0)+'日</span></div>'
      +'<a class="dmore" href="./timecard/">タイムカードを開く →</a>';
    meEl.innerHTML=hMe;meEl.style.display='block';any=true;
  }else meEl.style.display='none';
  // 売掛（未入金）
  var arEl=document.getElementById('dAR'),ar=d.ar||{};
  if(ar['未入金件数']>0){
    var arn=Math.round(ar['未入金額']||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
    var h6='<div class="dttl">💴 未入金（売掛）</div><div class="dchips">'
      +'<span class="dchip" style="background:#fdf3d7;color:#9d7a18;">¥'+arn+'　'+ar['未入金件数']+'件</span>'
      +(ar['期限超過']>0?'<span class="dchip" style="background:#fde2e2;color:#b91c1c;">⚠ 期限超過 '+ar['期限超過']+'件</span>':'')
      +'</div><a class="dmore" href="./estimate/">見積・請求を開く →</a>';
    arEl.innerHTML=h6;arEl.style.display='block';any=true;
  }else arEl.style.display='none';
  // 工期間近の案件
  var duEl=document.getElementById('dDue'),duArr=d.dueProjects||[];
  if(duArr.length){
    var h4='<div class="dttl">⏳ 工期間近の案件</div>';
    duArr.slice(0,5).forEach(function(p){
      var col=p['残']<0?'#d63a3f':(p['残']<=3?'#e67e22':'#b8860b');
      var txt=p['残']<0?('超過 '+(-p['残'])+'日'):(p['残']===0?'本日まで':'残 '+p['残']+'日');
      h4+='<div class="dalert" style="color:'+col+'">📋 '+escD(p['案件名'])+'　'+txt+'<span class="dd">'+escD(p['期日'])+'</span></div>';
    });
    h4+='<a class="dmore" href="./projects/">案件管理を開く →</a>';
    duEl.innerHTML=h4;duEl.style.display='block';any=true;
  }else duEl.style.display='none';
  // 未完了チェックリスト
  var ckEl=document.getElementById('dCheck'),ckArr=d.checklists||[];
  if(ckArr.length){
    var h5='<div class="dttl">☑ 未完了チェックリスト（'+(d.checklistTotal||ckArr.length)+'件）</div>';
    ckArr.forEach(function(c){
      h5+='<div class="drow"><span class="dname">'+escD(c['タイトル'])+(c['案件名']?'<span class="dwho">　'+escD(c['案件名'])+'</span>':'')+'</span><span class="dtime">残 '+c['残']+'/'+c['全']+'</span></div>';
    });
    h5+='<a class="dmore" href="./toolbox/">ツールボックスを開く →</a>';
    ckEl.innerHTML=h5;ckEl.style.display='block';any=true;
  }else ckEl.style.display='none';
  // 車両アラート
  var al=document.getElementById('dAlert'),arr=d.vehicleAlerts||[];
  if(arr.length){
    var h3='<div class="dttl">🚨 車両アラート</div>';
    arr.forEach(function(a){
      var col=a['残']<0?'#d63a3f':(a['残']<=7?'#e67e22':'#b8860b');
      var txt=a['残']<0?('期限切れ '+(-a['残'])+'日'):('残 '+a['残']+'日');
      h3+='<div class="dalert" style="color:'+col+'">🚚 '+escD(a['車両名'])+'　'+escD(a['種類'])+' '+txt+'<span class="dd">'+escD(a['期日'])+'</span></div>';
    });
    h3+='<a class="dmore" href="./vehicles/">車両管理を開く →</a>';
    al.innerHTML=h3;al.style.display='block';any=true;
  }else{al.style.display='none';}
  var todo=(d.dueProjects||[]).length+(d.checklistTotal||(d.checklists||[]).length)+(d.vehicleAlerts||[]).length+((((d.ar||{})['期限超過']))||0);
  var cntEl=document.getElementById('dashCnt');
  if(cntEl){if(todo>0){cntEl.textContent='⚠ 要対応 '+todo+'件';cntEl.className='cnt warn';}else{cntEl.textContent='順調です';cntEl.className='cnt ok';}}
  if(any){dash.style.display='block';applyDashOpen();}
}
function applyDashOpen(){var d=document.getElementById('dash');if(d)d.classList.toggle('open',localStorage.getItem('genba_dash_open')==='1');}
function toggleDash(){var d=document.getElementById('dash');if(!d)return;var open=!d.classList.contains('open');d.classList.toggle('open',open);try{localStorage.setItem('genba_dash_open',open?'1':'0');}catch(e){}}
function loadDash(){
  try{var c=JSON.parse(localStorage.getItem('genba_dash')||'null');
    if(c&&c.today===new Date().toISOString().slice(0,10))renderDash(c);}catch(e){}
  var u=gUser(),wq=(u&&u['作業員ID'])?('&wid='+encodeURIComponent(u['作業員ID'])):'';
  jsonpGet('dashboard',function(res){
    try{localStorage.setItem('genba_dash',JSON.stringify(res));}catch(e){}
    renderDash(res);
  },wq);
}
/* ===== 忘れ物メモ ポップアップ（端末ローカル / アプリ起動時に表示） ===== */
var REM_KEY='genba_reminders', REM_DISMISS='genba_rem_dismiss';
function remLoad(){try{var a=JSON.parse(localStorage.getItem(REM_KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function remSaveArr(a){try{localStorage.setItem(REM_KEY,JSON.stringify(a));}catch(e){}}
function remDismissed(){try{var a=JSON.parse(sessionStorage.getItem(REM_DISMISS)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function remAddDismiss(id){var a=remDismissed();if(a.indexOf(id)<0)a.push(id);try{sessionStorage.setItem(REM_DISMISS,JSON.stringify(a));}catch(e){}}
function remEsc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function remActiveNow(){
  var now=Date.now(), dis=remDismissed();
  return remLoad().filter(function(r){
    if(dis.indexOf(r.id)>=0)return false;
    if(r.mode==='always')return true;
    return r.at && now>=r.at;
  });
}
function renderRemPopup(){
  var ov=document.getElementById('remOv'); if(!ov)return;
  var list=remActiveNow();
  if(!list.length){ov.classList.remove('show');return;}
  document.getElementById('remCards').innerHTML=list.map(function(r){
    return '<div class="rem-c"><div class="tx">'+remEsc(r.text)+'</div>'
      +'<div class="bt"><button class="rem-ok" onclick="remOK(\''+r.id+'\')">OK</button>'
      +'<button class="rem-del" onclick="remDel(\''+r.id+'\')">削除</button></div></div>';
  }).join('');
  ov.classList.add('show');
}
function remOK(id){remAddDismiss(id);renderRemPopup();}
function remDel(id){remSaveArr(remLoad().filter(function(x){return x.id!==id;}));renderRemPopup();}

if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(function(){}); }
(function(){var u=gUser();if(u&&u['作業員ID']){showMenu(u);renderRemPopup();}else{showLogin();}})();
