
var GAS_URL=(window.GENBA_CONFIG&&window.GENBA_CONFIG.GAS_URL)||'https://script.google.com/macros/s/AKfycbyk8p6_gi6e3wdhQdWL0Oswz4BUtP3gR37PeFJJ9rO5mVhTRt4CikpQhK_bBwt1Ftr-/exec';

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
var SECRET='';
var MAXPX = 800, QUALITY = 0.80;

var projects=[], customers=[], curId='', folderReady=false;
var photoCache=[], ledgerMode=false, ledgerCandidateOnly=false, ledgerSelectedOnly=false;
var ledgerSelectionIds=[], ledgerSelectionMap={}, ledgerPhotoMetaMap={}, ledgerUserChangedSelection=false;
var photoViewerList=[], photoViewerIndex=0;
var driveRootId='', driveCurrentId='', driveCurrentName='現場フォルダ', driveFolders=[];
var autoOpenDriveAfterFolder=false;
var initialMode=(/[?&](mode=ledger|ledger=1|tool=ledger)/.test(location.search))?'ledger':'files';
var genericDriveStack=[];
var driveHomeLevel='category', driveHomeCategory='', driveHomeCustomer='';
var CACHE='genba_projects_cache_files';
var DRIVE_ROOT_CACHE_PREFIX='gencan_drive_root_v09_';
var DRIVE_ITEMS_CACHE_PREFIX='gencan_drive_items_v09_';
var DRIVE_ITEMS_TTL=10*60*1000;
var driveRequestSeq=0;
var drivePrefetching={};
// 案件管理からタップで来たとき用：?case=案件ID（id / proj でも可）
var INIT_CASE=(function(){try{var p=new URLSearchParams(location.search);return p.get('case')||p.get('id')||p.get('proj')||'';}catch(e){return '';}})();
var initApplied=false;
function applyInit(){ if(initApplied||!INIT_CASE)return; var s=document.getElementById('projSel');
  for(var i=0;i<s.options.length;i++){ if(s.options[i].value===INIT_CASE){ initApplied=true; s.value=INIT_CASE; onSelect(); return; } } }

var loadCnt=0,loadShownAt=0;
function showLoad(){loadCnt++;if(loadCnt===1){loadShownAt=Date.now();document.getElementById('loading').classList.add('show');}}
function hideLoad(){loadCnt=Math.max(0,loadCnt-1);if(loadCnt===0){var w=Math.max(0,200-(Date.now()-loadShownAt));setTimeout(function(){if(loadCnt===0)document.getElementById('loading').classList.remove('show');},w);}}
function callGAS(params,timeoutMs,silent){
  return new Promise(function(resolve,reject){
    if(!silent) showLoad();
    var cb='cb_'+Date.now()+'_'+Math.floor(Math.random()*1e6),s=document.createElement('script');
    var timer=setTimeout(function(){cleanup();reject(new Error('タイムアウト'));},timeoutMs||30000);
    function cleanup(){if(!silent) hideLoad();try{delete window[cb];}catch(e){}if(s.parentNode)s.parentNode.removeChild(s);clearTimeout(timer);}
    window[cb]=function(res){cleanup();resolve(res);};
    var q=Object.assign({secret:genbaSessionTok(),callback:cb},params);
    s.src=GAS_URL+'?'+Object.keys(q).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(q[k]);}).join('&');
    s.onerror=function(){cleanup();reject(new Error('通信エラー'));};document.head.appendChild(s);
  });
}
function postNoCors(obj){ obj.secret=genbaSessionTok(); return fetch(GAS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(obj)}); }
function setSync(st,t){document.getElementById('dot').className='dot'+(st?' '+st:'');document.getElementById('syncTxt').textContent=t;}

function saveFilesCache_(){
  try{localStorage.setItem(CACHE,JSON.stringify({p:projects,c:customers,at:Date.now()}));}catch(e){}
  // 案件管理画面のキャッシュとも共有し、次回表示を速くする
  try{localStorage.setItem('genba_projects',JSON.stringify(projects||[]));}catch(e){}
  try{localStorage.setItem('genba_customers',JSON.stringify(customers||[]));}catch(e){}
}
function applyFilesData_(p,c,label){
  projects=p||[]; customers=c||[]; buildSel();
  if(label)setSync('ok',label);
}
function readFilesCache_(){
  var p=[],c=[],src='';
  try{var cc=JSON.parse(localStorage.getItem(CACHE)||'{}'); if(cc&&cc.p&&cc.p.length){p=cc.p||[];c=cc.c||[];src='保存データ表示中';}}
  catch(e){}
  if(!p.length){
    try{p=JSON.parse(localStorage.getItem('genba_projects')||'[]')||[];}catch(e){p=[];}
    try{c=JSON.parse(localStorage.getItem('genba_customers')||'[]')||[];}catch(e){c=[];}
    if(p.length)src='保存データ表示中';
  }
  if(p.length){applyFilesData_(p,c,src);return true;}
  return false;
}

function driveItemsCacheKey_(fid){return DRIVE_ITEMS_CACHE_PREFIX+String(fid||'');}
function driveRootCacheKey_(pid){return DRIVE_ROOT_CACHE_PREFIX+String(pid||'');}
function readJsonCache_(key,ttl){
  try{
    var o=JSON.parse(localStorage.getItem(key)||'null');
    if(!o||!o.at||!o.data)return null;
    if(ttl && (Date.now()-Number(o.at||0)>ttl))return null;
    return o.data;
  }catch(e){return null;}
}
function writeJsonCache_(key,data){
  try{localStorage.setItem(key,JSON.stringify({at:Date.now(),data:data||{}}));}catch(e){}
}
function clearDriveItemCache_(fid){try{localStorage.removeItem(driveItemsCacheKey_(fid));}catch(e){}}
function cacheDriveItems_(fid,res){
  if(!fid||!res||!res.ok)return;
  writeJsonCache_(driveItemsCacheKey_(fid),{ok:true,folders:res.folders||[],files:res.files||[]});
}
function readDriveItemsCache_(fid){return readJsonCache_(driveItemsCacheKey_(fid),DRIVE_ITEMS_TTL);}
function cacheProjectRoot_(pid,res){
  if(!pid||!res||!res.ok||!res.rootId)return;
  writeJsonCache_(driveRootCacheKey_(pid),{ok:true,rootId:res.rootId,url:res.url||'',folders:res.folders||[],files:res.files||[]});
  cacheDriveItems_(res.rootId,{ok:true,folders:res.folders||[],files:res.files||[]});
}
function readProjectRootCache_(pid){return readJsonCache_(driveRootCacheKey_(pid),DRIVE_ITEMS_TTL);}
function prefetchChildFolders_(folders){
  folders=(folders||[]).slice(0,4); // 多すぎるとGASに負荷がかかるため、先頭4フォルダだけ先読み
  folders.forEach(function(f,idx){
    if(!f||!f.id||readDriveItemsCache_(f.id)||drivePrefetching[f.id])return;
    drivePrefetching[f.id]=1;
    setTimeout(function(){
      callGAS({action:'driveItems',fid:f.id},18000,true).then(function(res){
        if(res&&res.ok)cacheDriveItems_(f.id,res);
      }).catch(function(){}).then(function(){delete drivePrefetching[f.id];});
    },250+idx*350);
  });
}
function refreshFileScreen(){
  if(driveHomeLevel==='drive'&&genericDriveStack&&genericDriveStack.length){
    var cur=genericDriveStack[genericDriveStack.length-1]||{};
    if(cur.id){clearDriveItemCache_(cur.id);openHomeGenericFolder(cur.id,cur.name,true,true);return;}
  }
  loadProjects(false);
}

function loadProjects(silent){
  setSync('busy',silent?'バックグラウンド更新中…':'同期中…');
  callGAS({action:'filesHomeData'},15000,silent).then(function(res){
    if(res&&res.ok)return res;
    var er=String((res&&res.error)||'');
    if(er.indexOf('不明なaction')>=0||er.indexOf('filesHomeData')>=0){
      return callGAS({action:'filesData'},25000,silent);
    }
    throw new Error(er||'エラー');
  }).then(function(res){
    if(!res.ok)throw new Error(res.error||'エラー');
    projects=res.projects||[]; customers=res.customers||[]; saveFilesCache_(); buildSel(); setSync('ok','同期済み');
  }).catch(function(err){
    if(!projects.length){readFilesCache_();}
    if(!silent)toast('読込失敗：'+err.message);
    setSync(projects.length?'ok':'off',projects.length?'保存データ表示中':'オフライン');
  });
}
function buildSel(){ buildCand(); buildProj(); renderDriveHome(); }
function buildCand(){ var t=document.getElementById('f_ctype').value,sel=document.getElementById('f_cand'),cur=sel.value;
  var list=customers.filter(function(c){return !t||categoryKey(c['区分'])===categoryKey(t);});
  sel.innerHTML='<option value="">（取引先を選択）</option>';
  list.forEach(function(c){var nm=String(c['顧客名']||'');if(!nm)return;var o=document.createElement('option');o.value=nm;o.textContent=nm;sel.appendChild(o);}); sel.value=cur; }
function buildProj(){ var cust=document.getElementById('f_cand').value,s=document.getElementById('projSel'),cur=s.value;
  var list=projects.filter(function(p){return !cust||String(p['顧客']||'')===cust;});
  s.innerHTML='<option value="">― 選択 ―</option>';
  list.forEach(function(p){var o=document.createElement('option');o.value=p['案件ID'];o.textContent=p['案件名'];s.appendChild(o);}); s.value=cur; applyInit(); }

function escText(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function categoryKey(v){
  var s=String(v||'').trim();
  if(!s)return '未設定';
  if(s==='官公庁'||s==='公共'||s==='官公署')return '官公庁';
  if(s==='個人')return '個人';
  if(s==='法人'||s==='民間'||s==='会社'||s==='企業')return '民間';
  return s;
}
function categoryIcon(cat){return cat==='官公庁'?'🏛️':(cat==='民間'?'🏢':(cat==='個人'?'🏠':'📁'));}
function customerCategoryByName(name){
  var n=String(name||'');
  for(var i=0;i<(customers||[]).length;i++){
    if(String(customers[i]['顧客名']||'')===n)return categoryKey(customers[i]['区分']);
  }
  return '未設定';
}
function projectCategory(p){
  // 案件マスタ側は「種別」、古いデータや表示用データは「発注者区分」「区分」の場合があるため全対応。
  var direct=categoryKey(p['種別']||p['発注者区分']||p['区分']||'');
  if(direct!=='未設定')return direct;
  return customerCategoryByName(p['顧客']);
}
function projectCustomerName(p){return String(p['顧客']||'').trim();}
function projectById(id){
  id=String(id||'').trim();
  for(var i=0;i<(projects||[]).length;i++){ if(String(projects[i]['案件ID']||'')===id)return projects[i]; }
  return null;
}
function ensureProjectOption(id){
  var s=document.getElementById('projSel'), p=projectById(id);
  if(!s||!p)return false;
  var exists=false;
  for(var i=0;i<s.options.length;i++){ if(String(s.options[i].value)===String(id)){exists=true;break;} }
  if(!exists){
    var o=document.createElement('option');
    o.value=id;
    o.textContent=p['案件名']||id;
    s.appendChild(o);
  }
  return true;
}
function projectsForCategory(cat){
  return (projects||[]).filter(function(p){return projectCategory(p)===cat;});
}
function projectsForCustomer(cat,cust){
  return projectsForCategory(cat).filter(function(p){return projectCustomerName(p)===(cust||'');});
}
function countCustomersInCategory(cat){
  var seen={}, n=0;
  projectsForCategory(cat).forEach(function(p){var c=projectCustomerName(p); if(!seen[c]){seen[c]=1;n++;}});
  return n;
}
function setDriveHomeBreadcrumb(parts){
  var bc=document.getElementById('driveHomeBreadcrumb'); if(!bc)return;
  var html='<span>マイドライブ</span><span>›</span><span>現場ファイル</span>';
  (parts||[]).forEach(function(p){html+='<span>›</span><span>'+escText(p)+'</span>';});
  bc.innerHTML=html;
}
function setDriveHomeLevelLabel(txt){var el=document.getElementById('driveHomeLevel'); if(el)el.textContent=txt||'';}
function resetDriveHome(){
  driveHomeLevel='category'; driveHomeCategory=''; driveHomeCustomer='';
  var p=document.getElementById('panel'); if(p)p.style.display='none';
  if(initialMode==='ledger')driveHomeSetAsLedgerSelection(); else driveHomeRestoreTitle();
  curId=''; folderReady=false; driveRootId=''; driveCurrentId=''; driveCurrentName='現場フォルダ'; driveFolders=[]; genericDriveStack=[];
  updateFileAddDock(); updateLedgerDock();
  var s=document.getElementById('projSel'); if(s)s.value='';
  renderDriveHome();
}
function openDriveHomeCategory(cat){
  driveHomeLevel='customer'; driveHomeCategory=cat; driveHomeCustomer='';
  var f=document.getElementById('f_ctype'); if(f)f.value=cat;
  buildCand(); buildProj(); renderDriveHome();
}
function openDriveHomeCustomer(cust){
  driveHomeLevel='project'; driveHomeCustomer=String(cust||'');
  var f=document.getElementById('f_cand'); if(f)f.value=driveHomeCustomer;
  buildProj(); renderDriveHome();
}
function backDriveHome(){
  if(driveHomeLevel==='project'){driveHomeLevel='customer'; driveHomeCustomer=''; var fc=document.getElementById('f_cand'); if(fc)fc.value=''; buildProj();}
  else if(driveHomeLevel==='customer'){driveHomeLevel='category'; driveHomeCategory=''; var ft=document.getElementById('f_ctype'); if(ft)ft.value=''; buildCand(); buildProj();}
  renderDriveHome();
}
function makeFolderCard(opts){
  var b=document.createElement('button'); b.type='button'; b.className='projectFolderCard '+(opts.cls||''); b.onclick=opts.onclick;
  b.innerHTML='<span class="projectFolderIcon">'+escText(opts.icon||'📁')+'</span><span><div class="projectFolderName">'+escText(opts.name||'名称未設定')+'</div><div class="projectFolderMeta">'+escText(opts.meta||'')+'</div>'+(opts.badge?'<span class="projectFolderBadge">'+escText(opts.badge)+'</span>':'')+'</span>';
  return b;
}
function renderDriveHome(){
  if(driveHomeLevel==='drive'&&genericDriveStack&&genericDriveStack.length){refreshCurrentHomeDrive();return;}
  var box=document.getElementById('projectFolderGrid'); if(!box)return;
  box.innerHTML='';
  if(!projects||!projects.length){box.innerHTML='<div class="driveHomeEmpty">現場フォルダを取得中です…<br><span style="font-size:12px;color:#7d8ea3;">初回だけ少し時間がかかります。取得後は次回からすぐ表示されます。</span></div>';setDriveHomeBreadcrumb([]);setDriveHomeLevelLabel('区分');return;}
  if(driveHomeLevel==='category'){
    setDriveHomeBreadcrumb([]); setDriveHomeLevelLabel('区分');
    var counts={}; (projects||[]).forEach(function(p){var c=projectCategory(p); counts[c]=(counts[c]||0)+1;});
    var order=['官公庁','民間','個人','未設定']; Object.keys(counts).forEach(function(k){if(order.indexOf(k)<0)order.push(k);});
    var any=false;
    order.forEach(function(cat){var n=counts[cat]||0; if(!n)return; any=true;
      box.appendChild(makeFolderCard({cls:'category',icon:categoryIcon(cat),name:cat,meta:n+'件の現場',badge:'開く',onclick:function(){openDriveHomeCategory(cat);}}));
    });
    if(!any)box.innerHTML='<div class="driveHomeEmpty">現場フォルダがありません。</div>';
    return;
  }
  if(driveHomeLevel==='customer'){
    setDriveHomeBreadcrumb([driveHomeCategory]); setDriveHomeLevelLabel('顧客');
    box.appendChild(makeFolderCard({cls:'back',icon:'↩',name:'上の階層へ戻る',meta:'区分フォルダへ',badge:'戻る',onclick:backDriveHome}));
    var list=projectsForCategory(driveHomeCategory), seen={}, rows=[];
    list.forEach(function(p){var c=projectCustomerName(p); if(!seen[c]){seen[c]=0; rows.push(c);} seen[c]++;});
    rows.sort(function(a,b){return String(a||'顧客未設定').localeCompare(String(b||'顧客未設定'),'ja');});
    if(!rows.length){box.innerHTML+='<div class="driveHomeEmpty">この区分の顧客フォルダがありません。</div>';return;}
    rows.forEach(function(cust){box.appendChild(makeFolderCard({cls:'customer',icon:'📁',name:cust||'顧客未設定',meta:(seen[cust]||0)+'件の現場',badge:'顧客フォルダを開く',onclick:function(){openDriveHomeCustomer(cust);}}));});
    return;
  }
  if(driveHomeLevel==='project'){
    setDriveHomeBreadcrumb([driveHomeCategory, driveHomeCustomer||'顧客未設定']); setDriveHomeLevelLabel('現場');
    box.appendChild(makeFolderCard({cls:'back',icon:'↩',name:'上の階層へ戻る',meta:'顧客フォルダへ',badge:'戻る',onclick:backDriveHome}));
    var ps=projectsForCustomer(driveHomeCategory,driveHomeCustomer);
    if(!ps.length){box.innerHTML+='<div class="driveHomeEmpty">この顧客の現場フォルダがありません。</div>';return;}
    ps.forEach(function(p){
      var id=p['案件ID']||'', name=p['案件名']||'名称未設定の現場', period=[p['工期開始']||p['開始日']||'',p['工期完了']||p['終了予定日']||p['終了日']||''].filter(function(x){return x;}).join(' ～ ');
      box.appendChild(makeFolderCard({cls:'project',icon:'📁',name:name,meta:(period||'現場フォルダ'),badge:'現場フォルダを開く',onclick:function(){openProjectFolderFromDrive(id);}}));
    });
  }
}
function renderProjectFolders(){renderDriveHome();}

function updateLedgerDock(){
  var dock=document.getElementById('ledgerDock'), pj=document.getElementById('ledgerDockProject');
  if(!dock)return;
  if(!(initialMode==='ledger'||ledgerMode)){dock.style.display='none';return;}
  dock.style.display=curId?'block':'none';
  var p=(projects||[]).filter(function(x){return x['案件ID']===curId;})[0]||{};
  if(pj)pj.textContent=p['案件名']||'選択中の現場';
  updateSelCount();
}
function updateFileAddDock(){
  var dock=document.getElementById('fileAddDock'), btn=document.getElementById('fileAddDockBtn'), txt=document.getElementById('fileAddDockText');
  if(!dock||!btn||!txt)return;
  // 工事写真台帳モードでは、下部はPDF/Excel作成バーを優先するため、ファイル追加バーは出さない
  if(initialMode==='ledger'||ledgerMode){
    dock.style.display='none';
    return;
  }
  var p=(projects||[]).filter(function(x){return x['案件ID']===curId;})[0]||{};
  dock.style.display='block';
  if(curId){
    txt.innerHTML='<strong>'+escText(p['案件名']||'現場フォルダ')+'</strong>'+(folderReady?'この現場フォルダへファイルを追加できます':'現場フォルダを準備しています…');
    btn.disabled=!folderReady;
  }else{
    txt.innerHTML='<strong>現場を選択してください</strong>現場フォルダへファイルを追加できます';
    btn.disabled=true;
  }
}
function hideLegacyBrowserPanel(){
  var panel=document.getElementById('panel'); if(panel)panel.style.display='none';
  var grid=document.getElementById('gridArea'); if(grid)grid.style.display='none';
  var out=document.getElementById('outBar'); if(out)out.style.display='none';
}
function driveHomeSetAsProjectDrive(projectName){
  driveHomeLevel='drive';
  setDriveHomeLevelLabel('現場フォルダ');
  var note=document.querySelector('.driveHomeNote');
  if(note)note.textContent='Googleドライブのように、フォルダを押すと同じ場所で中身が開きます。ファイルを押すとDrive上のファイルを開きます。';
  var title=document.querySelector('.driveHomeTitle span:nth-child(2)');
  if(title)title.textContent=projectName||'現場フォルダ';
}
function driveHomeRestoreTitle(){
  var title=document.querySelector('.driveHomeTitle span:nth-child(2)'); if(title)title.textContent='ファイルドライブ';
  var note=document.querySelector('.driveHomeNote'); if(note)note.textContent='官公庁・民間などのフォルダから、顧客フォルダ、現場フォルダの順に開けます。現場フォルダ内もGoogleドライブのように閲覧できます。';
}
function driveHomeSetAsLedgerSelection(){
  var title=document.querySelector('.driveHomeTitle span:nth-child(2)'); if(title)title.textContent='工事写真台帳';
  var note=document.querySelector('.driveHomeNote'); if(note)note.textContent='現場フォルダを選ぶと、写真を表示して工事写真台帳を作成できます。';
  setDriveHomeLevelLabel('現場選択');
}
function driveHomeSetAsLedgerDrive(projectName){
  driveHomeLevel='drive';
  var title=document.querySelector('.driveHomeTitle span:nth-child(2)'); if(title)title.textContent='工事写真台帳';
  var note=document.querySelector('.driveHomeNote'); if(note)note.textContent='Googleドライブと同じようにフォルダを開き、写真がある場所では下に写真を表示します。台帳に入れる写真をタップして選択してください。';
  setDriveHomeLevelLabel('写真選択');
}
function ledgerBackToProjects(){
  genericDriveStack=[]; driveRootId=''; driveCurrentId=''; driveCurrentName='現場フォルダ'; folderReady=false; curId=''; ledgerMode=true; ledgerCandidateOnly=false; updateLedgerDock();
  var s=document.getElementById('projSel'); if(s)s.value='';
  var p=document.getElementById('panel'); if(p)p.style.display='none';
  driveHomeLevel='project'; driveHomeSetAsLedgerSelection(); renderDriveHome();
}
function setDriveHomeDriveBreadcrumb(){
  var bc=document.getElementById('driveHomeBreadcrumb'); if(!bc)return;
  var base=(initialMode==='ledger'||ledgerMode)?'工事写真台帳':'現場ファイル';
  var html='<span>マイドライブ</span><span>›</span><span>'+base+'</span>';
  if(genericDriveStack&&genericDriveStack.length){
    genericDriveStack.forEach(function(x,i){
      html+='<span>›</span><button type="button" style="border:none;background:transparent;color:'+(i===genericDriveStack.length-1?'var(--ink)':'var(--accent-d)')+';font-weight:900;font-size:12.5px;padding:0;cursor:pointer;" onclick="openHomeDriveIndex('+i+')">'+escText(x.name||'フォルダ')+'</button>';
    });
  }else if(curId){
    var p=(projects||[]).filter(function(x){return x['案件ID']===curId;})[0]||{};
    html+='<span>›</span><span>'+escText(p['案件名']||'選択中の現場')+'</span>';
  }
  bc.innerHTML=html;
}
function showHomeDriveLoading(msg){
  var box=document.getElementById('projectFolderGrid'); if(box)box.innerHTML='<div class="driveHomeEmpty">'+escText(msg||'フォルダを読込中…')+'</div>';
}
function makeHomeDriveFileCard(f){
  var a=document.createElement('a'); a.className='projectFolderCard file'; a.href=f.url||'#'; a.target='_blank'; a.rel='noopener';
  var ic=driveFileIcon_(f), iconHtml;
  if(ic==='image'){
    a.className+=' image';
    iconHtml='<img loading="lazy" src="https://drive.google.com/thumbnail?id='+encodeURIComponent(f.id)+'&sz=w300" onerror="this.parentNode.textContent=\'🖼\';">';
  }else iconHtml=ic;
  a.innerHTML='<span class="projectFolderIcon">'+iconHtml+'</span><span><div class="projectFolderName">'+escText(f.name||'ファイル')+'</div><div class="projectFolderSub">'+escText(fmtSize_(f.size)||f.mime||'ファイル')+'</div><span class="projectFolderBadge">開く</span></span>';
  return a;
}
function renderHomeDriveItems(folders,files){
  setDriveHomeDriveBreadcrumb();
  var box=document.getElementById('projectFolderGrid'); if(!box)return;
  box.innerHTML='';
  folders=folders||[]; files=files||[];
  if(genericDriveStack.length>1){
    box.appendChild(makeFolderCard({cls:'back',icon:'↩',name:'上の階層へ戻る',meta:(genericDriveStack[genericDriveStack.length-2]||{}).name||'現場フォルダへ',badge:'戻る',onclick:function(){openHomeDriveIndex(genericDriveStack.length-2);}}));
  }
  folders.forEach(function(f){
    box.appendChild(makeFolderCard({cls:'folder',icon:'📁',name:f.name||'フォルダ',meta:'フォルダ',badge:'開く',onclick:function(){openHomeGenericFolder(f.id,f.name,false);}}));
  });
  files.forEach(function(f){box.appendChild(makeHomeDriveFileCard(f));});
  if(!folders.length&&!files.length){box.innerHTML='<div class="driveHomeEmpty">このフォルダは空です。</div>';}
}
function isImageFile_(f){
  var mt=String((f&&f.mime)||''), nm=String((f&&f.name)||'');
  return mt.indexOf('image/')===0 || /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(nm);
}
function renderLedgerPhotoCard_(f){
  var id=String(f&&f.id||'');
  if(id)ledgerPhotoMetaMap[id]=f||{};
  var cand=isLedgerCandidate(f);
  if(ledgerMode && cand && !ledgerUserChangedSelection && id && !ledgerSelectionMap[id]){
    ledgerSelectionMap[id]=1; ledgerSelectionIds.push(id);
  }
  var isSel=!!ledgerSelectionMap[id];
  var a=document.createElement('div'); a.className='ph'+(isSel?' selected':''); a.id='ph_'+id; a.dataset.id=id; a.dataset.candidate=cand?'1':'0';
  a.onclick=function(){togglePhSel(this);};
  var tw=document.createElement('div'); tw.className='thumbWrap';
  if(cand){var bd=document.createElement('span'); bd.className='candidateBadge'; bd.textContent='台帳候補'; tw.appendChild(bd);}
  var od=document.createElement('span'); od.className='selectOrderBadge'; tw.appendChild(od);
  var img=document.createElement('img'); img.loading='lazy'; img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w700';
  img.onerror=function(){tw.innerHTML=(cand?'<span class="candidateBadge">台帳候補</span>':'')+'<span class="selectOrderBadge"></span><span class="fallback">🖼</span>'; ledgerRefreshSelectionUI();};
  var zb=document.createElement('button'); zb.type='button'; zb.className='photoZoomBtn'; zb.textContent='拡大'; zb.onclick=function(ev){ev.stopPropagation();openPhotoViewer(id);};
  tw.appendChild(img); tw.appendChild(zb); a.appendChild(tw);
  var meta=document.createElement('div'); meta.className='meta';
  var cap=document.createElement('span'); cap.className='cap'; cap.textContent=f.name||''; meta.appendChild(cap);
  var tags=photoTagsFromName(f.name||''), tl=document.createElement('div'); tl.className='tagline';
  tags.slice(0,3).forEach(function(t){var sp=document.createElement('span');sp.className='ptag';sp.textContent=t;tl.appendChild(sp);});
  meta.appendChild(tl); a.appendChild(meta);
  return a;
}
function renderHomeCurrentItems(folders,files){
  if(initialMode==='ledger'||ledgerMode)renderHomeLedgerItems(folders,files);
  else renderHomeDriveItems(folders,files);
}
function renderHomeLedgerItems(folders,files){
  ledgerMode=true; ledgerCandidateOnly=false;
  setDriveHomeDriveBreadcrumb();
  updateLedgerDock();
  var box=document.getElementById('projectFolderGrid'); if(!box)return;
  box.innerHTML='';
  folders=folders||[]; files=files||[];
  if(genericDriveStack.length>1){
    box.appendChild(makeFolderCard({cls:'back',icon:'↩',name:'上の階層へ戻る',meta:(genericDriveStack[genericDriveStack.length-2]||{}).name||'現場フォルダへ',badge:'戻る',onclick:function(){openHomeDriveIndex(genericDriveStack.length-2);}}));
  }else{
    box.appendChild(makeFolderCard({cls:'back',icon:'↩',name:'上の階層へ戻る',meta:'現場一覧へ',badge:'戻る',onclick:ledgerBackToProjects}));
  }
  folders.forEach(function(f){
    box.appendChild(makeFolderCard({cls:'folder',icon:'📁',name:f.name||'フォルダ',meta:'フォルダ',badge:'開く',onclick:function(){openHomeGenericFolder(f.id,f.name,false);}}));
  });
  var imgs=(files||[]).filter(isImageFile_);
  imgs.forEach(function(x){if(x&&x.id)ledgerPhotoMetaMap[String(x.id)]=x;});
  photoCache=imgs; photoCache._folders=folders||[];
  var shownImgs=ledgerSelectedOnly?imgs.filter(function(f){return ledgerSelectionMap[String(f.id||'')];}):imgs;
  if(imgs.length){
    var sec=document.createElement('div'); sec.className='ledgerPhotoSection';
    var head=document.createElement('div'); head.className='ledgerPhotoHead';
    var left=document.createElement('div');
    left.innerHTML='<div class="ledgerPhotoTitle">写真ファイル（'+shownImgs.length+' / '+imgs.length+'枚）</div><div class="ledgerPhotoSub">写真をタップした順番で台帳に出力します。選択済み写真は番号付きで表示します。</div>';
    var acts=document.createElement('div'); acts.className='ledgerMiniActions';
    acts.innerHTML='<button type="button" onclick="openLedgerPreview()">プレビュー</button><button type="button" onclick="selCandidates()">候補選択</button><button type="button" onclick="selAll(true)">表示分を全選択</button><button type="button" onclick="toggleSelectedOnly()">'+(ledgerSelectedOnly?'すべて表示':'選択済みだけ')+'</button><button type="button" onclick="selAll(false)">全解除</button>';
    head.appendChild(left); head.appendChild(acts); sec.appendChild(head);
    var g=document.createElement('div'); g.className='grid'; sec.appendChild(g);
    shownImgs.forEach(function(f){g.appendChild(renderLedgerPhotoCard_(f));});
    if(!shownImgs.length){var emp=document.createElement('div');emp.className='driveHomeEmpty';emp.style.gridColumn='1/-1';emp.textContent='選択済み写真はありません。';g.appendChild(emp);}
    box.appendChild(sec);
  }
  if(!folders.length&&!imgs.length){
    box.appendChild((function(){var d=document.createElement('div');d.className='driveHomeEmpty';d.style.gridColumn='1/-1';d.innerHTML='このフォルダに写真はありません。<br><span style="font-size:12px;color:#7d8ea3;">上の階層へ戻るか、写真が入っているフォルダを開いてください。</span>';return d;})());
  }
  updateSelCount();
}

function loadHomeGenericDriveRoot(forceRefresh){
  if(!curId){toast('現場を選択してください');return;}
  var p=(projects||[]).filter(function(x){return x['案件ID']===curId;})[0]||{};
  if(initialMode==='ledger'||ledgerMode)driveHomeSetAsLedgerDrive(p['案件名']||'現場フォルダ'); else driveHomeSetAsProjectDrive(p['案件名']||'現場フォルダ');
  hideLegacyBrowserPanel();
  var cached=!forceRefresh && readProjectRootCache_(curId);
  if(cached&&cached.rootId){
    driveRootId=cached.rootId||''; driveCurrentId=driveRootId; driveCurrentName='現場フォルダ';
    genericDriveStack=[{id:driveRootId,name:p['案件名']||'現場フォルダ'}];
    renderHomeCurrentItems(cached.folders||[],cached.files||[]);
    setSync('ok','保存データから即時表示中');
    // 画面はすぐ出し、裏側で最新状態だけ確認します。
    callGAS({action:'projectDriveRoot',id:curId},18000,true).then(function(res){
      if(res&&res.ok){cacheProjectRoot_(curId,res); if(driveHomeLevel==='drive'&&genericDriveStack.length===1&&String(curId)){driveRootId=res.rootId||driveRootId;driveCurrentId=driveRootId;renderHomeCurrentItems(res.folders||[],res.files||[]);}}
    }).catch(function(){});
    prefetchChildFolders_(cached.folders||[]);
    return;
  }
  showHomeDriveLoading('現場フォルダを読込中…');
  var seq=++driveRequestSeq;
  callGAS({action:'projectDriveRoot',id:curId},18000,true).then(function(res){
    if(seq!==driveRequestSeq)return;
    if(!res||!res.ok)throw new Error((res&&res.error)||'フォルダ取得失敗');
    driveRootId=res.rootId||''; driveCurrentId=driveRootId; driveCurrentName='現場フォルダ';
    genericDriveStack=[{id:driveRootId,name:p['案件名']||'現場フォルダ'}];
    cacheProjectRoot_(curId,res);
    renderHomeCurrentItems(res.folders||[],res.files||[]);
    prefetchChildFolders_(res.folders||[]);
  }).catch(function(err){
    if(seq!==driveRequestSeq)return;
    // 工事写真台帳では、フォルダ一覧取得に失敗しても写真一覧だけは表示できる場合があるため、旧方式にフォールバックする。
    if(initialMode==='ledger'||ledgerMode){
      showHomeDriveLoading('フォルダ取得を再試行中…');
      callGAS({action:'listPhotos',id:curId},30000,true).then(function(r){
        if(!r||!r.ok)throw new Error((r&&r.error)||'写真一覧取得失敗');
        driveRootId=''; driveCurrentId=''; genericDriveStack=[];
        setDriveHomeBreadcrumb([((projects||[]).filter(function(x){return x['案件ID']===curId;})[0]||{})['案件名']||'選択中の現場']);
        renderHomeLedgerItems([],r.photos||[]);
        toast('フォルダ表示は取得できなかったため、写真一覧のみ表示しています');
      }).catch(function(e){showHomeDriveLoading('フォルダ準備に失敗しました。更新ボタンを押すか、少し待ってから再選択してください。');toast((err&&err.message)||e.message);});
      return;
    }
    showHomeDriveLoading('現場フォルダの取得に失敗しました。GAS側の Code_v143.gs を確認してください。');toast(err.message);
  });
}

function openHomeGenericFolder(fid,name,keepStack,forceRefresh){
  if(!fid){toast('フォルダIDがありません');return;}
  if(!keepStack)genericDriveStack.push({id:fid,name:name||'フォルダ'});
  driveCurrentId=fid; driveCurrentName=name||'フォルダ';
  setDriveHomeDriveBreadcrumb();
  var cached=!forceRefresh && readDriveItemsCache_(fid);
  if(cached){
    renderHomeCurrentItems(cached.folders||[],cached.files||[]);
    setSync('ok','保存データから即時表示中');
    prefetchChildFolders_(cached.folders||[]);
    // 表示を止めずに裏側で最新化。現在見ているフォルダの時だけ差し替えます。
    var currentFid=fid;
    callGAS({action:'driveItems',fid:fid},18000,true).then(function(res){
      if(res&&res.ok){cacheDriveItems_(currentFid,res); if(driveCurrentId===currentFid)renderHomeCurrentItems(res.folders||[],res.files||[]);}
    }).catch(function(){});
    return;
  }
  showHomeDriveLoading('フォルダを読込中…');
  var seq=++driveRequestSeq;
  callGAS({action:'driveItems',fid:fid},18000,true).then(function(res){
    if(seq!==driveRequestSeq)return;
    if(!res||!res.ok)throw new Error((res&&res.error)||'一覧取得失敗');
    cacheDriveItems_(fid,res);
    renderHomeCurrentItems(res.folders||[],res.files||[]);
    prefetchChildFolders_(res.folders||[]);
  }).catch(function(err){if(seq===driveRequestSeq){showHomeDriveLoading('フォルダの取得に失敗しました');toast(err.message);}});
}
function openHomeDriveIndex(i){
  var it=genericDriveStack[i]; if(!it)return;
  genericDriveStack=genericDriveStack.slice(0,i+1);
  openHomeGenericFolder(it.id,it.name,true);
}
function refreshCurrentHomeDrive(){
  if(driveHomeLevel==='drive'&&genericDriveStack.length){
    var cur=genericDriveStack[genericDriveStack.length-1]; openHomeGenericFolder(cur.id,cur.name,true); return;
  }
  if(curId)loadHomeGenericDriveRoot();
}

function openProjectFolderFromDrive(id){
  id=String(id||'').trim();
  if(!id){toast('現場IDが取得できません');return;}
  if(!ensureProjectOption(id)){toast('現場データが見つかりません。更新してください');return;}
  var s=document.getElementById('projSel');
  if(s){s.value=id;}
  autoOpenDriveAfterFolder=true;
  toast((initialMode==='ledger')?'写真台帳を開いています…':'現場フォルダを開いています…');
  onSelect();
  setTimeout(function(){
    var home=document.getElementById('driveHome');
    if(home){try{home.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){home.scrollIntoView();}}
  },50);
}
function onCType(){ curId=''; folderReady=false; updateFileAddDock(); updateLedgerDock(); hideLegacyBrowserPanel(); if(initialMode==='ledger')driveHomeSetAsLedgerSelection(); else driveHomeRestoreTitle(); buildCand(); buildProj(); driveHomeLevel='category'; renderDriveHome(); }
function onCand(){ curId=''; folderReady=false; updateFileAddDock(); updateLedgerDock(); hideLegacyBrowserPanel(); if(initialMode==='ledger')driveHomeSetAsLedgerSelection(); buildProj(); renderDriveHome(); }

function onSelect(){
  var nextId=document.getElementById('projSel').value;
  if(nextId!==curId){ledgerClearSelection_();ledgerUserChangedSelection=false;ledgerSelectedOnly=false;}
  curId=nextId;
  driveRootId=''; driveCurrentId=''; driveCurrentName='現場フォルダ'; driveFolders=[];
  genericDriveStack=[];
  var ut=document.getElementById('upThumbs');if(ut){ut.style.display='none';ut.innerHTML='';}
  var panel=document.getElementById('panel');
  if(!curId){panel.style.display='none';updateLedgerDock();return;}
  var p=projects.filter(function(x){return x['案件ID']===curId;})[0]||{};
  document.getElementById('pName').textContent=p['案件名']||'';
  document.getElementById('pId').textContent=curId;
  hideLegacyBrowserPanel();

  // 工事写真台帳は「閲覧・選択」が主目的なので、重い ensureFolder を先に走らせない。
  // ここで止まると写真台帳が開かないため、Google Drive風の一覧取得を直接行う。
  if(initialMode==='ledger'||ledgerMode){
    ledgerMode=true;
    folderReady=true;
    updateFileAddDock();
    updateLedgerDock();
    driveHomeSetAsLedgerDrive(p['案件名']||'選択中の現場');
    showHomeDriveLoading('写真フォルダを読込中…');
    loadHomeGenericDriveRoot(true);
    return;
  }

  showHomeDriveLoading('現場フォルダを準備中…');
  folderReady=false; updateFileAddDock();
  // ファイル画面はアップロード先が必要なので、フォルダを用意（無ければ作成）してから表示する。
  callGAS({action:'ensureFolder',id:curId}).then(function(res){
    if(!res.ok)throw new Error(res.error||'フォルダ準備失敗');
    var openBtn=document.getElementById('openBtn');
    if(openBtn)openBtn.href=res.url||'#';
    folderReady=true; updateFileAddDock(); updateLedgerDock();
    autoOpenDriveAfterFolder=false;
    loadHomeGenericDriveRoot();
  }).catch(function(err){ showHomeDriveLoading('フォルダ準備に失敗しました。↻でやり直すか、少し待って再選択してください。'); updateFileAddDock(); toast(err.message); });
}


function getCurrentLedgerPhotoList_(){
  var ids=ledgerCurrentVisibleIds_();
  if(ids&&ids.length)return ids;
  if(ledgerSelectedOnly)return ledgerSelectionIds.slice();
  var arr=(photoCache||[]).filter(function(f){return f&&f.id;}).map(function(f){return String(f.id);});
  return arr.length?arr:ledgerSelectionIds.slice();
}
function openPhotoViewer(id){
  id=String(id||''); if(!id){toast('写真IDがありません');return;}
  photoViewerList=getCurrentLedgerPhotoList_();
  if(photoViewerList.indexOf(id)<0)photoViewerList.unshift(id);
  photoViewerIndex=Math.max(0,photoViewerList.indexOf(id));
  renderPhotoViewer_();
  var m=document.getElementById('photoViewerModal'); if(m)m.classList.add('show');
}
function closePhotoViewer(){var m=document.getElementById('photoViewerModal');if(m)m.classList.remove('show');}
function photoViewerMove(d){
  var next=photoViewerIndex+d; if(next<0||next>=photoViewerList.length)return;
  photoViewerIndex=next; renderPhotoViewer_();
}
function renderPhotoViewer_(){
  var id=photoViewerList[photoViewerIndex]||'', f=ledgerGetMeta_(id)||{};
  var img=document.getElementById('photoViewerImg'), nm=document.getElementById('photoViewerName'), sub=document.getElementById('photoViewerSub'), cnt=document.getElementById('photoViewerCount'), sel=document.getElementById('photoViewerSelect'), drv=document.getElementById('photoViewerDrive'), prev=document.getElementById('photoViewerPrev'), next=document.getElementById('photoViewerNext');
  if(img)img.src=id?('https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1800'):'';
  if(nm)nm.textContent=f.name||'写真';
  var order=ledgerSelectionIndex_(id);
  if(sub)sub.textContent=(order>=0?('選択順：'+(order+1)+'番'):'未選択')+'　｜　大きく確認してから選択できます';
  if(cnt)cnt.textContent=(photoViewerIndex+1)+' / '+Math.max(1,photoViewerList.length);
  if(sel){sel.textContent=(order>=0)?'選択を解除':'台帳に選択';sel.classList.toggle('primary',order<0);}
  if(drv){drv.href=id?('https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view'):('#');}
  if(prev)prev.disabled=photoViewerIndex<=0;
  if(next)next.disabled=photoViewerIndex>=photoViewerList.length-1;
}
function photoViewerToggleSelect(){
  var id=photoViewerList[photoViewerIndex]||''; if(!id)return;
  ledgerUserChangedSelection=true;
  if(ledgerSelectionMap[id])ledgerRemoveSelection_(id); else ledgerAddSelection_(id);
  updateSelCount(); renderPhotoViewer_();
}
document.addEventListener('keydown',function(ev){
  var m=document.getElementById('photoViewerModal'); if(!m||!m.classList.contains('show'))return;
  if(ev.key==='Escape')closePhotoViewer();
  if(ev.key==='ArrowLeft')photoViewerMove(-1);
  if(ev.key==='ArrowRight')photoViewerMove(1);
  if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();photoViewerToggleSelect();}
});

function buildLedgerFiles(fmt){
  if(!curId){toast('案件を選んでください');return;}
  var ids=collectLedgerSelectedIds();
  if(!ids.length){toast('写真を選択してください');return;}
  var nm=(document.getElementById('pName')||{}).textContent||'';
  var box=document.getElementById('ledgerResultDock')||document.getElementById('ledgerResult'); if(box){box.style.display='none';box.innerHTML='';}
  var lt=document.querySelector('#loading .txt'); if(lt) lt.textContent='台帳を作成中…';
  toast((fmt==='xlsx'?'エクセル':'PDF')+'を作成中です。少し時間がかかります…'); showLoad();
  callGAS({action:'makeLedgerFiles',id:curId,ids:ids.join(','),name:nm,fmt:fmt},180000).then(function(res){
    hideLoad(); if(lt) lt.textContent='読み込み中…';
    if(!res||!res.ok){var em=(res&&res.error)||'不明なエラー';if(box){box.innerHTML='作成に失敗しました：<br>'+esc(em);box.style.display='block';}toast('作成に失敗しました');return;}
    var url=(fmt==='xlsx')?res.xlsxUrl:res.pdfUrl, lbl=(fmt==='xlsx')?'📊 台帳（Excel）をダウンロード':'📄 台帳（PDF）を開く';
    var note='ドライブの案件フォルダ内「台帳」フォルダにも保存されています。';
    if(box&&url){
      box.innerHTML='<div style="font-weight:700;margin-bottom:10px;">台帳ができました（'+res.n+'枚）</div><button id="openLedgerBtn" style="display:block;width:100%;max-width:440px;padding:16px;font-size:17px;font-weight:700;color:#fff;background:#1e8e3e;border:none;border-radius:12px;cursor:pointer;">'+lbl+'</button><div style="color:var(--sub);font-size:12px;margin-top:8px;">'+note+'</div>';
      box.style.display='block';
      var ob=document.getElementById('openLedgerBtn');
      if(ob) ob.onclick=function(){ if(fmt==='xlsx'){ var a=document.createElement('a'); a.href=url; a.download=''; document.body.appendChild(a); a.click(); a.remove(); } else { window.open(url,'_blank','width=840,height=1100,scrollbars=yes,resizable=yes'); } };
    }
    toast('台帳を作成しました');
  }).catch(function(err){hideLoad();if(lt) lt.textContent='読み込み中…';toast('作成に失敗：'+err.message);});
}
function showPhotos(){showDriveBrowser();}
function showDriveBrowser(){
  if(!curId){toast('案件を選んでください');return;}
  if(!folderReady){toast('準備中です。少し待ってください');return;}
  ledgerMode=false; ledgerCandidateOnly=false;
  document.getElementById('gridArea').style.display='block';
  document.getElementById('outBar').style.display='none';
  var sb=document.getElementById('selBar'); if(sb)sb.style.display='none';
  var fc=document.getElementById('folderCards'); if(fc){fc.style.display='none';fc.innerHTML='';}
  var lt=document.getElementById('listTitle'); if(lt)lt.childNodes[0].nodeValue='ファイル一覧 ';
  document.getElementById('photos').innerHTML='<div class="empty">現場フォルダを読込中…</div>';
  loadGenericDriveRoot();
}
function showLedger(){
  if(!curId){toast('案件を選んでください');return;}
  if(!folderReady){toast('準備中です。少し待ってください');return;}
  ledgerMode=true; ledgerCandidateOnly=false;
  updateFileAddDock();
  var p=(projects||[]).filter(function(x){return x['案件ID']===curId;})[0]||{};
  driveHomeSetAsLedgerDrive(p['案件名']||'選択中の現場');
  updateLedgerDock();
  hideLegacyBrowserPanel();
  showHomeDriveLoading('写真フォルダを読込中…');
  loadHomeGenericDriveRoot();
  setTimeout(function(){
    var target=document.getElementById('driveHome');
    if(target){try{target.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){target.scrollIntoView();}}
  },80);
}
function loadDriveFolders(forLedger){
  callGAS({action:'photoFolders',id:curId}).then(function(res){
    var folders=(res&&res.folders)||[], rootId=(res&&res.rootId)||'';
    driveRootId=rootId; driveFolders=folders;
    var fs=document.getElementById('folderSel');
    if(fs){
      fs.innerHTML='';
      var o0=document.createElement('option');o0.value=rootId||'';o0.textContent='写真フォルダ全体';fs.appendChild(o0);
      folders.forEach(function(x){var o=document.createElement('option');o.value=x.id;o.textContent=x.name;fs.appendChild(o);});
    }
    var fr=document.getElementById('folderRow'); if(fr)fr.style.display='none';
    openDriveFolder(rootId||'root','写真フォルダ',true);
  }).catch(function(err){
    // 古いGASがまだ反映されていない場合でも、最低限写真一覧だけは表示する。
    var db=document.getElementById('driveBar'); if(db)db.style.display='none';
    var fc=document.getElementById('folderCards'); if(fc){fc.style.display='none';fc.innerHTML='';}
    callGAS({action:'listPhotos',id:curId}).then(function(res){
      if(!res.ok)throw new Error(res.error||'一覧取得失敗');
      renderPhotos(res.photos||[]);
      toast('フォルダ表示は未反映のため、写真一覧のみ表示しています');
    }).catch(function(e){document.getElementById('photos').innerHTML='<div class="empty">フォルダの取得に失敗しました</div>';toast((err&&err.message)||e.message);});
  });
}
function driveUrl(fid){return fid?('https://drive.google.com/drive/folders/'+encodeURIComponent(fid)):'';}
function setDriveHeader(name,fid,isRoot){
  driveCurrentId=fid||driveRootId; driveCurrentName=name||'写真フォルダ';
  var bar=document.getElementById('driveBar'), crumb=document.getElementById('driveCrumb'), op=document.getElementById('driveOpenCurrent');
  if(bar)bar.style.display='flex';
  if(crumb)crumb.textContent=isRoot?'写真フォルダ':'写真フォルダ ＞ '+driveCurrentName;
  if(op){
    if(fid){op.href=driveUrl(fid);op.style.display='inline';}
    else {op.removeAttribute('href');op.style.display='none';}
  }
}
function renderFolderCards(isRoot){
  var box=document.getElementById('folderCards'); if(!box)return;
  box.innerHTML='';
  if(!isRoot){
    var b=document.createElement('button');b.type='button';b.className='folderCard';b.onclick=function(){showDriveRoot();};
    b.innerHTML='<span class="folderIcon">↩</span><span><div class="folderName">上のフォルダへ戻る</div><div class="folderMeta">写真フォルダ</div></span>';
    box.appendChild(b); box.style.display='grid'; return;
  }
  if(!driveFolders.length){box.style.display='none';return;}
  driveFolders.forEach(function(f){
    var b=document.createElement('button');b.type='button';b.className='folderCard';
    b.onclick=function(){openDriveFolder(f.id,f.name,false);};
    b.innerHTML='<span class="folderIcon">📁</span><span><div class="folderName">'+esc(f.name||'フォルダ')+'</div><div class="folderMeta">タップして開く</div></span>';
    box.appendChild(b);
  });
  box.style.display='grid';
}
function openDriveFolder(fid,name,isRoot){
  setDriveHeader(name,fid,isRoot);
  renderFolderCards(isRoot);
  var fs=document.getElementById('folderSel'); if(fs&&fid)fs.value=fid;
  document.getElementById('photos').innerHTML='<div class="empty">写真を読込中…</div>';
  if(isRoot){
    var rootCall=(fid&&fid!=='root')?callGAS({action:'photosByFolder',fid:fid},30000,true):Promise.reject(new Error('rootIdなし'));
    rootCall.then(function(res){
      if(!res||res.ok===false)throw new Error((res&&res.error)||'一覧取得失敗');
      renderPhotos(res.photos||[]);
    }).catch(function(){
      callGAS({action:'listPhotos',id:curId}).then(function(res){
        if(!res.ok)throw new Error(res.error||'一覧取得失敗');
        renderPhotos(res.photos||[]);
      }).catch(function(err){document.getElementById('photos').innerHTML='<div class="empty">写真の取得に失敗しました</div>';toast('一覧：'+err.message);});
    });
  }else{
    callGAS({action:'photosByFolder',fid:fid}).then(function(res){
      if(!res||res.ok===false)throw new Error((res&&res.error)||'一覧取得失敗');
      renderPhotos((res&&res.photos)||[]);
    }).catch(function(err){document.getElementById('photos').innerHTML='<div class="empty">写真の取得に失敗しました</div>';toast(err.message);});
  }
}
function loadCurFolderPhotos(){
  var fs=document.getElementById('folderSel'), fid=fs&&fs.value;
  if(!fid){toast('フォルダがありません');return;}
  var nm='写真フォルダ';
  (driveFolders||[]).forEach(function(x){if(x.id===fid)nm=x.name||nm;});
  openDriveFolder(fid,nm,fid===driveRootId);
}
function loadPhotos(){
  if(!curId)return;
  if(ledgerMode){
    refreshCurrentHomeDrive();
    return;
  }
  showDriveBrowser();
}

function driveFileIcon_(it){
  var mt=String((it&&it.mime)||''); var nm=String((it&&it.name)||'');
  if(mt.indexOf('image/')===0)return 'image';
  if(mt.indexOf('pdf')>=0||/\.pdf$/i.test(nm))return '📕';
  if(/spreadsheet|excel|xlsx|csv/i.test(mt+' '+nm))return '📊';
  if(/document|word|docx/i.test(mt+' '+nm))return '📄';
  if(/presentation|powerpoint|pptx/i.test(mt+' '+nm))return '📑';
  if(/zip|compressed/i.test(mt+' '+nm))return '🗜️';
  return '📄';
}
function fmtSize_(n){n=Number(n||0); if(!n)return ''; if(n<1024)return n+'B'; if(n<1024*1024)return Math.round(n/102.4)/10+'KB'; return Math.round(n/1024/102.4)/10+'MB';}
function setGenericDriveHeader(){
  var bar=document.getElementById('driveBar'), op=document.getElementById('driveOpenCurrent'), cr=document.getElementById('driveCrumb');
  if(bar)bar.style.display='flex';
  var h='<div class="driveCrumbs">';
  genericDriveStack.forEach(function(x,i){ if(i)h+='<span>›</span>'; h+='<button type="button" onclick="openGenericDriveIndex('+i+')">'+esc(x.name||'フォルダ')+'</button>'; });
  h+='</div>'; if(cr)cr.innerHTML=h;
  var cur=genericDriveStack[genericDriveStack.length-1]||{};
  if(op&&cur.id){op.href=driveUrl(cur.id);op.style.display='inline';}
}
function openGenericDriveIndex(i){var it=genericDriveStack[i]; if(!it)return; genericDriveStack=genericDriveStack.slice(0,i+1); openGenericFolder(it.id,it.name,true);}
function showDriveRoot(){
  if(ledgerMode){ if(!driveRootId){showLedger();return;} openDriveFolder(driveRootId,'写真フォルダ',true); return; }
  if(!genericDriveStack.length){showDriveBrowser();return;}
  var r=genericDriveStack[0]; genericDriveStack=[r]; openGenericFolder(r.id,r.name,true);
}
function loadGenericDriveRoot(){
  callGAS({action:'projectDriveRoot',id:curId}).then(function(res){
    if(!res||!res.ok)throw new Error((res&&res.error)||'フォルダ取得失敗');
    driveRootId=res.rootId||''; driveCurrentId=driveRootId; driveCurrentName='現場フォルダ';
    genericDriveStack=[{id:driveRootId,name:'現場フォルダ'}];
    renderGenericDriveItems(res.folders||[],res.files||[]);
  }).catch(function(err){document.getElementById('photos').innerHTML='<div class="empty">現場フォルダの取得に失敗しました。<br>GAS側の Code_v143.gs を貼り替えて再デプロイしてください。</div>';toast(err.message);});
}
function openGenericFolder(fid,name,keepStack){
  if(!fid){toast('フォルダIDがありません');return;}
  if(!keepStack){genericDriveStack.push({id:fid,name:name||'フォルダ'});}
  driveCurrentId=fid; driveCurrentName=name||'フォルダ'; setGenericDriveHeader();
  document.getElementById('photos').innerHTML='<div class="empty">フォルダを読込中…</div>';
  callGAS({action:'driveItems',fid:fid}).then(function(res){
    if(!res||!res.ok)throw new Error((res&&res.error)||'一覧取得失敗');
    renderGenericDriveItems(res.folders||[],res.files||[]);
  }).catch(function(err){document.getElementById('photos').innerHTML='<div class="empty">フォルダの取得に失敗しました</div>';toast(err.message);});
}
function renderGenericDriveItems(folders,files){
  setGenericDriveHeader();
  var fc=document.getElementById('folderCards'); if(fc){fc.style.display='none';fc.innerHTML='';}
  var count=(folders||[]).length+(files||[]).length;
  document.getElementById('phCount').textContent='（'+count+'件）';
  var el=document.getElementById('photos'); el.innerHTML='';
  if(!count){el.innerHTML='<div class="empty">このフォルダは空です。</div>';return;}
  var box=document.createElement('div'); box.className='driveItems'; el.appendChild(box);
  (folders||[]).forEach(function(f){
    var b=document.createElement('button'); b.type='button'; b.className='driveItem'; b.onclick=function(){openGenericFolder(f.id,f.name,false);};
    b.innerHTML='<span class="driveItemIcon folder">📁</span><span><div class="driveItemName">'+esc(f.name||'フォルダ')+'</div><div class="driveItemMeta">フォルダ</div></span>';
    box.appendChild(b);
  });
  (files||[]).forEach(function(f){
    var a=document.createElement('a'); a.className='driveItem'; a.href=f.url||'#'; a.target='_blank'; a.rel='noopener';
    var ic=driveFileIcon_(f), iconHtml=(ic==='image')?'<img loading="lazy" src="https://drive.google.com/thumbnail?id='+encodeURIComponent(f.id)+'&sz=w300">':ic;
    a.innerHTML='<span class="driveItemIcon">'+iconHtml+'</span><span><div class="driveItemName">'+esc(f.name||'ファイル')+'</div><div class="driveItemMeta">'+esc(fmtSize_(f.size)||f.mime||'ファイル')+'</div></span>';
    box.appendChild(a);
  });
}
function isLedgerCandidate(f){var n=String((f&&f.name)||'');return /台帳候補|施工前|施工中|施工後|材料検収|試験状況|完成|是正前|是正後/.test(n);} 
function ledgerSelectionCount_(){return ledgerSelectionIds.length;}
function ledgerSelectionIndex_(id){return ledgerSelectionIds.indexOf(String(id||''));}
function ledgerAddSelection_(id){id=String(id||'');if(!id||ledgerSelectionMap[id])return;ledgerSelectionMap[id]=1;ledgerSelectionIds.push(id);}
function ledgerRemoveSelection_(id){id=String(id||'');if(!id||!ledgerSelectionMap[id])return;delete ledgerSelectionMap[id];ledgerSelectionIds=ledgerSelectionIds.filter(function(x){return x!==id;});}
function ledgerClearSelection_(){ledgerSelectionIds=[];ledgerSelectionMap={};}
function ledgerCurrentVisibleIds_(){var ids=[];document.querySelectorAll('#photos .ph, #projectFolderGrid .ph').forEach(function(el){if(el.dataset&&el.dataset.id)ids.push(String(el.dataset.id));});return ids;}
function ledgerRefreshSelectionUI(){
  document.querySelectorAll('#photos .ph, #projectFolderGrid .ph').forEach(function(el){
    var id=String((el.dataset&&el.dataset.id)||''), idx=ledgerSelectionIndex_(id), on=idx>=0;
    el.classList.toggle('selected',on);
    var b=el.querySelector('.selectOrderBadge');
    if(b)b.textContent=on?String(idx+1):'';
  });
}
function collectLedgerSelectedIds(){
  if(ledgerMode||initialMode==='ledger')return ledgerSelectionIds.slice();
  var ids=[];document.querySelectorAll('#photos .ph.selected, #projectFolderGrid .ph.selected').forEach(function(el){if(el.dataset&&el.dataset.id)ids.push(el.dataset.id);});return ids;
}
function ledgerGetMeta_(id){id=String(id||'');return ledgerPhotoMetaMap[id]||{id:id,name:'写真'};}
function openLedgerPreview(){
  if(!(ledgerMode||initialMode==='ledger'))return;
  if(!ledgerSelectionIds.length){toast('写真を選択してください');return;}
  renderLedgerPreview();
  var m=document.getElementById('ledgerPreviewModal');if(m)m.classList.add('show');
}
function closeLedgerPreview(){var m=document.getElementById('ledgerPreviewModal');if(m)m.classList.remove('show');}
function renderLedgerPreview(){
  var list=document.getElementById('ledgerPreviewList'), count=document.getElementById('ledgerPreviewCount');
  if(count)count.textContent=ledgerSelectionIds.length+'枚選択中';
  if(!list)return;
  list.innerHTML='';
  if(!ledgerSelectionIds.length){list.innerHTML='<div class="ledgerPreviewEmpty">写真が選択されていません。</div>';return;}
  ledgerSelectionIds.forEach(function(id,i){
    var f=ledgerGetMeta_(id);
    var card=document.createElement('div');card.className='ledgerPreviewCard';
    var th=document.createElement('div');th.className='ledgerPreviewThumb';
    var ord=document.createElement('span');ord.className='ledgerPreviewOrder';ord.textContent=String(i+1);th.appendChild(ord);
    var img=document.createElement('img');img.loading='lazy';img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w900';img.onclick=function(){openPhotoViewer(id);};img.style.cursor='zoom-in';img.onerror=function(){th.innerHTML='<span class="ledgerPreviewOrder">'+(i+1)+'</span><span class="fallback">🖼</span>';};th.appendChild(img);
    var meta=document.createElement('div');meta.className='ledgerPreviewMeta';
    var nm=document.createElement('div');nm.className='ledgerPreviewName';nm.textContent=f.name||'写真';meta.appendChild(nm);
    var btns=document.createElement('div');btns.className='ledgerPreviewBtns';
    var up=document.createElement('button');up.type='button';up.textContent='↑ 上へ';up.disabled=(i===0);up.onclick=function(){ledgerPreviewMove_(id,-1);};btns.appendChild(up);
    var down=document.createElement('button');down.type='button';down.textContent='↓ 下へ';down.disabled=(i===ledgerSelectionIds.length-1);down.onclick=function(){ledgerPreviewMove_(id,1);};btns.appendChild(down);
    var rem=document.createElement('button');rem.type='button';rem.className='danger';rem.textContent='解除';rem.onclick=function(){ledgerPreviewRemove_(id);};btns.appendChild(rem);
    meta.appendChild(btns);
    card.appendChild(th);card.appendChild(meta);list.appendChild(card);
  });
}
function ledgerPreviewMove_(id,dir){
  id=String(id||'');var i=ledgerSelectionIds.indexOf(id),j=i+dir;if(i<0||j<0||j>=ledgerSelectionIds.length)return;
  var tmp=ledgerSelectionIds[i];ledgerSelectionIds[i]=ledgerSelectionIds[j];ledgerSelectionIds[j]=tmp;
  updateSelCount();renderLedgerPreview();
}
function ledgerPreviewRemove_(id){ledgerRemoveSelection_(id);updateSelCount();renderLedgerPreview();}
function ledgerPreviewClear_(){if(!ledgerSelectionIds.length)return;if(!confirm('選択中の写真をすべて解除しますか？'))return;ledgerClearSelection_();updateSelCount();renderLedgerPreview();}
function updateSelCount(){
  var n=(ledgerMode||initialMode==='ledger')?ledgerSelectionCount_():document.querySelectorAll('#photos .ph.selected, #projectFolderGrid .ph.selected').length;
  var c=document.getElementById('selCount'),dc=document.getElementById('ledgerDockCount');
  if(c)c.textContent=n?n+'枚選択中':'';
  if(dc)dc.textContent=n?(n+'枚選択中（選択順で出力）'):'写真を選択して台帳を作成できます';
  ledgerRefreshSelectionUI();
  var pm=document.getElementById('ledgerPreviewModal');if(pm&&pm.classList.contains('show')){var pc=document.getElementById('ledgerPreviewCount');if(pc)pc.textContent=ledgerSelectionIds.length+'枚選択中';}
}
function toggleSelectedOnly(){ledgerSelectedOnly=!ledgerSelectedOnly;renderHomeLedgerItems(photoCache&&photoCache._folders?photoCache._folders:[],photoCache||[]);}
function showCandidateOnly(){ledgerCandidateOnly=true;renderPhotoCache();}
function showAllPhotoCandidates(){ledgerCandidateOnly=false;renderPhotoCache();}
function selCandidates(){
  if(ledgerMode||initialMode==='ledger'){
    ledgerUserChangedSelection=true;
    ledgerCurrentVisibleIds_().forEach(function(id){var el=document.getElementById('ph_'+id);if(el&&el.dataset.candidate==='1')ledgerAddSelection_(id);});
    updateSelCount();toast('候補写真を選択しました');return;
  }
  document.querySelectorAll('#photos .ph, #projectFolderGrid .ph').forEach(function(e){e.classList.toggle('selected',e.dataset.candidate==='1');});updateSelCount();
}
function renderPhotos(arr){photoCache=arr||[];renderPhotoCache();}
function renderPhotoCache(){
  var arr=photoCache||[], list=arr;
  if(ledgerMode&&ledgerCandidateOnly){list=arr.filter(isLedgerCandidate);}
  var label=(driveCurrentId&&driveCurrentId!==driveRootId)?'（このフォルダ '+list.length+'枚）':(arr.length?('（'+list.length+' / '+arr.length+'枚）'):'');
  document.getElementById('phCount').textContent=label;
  var fn=document.getElementById('filterNote');
  if(fn){fn.textContent=(ledgerMode&&ledgerCandidateOnly)?'台帳候補のみ表示中です。全写真を見る場合は「すべて表示」を押してください。':'';}
  var el=document.getElementById('photos');
  if(!arr.length){el.innerHTML=ledgerMode?'<div class="empty">まだ写真がありません。<br>写真を追加してから台帳を作成できます。</div>':'<div class="empty">まだファイルがありません。<br>「ファイルを追加」から登録できます。</div>';return;}
  if(!list.length){el.innerHTML='<div class="empty">台帳候補の写真がありません。<br>「すべて表示」で写真を確認できます。</div>';return;}
  el.innerHTML=''; var g=document.createElement('div');g.className='grid';el.appendChild(g);
  list.forEach(function(f){
    var cand=isLedgerCandidate(f), id=String(f.id||'');
    if(id)ledgerPhotoMetaMap[id]=f||{};
    if(ledgerMode && cand && !ledgerUserChangedSelection && id && !ledgerSelectionMap[id]){ledgerSelectionMap[id]=1;ledgerSelectionIds.push(id);}
    var a=document.createElement('div');a.className='ph'+(ledgerSelectionMap[id]?' selected':'');a.id='ph_'+id;a.dataset.id=id;a.dataset.candidate=cand?'1':'0';a.onclick=function(){togglePhSel(this);};
    var tw=document.createElement('div');tw.className='thumbWrap';
    if(cand){var bd=document.createElement('span');bd.className='candidateBadge';bd.textContent='台帳候補';tw.appendChild(bd);}
    var od=document.createElement('span');od.className='selectOrderBadge';tw.appendChild(od);
    var img=document.createElement('img');img.loading='lazy';img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w700';
    img.onerror=function(){tw.innerHTML=(cand?'<span class="candidateBadge">台帳候補</span>':'')+'<span class="fallback">🖼</span>';};
    tw.appendChild(img);a.appendChild(tw);
    var meta=document.createElement('div');meta.className='meta';
    var cap=document.createElement('span');cap.className='cap';cap.textContent=f.name||'';meta.appendChild(cap);
    var tags=photoTagsFromName(f.name||'');
    var tl=document.createElement('div');tl.className='tagline';
    tags.slice(0,3).forEach(function(t){var s=document.createElement('span');s.className='ptag';s.textContent=t;tl.appendChild(s);});
    meta.appendChild(tl);a.appendChild(meta);g.appendChild(a);
  });
  updateSelCount();
}
function photoTagsFromName(n){
  var s=String(n||''), tags=[];
  ['施工前','施工中','施工後','材料検収','試験状況','完成','是正前','是正後'].forEach(function(x){if(s.indexOf(x)>=0)tags.push(x);});
  ['配線工事','配管工事','入線作業','照明器具','盤・分電盤','コンセント','スイッチ','接地工事','受変電設備','撤去工事','試験・測定'].forEach(function(x){if(s.indexOf(x)>=0)tags.push(x);});
  if(/台帳候補/.test(s)&&tags.indexOf('台帳候補')<0)tags.unshift('台帳候補');
  return tags;
}
var PHOTO_KIND_TEMPLATES=['配線工事','配管工事','入線作業','照明器具','盤・分電盤','コンセント','スイッチ','接地工事','受変電設備','撤去工事','試験・測定'];
var PHOTO_STATUS_TEMPLATES=['施工前','施工中','施工後','材料検収','試験状況','完成','是正前','是正後'];
function setFieldChip(id,val){var el=document.getElementById(id);if(!el)return;el.value=val;try{el.dispatchEvent(new Event('input'));}catch(e){}}
function initPhotoQuickControls(){
  var kc=document.getElementById('kindChips'), sc=document.getElementById('statusChips');
  if(kc&&!kc.childNodes.length){PHOTO_KIND_TEMPLATES.forEach(function(v){var b=document.createElement('button');b.type='button';b.className='chip';b.textContent=v;b.onclick=function(){setFieldChip('bdKind',v);};kc.appendChild(b);});}
  if(sc&&!sc.childNodes.length){PHOTO_STATUS_TEMPLATES.forEach(function(v){var b=document.createElement('button');b.type='button';b.className='chip small';b.textContent=v;b.onclick=function(){setFieldChip('bdMemo',v);};sc.appendChild(b);});}
}
function openLedgerCandidates(){showLedger();setTimeout(selCandidates,800);} 
function goReportFromFiles(){if(!curId){location.href='https://kawaguchidenki001.github.io/genba-projects/report/';return;}location.href='https://kawaguchidenki001.github.io/genba-projects/report/?case='+encodeURIComponent(curId);}
function bdToday(){var d=new Date();function z(n){return(n<10?'0':'')+n;}return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());}
function bdSan(s){return String(s||'').replace(/[\\\/:*?"<>|]/g,'').replace(/\s+/g,'').slice(0,40);}
function toggleBoard(){var f=document.getElementById('bdFields');if(f)f.style.display=document.getElementById('bdOn').checked?'block':'none';}
function bdFileName(file){
 var kd=bdSan(document.getElementById('bdKind')&&document.getElementById('bdKind').value);
 var st=bdSan(document.getElementById('bdMemo')&&document.getElementById('bdMemo').value);
 var dv=(document.getElementById('bdDate').value||bdToday()).replace(/-/g,'');
 var cand=document.getElementById('ledgerCandidate')&&document.getElementById('ledgerCandidate').checked;
 var base=[cand?'台帳候補':'',kd||'写真',st,dv,(''+Date.now()).slice(-6)].filter(function(x){return x;}).join('_');
 return base+'.jpg';
}
function drawBoard(ctx,cw,ch){
 var pj=(projects.filter(function(x){return x['案件ID']===curId;})[0]||{});
 var v=function(id){return (document.getElementById(id).value||'').trim();};
 var rows=[['工事名',(pj['案件名']||'').trim()],['工種',v('bdKind')],['内容',v('bdMemo')],['日付',(v('bdDate')||bdToday()).replace(/-/g,'/')]].filter(function(r){return r[1];});
 var fs=Math.max(13,Math.round(cw*0.03)),lh=Math.round(fs*1.5),pad=Math.round(fs*0.6),lw=Math.round(fs*3.4),F='"Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif';
 ctx.font='bold '+fs+'px '+F;var mv=0;rows.forEach(function(r){mv=Math.max(mv,ctx.measureText(r[1]).width);});
 var bW=Math.min(Math.round(cw*0.78),lw+Math.ceil(mv)+pad*3),vM=bW-lw-pad*2,bH=pad*2+rows.length*lh,x=pad,y=ch-bH-pad,bw=Math.max(2,Math.round(fs*0.12));
 ctx.fillStyle='rgba(15,61,46,0.84)';ctx.fillRect(x,y,bW,bH);
 ctx.lineWidth=bw;ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.strokeRect(x+bw/2,y+bw/2,bW-bw,bH-bw);
 ctx.textBaseline='top';
 rows.forEach(function(r,i){var ry=y+pad+i*lh;
  ctx.font=Math.round(fs*0.86)+'px '+F;ctx.fillStyle='rgba(220,255,235,0.95)';ctx.fillText(r[0],x+pad,ry+Math.round(fs*0.08));
  ctx.font='bold '+fs+'px '+F;ctx.fillStyle='#fff';var t=r[1];
  while(t.length>1&&ctx.measureText(t).width>vM)t=t.slice(0,-1);if(t!==r[1]&&t.length>1)t=t.slice(0,-1)+'…';
  ctx.fillText(t,x+lw,ry);});
}
function ledgerCover(nm){
 var W=1240,H=1754,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
 var F='"Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif';
 x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#14532d';x.fillRect(0,0,W,20);x.fillRect(0,H-20,W,20);
 x.textAlign='center';x.fillStyle='#1f2733';x.font='bold 66px '+F;x.fillText('工事写真台帳',W/2,H*0.30);
 x.font='bold 40px '+F;x.fillText(nm||'',W/2,H*0.42);
 x.font='28px '+F;x.fillStyle='#6b7280';x.fillText('作成日　'+bdToday().replace(/-/g,'/'),W/2,H*0.52);
 x.font='bold 32px '+F;x.fillStyle='#1f2733';x.fillText('河口電機',W/2,H*0.60);
 return c.toDataURL('image/jpeg',0.9);
}
function makeLedger(){
  if(!curId){toast('案件を選んでください');return;}
  var sd={};
  document.querySelectorAll('#photos .ph.selected, #projectFolderGrid .ph.selected').forEach(function(el){sd[el.dataset.id]=1;});
  if(!Object.keys(sd).length){toast('写真を選択してください');return;}
  if(!window.jspdf||!window.jspdf.jsPDF){toast('PDF機能の読込に失敗しました');return;}
  if(!confirm('選択した写真で台帳を作成します。\n作成後、その写真は一覧から削除（ゴミ箱へ移動）します。\nよろしいですか？'))return;
  showLoad();
  callGAS({action:'listPhotos',id:curId}).then(function(lp){
    var all=(lp&&lp.photos)||[];
    var sel=all.filter(function(x){return sd[x.id];});
    sel.sort(function(a,b){return String(a.name||'').localeCompare(String(b.name||''));});
    if(!sel.length){hideLoad();toast('写真を選択してください');return;}
    var nm=(document.getElementById('pName')||{}).textContent||'';
    var doc=new window.jspdf.jsPDF('p','mm','a4');
    try{doc.addImage(ledgerCover(nm),'JPEG',0,0,210,297);}catch(e){}
    var M=10,rows=3,per=rows;
    var cellW=210-M*2,cellH=(297-M*2)/rows,capH=9,gap=3,imgH=cellH-capH-gap;
    var SC=5,fail=0,okIds=[];
    function step(i){
      if(i>=sel.length){
        var saved=false;
        try{doc.save((nm||'写真台帳')+'_写真台帳.pdf');saved=true;}catch(e){}
        hideLoad();
        if(saved&&okIds.length){
          callGAS({action:'deletePhotos',ids:okIds.join(',')}).then(function(){loadPhotos();}).catch(function(){loadPhotos();});
          toast('台帳を作成し、'+okIds.length+'枚をゴミ箱へ移動しました'+(fail?'（'+fail+'枚は取得失敗）':''));
        }else{
          toast(saved?'台帳を作成しました':'台帳の作成に失敗しました');
        }
        return;
      }
      if(i%per===0)doc.addPage();
      var pos=i%per,x=M,y=M+pos*cellH;
      callGAS({action:'getPhotoB64',fileId:sel[i].id}).then(function(res){
        if(!res||!res.ok||!res.b64){fail++;return step(i+1);}
        var im=new Image();
        im.onload=function(){
          var cwp=Math.round(cellW*SC),ihp=Math.round(imgH*SC),chp=Math.round(capH*SC);
          var cv=document.createElement('canvas');cv.width=cwp;cv.height=ihp+chp;
          var g=cv.getContext('2d');
          g.fillStyle='#fff';g.fillRect(0,0,cwp,ihp+chp);
          var r=(im.naturalWidth/im.naturalHeight)||1.333,w=cwp,h=w/r;
          if(h>ihp){h=ihp;w=h*r;}
          g.drawImage(im,(cwp-w)/2,(ihp-h)/2,w,h);
          g.fillStyle='#0f3d2e';g.fillRect(0,ihp,cwp,chp);
          g.fillStyle='#fff';g.textBaseline='middle';
          var fp=Math.round(chp*0.46);
          g.font='bold '+fp+'px "Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif';
          var cap=sel[i].name||'';
          while(cap.length>1&&g.measureText(cap).width>cwp-24)cap=cap.slice(0,-1);
          g.fillText(cap,14,ihp+chp/2);
          try{doc.addImage(cv.toDataURL('image/jpeg',0.85),'JPEG',x,y,cellW,imgH+capH);okIds.push(sel[i].id);}catch(e){fail++;}
          step(i+1);
        };
        im.onerror=function(){fail++;step(i+1);};
        im.src='data:image/jpeg;base64,'+res.b64;
      }).catch(function(){fail++;step(i+1);});
    }
    step(0);
  }).catch(function(){hideLoad();toast('写真の取得に失敗しました');});
}
function delSelected(){var ids=[];document.querySelectorAll('#photos .ph.selected, #projectFolderGrid .ph.selected').forEach(function(el){ids.push(el.dataset.id);});if(!ids.length){toast('写真を選択してください');return;}if(!confirm('選択した'+ids.length+'枚をゴミ箱に移動します。よろしいですか？'))return;callGAS({action:'deletePhotos',ids:ids.join(',')}).then(function(res){toast(((res&&res.deleted)||0)+'枚をゴミ箱に移動しました');loadPhotos();}).catch(function(){toast('削除に失敗しました');});}function togglePhSel(e){
  if(ledgerMode||initialMode==='ledger'){
    ledgerUserChangedSelection=true;
    var id=String((e.dataset&&e.dataset.id)||'');
    if(ledgerSelectionMap[id])ledgerRemoveSelection_(id);else ledgerAddSelection_(id);
    updateSelCount();return;
  }
  e.classList.toggle('selected');updateSelCount();
}
function selAll(b){
  if(ledgerMode||initialMode==='ledger'){
    ledgerUserChangedSelection=true;
    if(b){ledgerCurrentVisibleIds_().forEach(ledgerAddSelection_);}
    else{ledgerClearSelection_();}
    updateSelCount();return;
  }
  document.querySelectorAll('#photos .ph, #projectFolderGrid .ph').forEach(function(e){b?e.classList.add('selected'):e.classList.remove('selected');});updateSelCount();
}
function pickFiles(){ if(!folderReady){toast('フォルダ準備中です。少し待ってください');return;} document.getElementById('file').click(); }
document.getElementById('file').addEventListener('change',function(e){ var fs=e.target.files; if(fs&&fs.length)uploadAll(fs); this.value=''; });


function confirmUploadedName(dest,name,tries,delay){
  tries=tries||8; delay=delay||900;
  return new Promise(function(resolve,reject){
    function poll(n){
      setTimeout(function(){
        callGAS({action:'confirmUpload',id:curId,dest:dest,name:name},30000,true).then(function(res){
          if(res&&res.ok&&res.found){ resolve(res); }
          else if(n>1){ poll(n-1); }
          else{ reject(new Error('Drive保存を確認できませんでした')); }
        }).catch(function(){
          if(n>1) poll(n-1); else reject(new Error('保存確認に失敗しました'));
        });
      },delay);
    }
    poll(tries);
  });
}

function uploadAll(files){
  var upPanel=document.getElementById('panel'); if(upPanel)upPanel.style.display='block';
  var arr=Array.prototype.slice.call(files),done=0,fail=0,i=0;
  var prog=document.getElementById('prog');prog.style.display='block';
  var box=document.getElementById('upThumbs');
  box.style.display='block';
  box.innerHTML='<div class="upttl" id="upTtl">アップロード中…</div><div class="upgrid" id="upGrid"></div>';
  var grid=document.getElementById('upGrid');
  // v43.1修正：通常の「ファイル」画面ではJPEG/PNG等も写真フォルダへ振り分けず、ファイルフォルダへ保存する。
  // 工事写真台帳モードだけ、画像を写真として扱い、台帳用ファイル名に変換する。
  var uploadNames=arr.map(function(file){
    var isImg=((file.type||'').indexOf('image')===0);
    return ((initialMode==='ledger'||ledgerMode)&&isImg)?bdFileName(file):file.name;
  });
  var items=arr.map(function(file,idx){
    var d=document.createElement('div');d.className='upitem';
    var st='<span class="upst">⏳</span>';
    if((file.type||'').indexOf('image')===0){
      var u='';try{u=URL.createObjectURL(file);}catch(e){}
      d.innerHTML=(u?'<img src="'+u+'">':'<div class="upfile">🖼</div>')+st+'<div class="upnm">'+esc(uploadNames[idx])+'</div>';
    }else{
      d.innerHTML='<div class="upfile">📄</div>'+st+'<div class="upnm">'+esc(uploadNames[idx])+'</div>';
    }
    grid.appendChild(d);return d;
  });
  function mark(idx,ok,msg){var b=items[idx]&&items[idx].querySelector('.upst');if(b)b.textContent=ok?'✅':'❌'; if(msg){var n=items[idx]&&items[idx].querySelector('.upnm'); if(n)n.title=msg;}}
  function next(){
    if(i>=arr.length){
      prog.textContent='アップロード完了（'+done+'件'+(fail?'／失敗'+fail:'')+'）';
      var tt=document.getElementById('upTtl');
      if(tt)tt.textContent='今回アップロードしたファイル（'+done+'件'+(fail?'／失敗'+fail:'')+'）— Drive保存確認済み';
      var act=document.createElement('div');act.className='afterActions';
      act.innerHTML='<button type="button" onclick="pickFiles()">続けてファイルを追加</button><button type="button" onclick="refreshCurrentHomeDrive()">フォルダを更新</button>'; setTimeout(function(){try{refreshCurrentHomeDrive();}catch(e){}},600);
      box.appendChild(act);
      setTimeout(function(){prog.style.display='none'; var upPanel=document.getElementById('panel'); if(upPanel&&!ledgerMode)upPanel.style.display='none';},4000);
      toast(fail?('保存確認：成功'+done+'件／失敗'+fail+'件'):('Drive保存を確認しました（'+done+'件）'));
      return;
    }
    var idx=i, file=arr[i++], expectedName=uploadNames[idx];
    prog.textContent='送信中… '+i+'/'+arr.length;
    var isImage=((file.type||'').indexOf('image')===0);
    var toPhotoFolder=((initialMode==='ledger'||ledgerMode)&&isImage);
    if(toPhotoFolder){
      resizeImage(file,MAXPX,QUALITY).then(function(dataUrl){
        return postNoCors({action:'uploadPhoto',id:curId,dest:'photo',kind:(document.getElementById('bdKind').value||'').trim(),name:expectedName,mime:'image/jpeg',data:dataUrl.split(',')[1]});
      }).then(function(){
        prog.textContent='Drive保存確認中… '+i+'/'+arr.length;
        return confirmUploadedName('photo',expectedName,8,900);
      }).then(function(){done++;mark(idx,true);next();}).catch(function(err){fail++;mark(idx,false,err&&err.message);next();});
    }else{
      readB64(file).then(function(b64){
        return postNoCors({action:'uploadPhoto',id:curId,dest:'file',name:expectedName,mime:file.type||'application/octet-stream',data:b64});
      }).then(function(){
        prog.textContent='Drive保存確認中… '+i+'/'+arr.length;
        return confirmUploadedName('file',expectedName,8,900);
      }).then(function(){done++;mark(idx,true);next();}).catch(function(err){fail++;mark(idx,false,err&&err.message);next();});
    }
  }
  next();
}
function readB64(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){ res(String(r.result).split(',')[1]); }; r.onerror=function(){rej(new Error('読込失敗'));}; r.readAsDataURL(file); }); }
function resizeImage(file,max,q){
  return new Promise(function(res,rej){
    var img=new Image(),url=URL.createObjectURL(file);
    img.onload=function(){ var w=img.width,h=img.height,s=Math.min(1,max/Math.max(w,h));
      var cw=Math.max(1,Math.round(w*s)),ch=Math.max(1,Math.round(h*s));
      var c=document.createElement('canvas');c.width=cw;c.height=ch;var ctx=c.getContext('2d');ctx.drawImage(img,0,0,cw,ch);
      if(document.getElementById('bdOn')&&document.getElementById('bdOn').checked){try{drawBoard(ctx,cw,ch);}catch(e){}}
      URL.revokeObjectURL(url); try{res(c.toDataURL('image/jpeg',q));}catch(e){rej(e);} };
    img.onerror=function(){URL.revokeObjectURL(url);rej(new Error('画像読込失敗'));}; img.src=url;
  });
}

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function escAttr(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c;});}
var toastT;function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('show');},2800);}

/* ===== 音声入力（Web Speech API・ブラウザ標準／汎用・input/textarea両対応・v43追加） ===== */
(function(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    Array.prototype.forEach.call(document.querySelectorAll('.micbtn'),function(b){b.style.display='none';});
    return;
  }
  var rec=null, curBtn=null, curEl=null, baseText='', recording=false, userStopped=false;
  function stopRec(){ userStopped=true; if(rec){ try{rec.stop();}catch(e){} } }
  function clearUI(){
    if(curBtn){curBtn.classList.remove('recording');curBtn.title='音声入力';}
    recording=false; curBtn=null; curEl=null;
  }
  function startRec(btn){
    var el=document.getElementById(btn.getAttribute('data-mic'));
    if(!el) return;
    curBtn=btn; curEl=el; userStopped=false;
    baseText = el.value ? (el.value.replace(/\s+$/,'') + ' ') : '';
    rec=new SR(); rec.lang='ja-JP'; rec.interimResults=true; rec.continuous=true;
    rec.onresult=function(e){
      var fin='',intr='';
      for(var i=e.resultIndex;i<e.results.length;i++){
        var t=e.results[i][0].transcript;
        if(e.results[i].isFinal) fin+=t; else intr+=t;
      }
      if(fin){ baseText = baseText + fin; }
      curEl.value = baseText + intr;
    };
    rec.onend=function(){
      if(!userStopped && recording){
        try{ rec.start(); return; }catch(e){}
      }
      clearUI();
    };
    rec.onerror=function(e){
      if(e.error==='not-allowed'||e.error==='service-not-allowed'){
        toast('マイクの使用が許可されていません'); userStopped=true; clearUI();
      } else if(e.error==='no-speech'){
        // 無音は無視（onendで自動再開）
      } else {
        clearUI();
      }
    };
    try{
      rec.start(); recording=true;
      btn.classList.add('recording'); btn.title='タップで停止';
    }catch(err){ clearUI(); }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.micbtn'),function(btn){
    btn.addEventListener('click',function(){
      if(recording){
        var same=(curBtn===btn);
        stopRec();
        if(same) return;
        setTimeout(function(){ startRec(btn); },300);
      } else {
        startRec(btn);
      }
    });
  });
})();

try{document.getElementById('bdDate').value=bdToday();initPhotoQuickControls();if(initialMode==='ledger'){document.title='工事写真台帳｜Gen-Can';var _h=document.querySelector('.hcenter h1');if(_h)_h.textContent='工事写真台帳';var _en=document.querySelector('.hcenter .en');if(_en)_en.textContent='Photo ledger';driveHomeSetAsLedgerSelection();updateFileAddDock();}}catch(e){}
// 起動時は、まず保存済みデータを即表示し、最新データは裏で更新する。
try{updateFileAddDock();}catch(e){}
readFilesCache_();
loadProjects(true);
