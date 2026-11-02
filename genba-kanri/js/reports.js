/* 現場管理 reports.js v1.0.0 — 作業日報・人員配置（週間ボード）
 * 日報：作業日報シート（addReportMulti／v158の replaceReportGroup・deleteReportGroup。旧GASでは deleteReport＋addReportMulti）
 *   人工の計算・1日1.5人工の上限・同じ日同じ現場の二重登録チェックはGen-Canの日報画面と同じ規則です。
 *   使用材料（v158）はこのアプリでは入力しませんが、編集してもGen-Canで入れた材料は消えないように引き継ぎます。
 * 人員配置：スケジュールシートの「担当」欄（名前）から作ります（Gen-Canの人員配置ボードと同じ）。
 *   追加＝addSchedule（誰でも）／変更・削除＝updateSchedule・deleteSchedule（管理者のみ）。 */
(function(){
'use strict';
var U=GK.u, D=GK.data, S=GK.session, CAN=GK.can, API=GK.api, esc=U.esc;

GK.route('/reports',{ tab:'reports', title:'日報', render:renderList });
GK.route('/report/new',{ tab:'reports', title:'日報を書く', back:'/reports', noTab:true, render:function(v,p,q){ return renderForm(v,null,q); } });
GK.route('/report/edit',{ tab:'reports', title:'日報を直す', back:'/reports', noTab:true, render:function(v,p,q){ return renderForm(v,{pid:q.get('pid')||'',date:q.get('date')||''},q); } });
GK.route('/board',{ tab:'reports', title:'人員配置', render:renderBoard });

/* ===================== 共通 ===================== */
function grpKey(pid,date){ return String(pid||'')+'|'+U.d10(date); }
function groupRows(pid,date){ var k=grpKey(pid,date); return D.reports.filter(function(r){ return grpKey(r['案件ID'],r['日付'])===k; }); }
function myId(){ return S.me().id; }
function activeWorkers(){
  return D.workers.filter(function(w){ var st=String(w['利用状態']||''); return st!=='停止'&&st!=='利用停止'&&st!=='無効'; })
    .slice().sort(function(a,b){ var pa=D.isPartner(a)?1:0, pb=D.isPartner(b)?1:0; if(pa!==pb) return pa-pb;
      var x=U.numv(a['表示順'])||9999, y=U.numv(b['表示順'])||9999; if(x!==y) return x-y; return String(a['作業員ID']).localeCompare(String(b['作業員ID'])); });
}
function segNav(active){
  if(!CAN.board()) return '';
  return '<div class="seg"><button type="button" data-nav="/reports"'+(active==='rep'?' class="on"':'')+'>📝 日報</button><button type="button" data-nav="/board"'+(active==='board'?' class="on"':'')+'>👷 人員配置</button></div>';
}
function bindSeg(view){ var s=view.querySelector('.seg [data-nav]'); if(!s) return; view.querySelector('.seg').onclick=function(e){ var b=e.target.closest('[data-nav]'); if(b&&!b.classList.contains('on')) GK.go(b.dataset.nav); }; }
/* Gen-Canと同じ人工計算（8時間＝1人工、22:00〜翌5:00は深夜、休憩は通常帯から先に引く） */
function timeCalc(st,et,br,nextDay){
  var s=U.toMin(st), e=U.toMin(et), b=U.toMin(br)||0;
  if(s==null||e==null) return {err:'開始・終了時間を入力してください'};
  var end=e+(nextDay?1440:0);
  if(end<=s) return {err:'終了が開始より前です（日をまたぐ場合は「翌日」にチェック）'};
  var total=end-s, wins=[[0,300],[1320,1740],[2760,3180]], night=0;
  wins.forEach(function(w){ night+=Math.max(0,Math.min(end,w[1])-Math.max(s,w[0])); });
  var day=total-night, dayW=Math.max(0,day-b), rem=Math.max(0,b-day), nightW=Math.max(0,night-rem);
  return { nk:Math.round(dayW/480*100)/100, ynk:Math.round(nightW/480*100)/100, work:dayW+nightW, brMin:b, minutes:Math.max(0,end-s-b) };
}
function fmtHM(min){ return Math.floor(min/60)+'時間'+U.pad(min%60)+'分'; }

/* ===================== 一覧 ===================== */
var LS={ p:'month', w:'' };
function renderList(view,params,q){
  var pid=q.get('pid')||'', d=q.get('d')||'';
  if(q.get('p')) LS.p=q.get('p');
  if(!LS.w) LS.w=CAN.manage()?'all':'me';
  if(CAN.reports()) GK.setActions('<button type="button" data-new>＋ 書く</button>',function(r){ r.querySelector('[data-new]').onclick=function(){ GK.go('/report/new'+(pid?'?pid='+encodeURIComponent(pid):'')); }; });
  view.innerHTML=segNav('rep')+'<div data-filt></div><div data-body></div>';
  bindSeg(view);
  function range(){
    var t=U.today(), dt=U.parse(t);
    if(d) return [d,d];
    if(LS.p==='today') return [t,t];
    if(LS.p==='week'){ var dow=(dt.getDay()+6)%7, s=U.addDays(t,-dow); return [s,U.addDays(s,6)]; }
    if(LS.p==='month') return [t.slice(0,8)+'01',t.slice(0,8)+'31'];
    if(LS.p==='last'){ var lm=new Date(dt.getFullYear(),dt.getMonth()-1,1), s2=U.ymd(lm); return [s2,s2.slice(0,8)+'31']; }
    return ['0000-00-00','9999-99-99'];
  }
  function draw(){
    var f='';
    if(pid){ var pp=D.project(pid); f+='<div class="chips" style="margin-bottom:8px"><button type="button" class="chip on" data-clear="pid">🏗 '+esc(pp?D.pname(pp):'現場')+' ✕</button></div>'; }
    if(d) f+='<div class="chips" style="margin-bottom:8px"><button type="button" class="chip on" data-clear="d">📅 '+esc(U.md(d))+' ✕</button></div>';
    else f+='<div class="chips scroll" data-p style="margin-bottom:8px">'+[['today','今日'],['week','今週'],['month','今月'],['last','先月'],['all','すべて']].map(function(x){ return '<button type="button" class="chip'+(LS.p===x[0]?' on':'')+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>';
    f+='<div class="chips" data-w style="margin-bottom:6px"><button type="button" class="chip'+(LS.w==='me'?' on':'')+'" data-v="me">自分の日報</button><button type="button" class="chip'+(LS.w==='all'?' on':'')+'" data-v="all">全員</button></div>';
    view.querySelector('[data-filt]').innerHTML=f;
    var body=view.querySelector('[data-body]');
    if(!D.t.rd&&!D.reports.length){ body.innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>'; return; }
    var rg=range(), me=myId();
    var groups={}, keys=[];
    D.reports.forEach(function(r){
      var dd=U.d10(r['日付']); if(dd<rg[0]||dd>rg[1]) return;
      if(pid&&String(r['案件ID'])!==String(pid)) return;
      var k=grpKey(r['案件ID'],dd); if(!groups[k]){ groups[k]=[]; keys.push(k); } groups[k].push(r);
    });
    if(LS.w==='me') keys=keys.filter(function(k){ return groups[k].some(function(r){ return String(r['作業員ID'])===me; }); });
    keys.sort(function(a,b){ return b.split('|')[1].localeCompare(a.split('|')[1])||a.localeCompare(b); });
    if(!keys.length){ body.innerHTML='<div class="empty"><div class="big">📝</div>この条件の日報はありません'+(CAN.reports()?'<div class="mt12"><a class="btn primary" href="#/report/new'+(pid?'?pid='+encodeURIComponent(pid):'')+'">日報を書く</a></div>':'')+'</div>'; return; }
    var h='', lastDay='', totalNk=0;
    keys.slice(0,400).forEach(function(k){
      var g=groups[k], dd=k.split('|')[1], p=D.project(g[0]['案件ID']);
      if(dd!==lastDay){ h+='<div class="rp-day">'+esc(U.jp(dd))+'</div>'; lastDay=dd; }
      var nk=0, ynk=0; g.forEach(function(r){ nk+=U.numv(r['人工']); ynk+=U.numv(r['深夜人工']); }); totalNk+=nk+ynk;
      var times={}; g.forEach(function(r){ times[U.hm(r['開始'])+'〜'+U.hm(r['終了'])]=1; });
      var desc=''; g.some(function(r){ if(r['作業内容']){ desc=r['作業内容']; return true; } return false; });
      h+='<button type="button" class="rp-card'+(g.some(function(r){return r._pending;})?' pending':'')+'" data-k="'+esc(k)+'"><div class="h"><b class="grow ellipsis">'+esc(p?D.pname(p):(g[0]['案件名']||'現場なし'))+'</b><span class="badge blue">'+g.length+'名・'+U.round2(nk)+'人工'+(ynk?'＋深夜'+U.round2(ynk):'')+'</span></div>'+
        '<div class="w">👷 '+esc(g.map(function(r){ var w=D.worker(r['作業員ID']); return w?D.wname(w):(r['氏名']||''); }).join('・'))+'　🕗 '+esc(Object.keys(times).join(' / '))+'</div>'+(desc?'<div class="c">'+esc(desc)+'</div>':'')+'</button>';
    });
    if(keys.length>400) h+='<div class="hint center">新しい順に400件まで表示しています</div>';
    body.innerHTML='<div class="small muted" style="margin:2px 4px 0">'+keys.length+'件・合計 '+U.round2(totalNk)+' 人工</div>'+h;
  }
  view.querySelector('[data-filt]').onclick=function(e){
    var c=e.target.closest('[data-clear]'); if(c){ GK.go('/reports'+(c.dataset.clear==='d'&&pid?'?pid='+encodeURIComponent(pid):''),true); return; }
    var b=e.target.closest('[data-v]'); if(!b) return;
    if(b.parentNode.hasAttribute('data-p')) LS.p=b.dataset.v; else LS.w=b.dataset.v; draw(); };
  view.querySelector('[data-body]').onclick=function(e){ var b=e.target.closest('[data-k]'); if(!b) return; var a=b.dataset.k.split('|'); detail(a[0],a[1]); };
  draw();
  return GK.on('data',function(k){ if(k==='rd') draw(); });
}

/* 日報の詳細（現場×日付のまとまり） */
function detail(pid,date){
  var g=groupRows(pid,date); if(!g.length) return;
  var p=D.project(pid), me=myId();
  var mine=g.some(function(r){ return String(r['作業員ID'])===me; });
  var canEdit=CAN.reports()&&(CAN.admin()||mine);
  var veh={}; g.forEach(function(r){ String(r['車両']||'').split(',').forEach(function(v){ v=v.trim(); if(v) veh[v]=1; }); });
  var vehNames=Object.keys(veh).map(function(id){ var v=D.vehicles.filter(function(x){ return String(x['車両ID'])===id; })[0]; return v?v['車両名']:id; });
  var mats=D.reportMaterials.filter(function(m){ return String(m['日報キー'])===grpKey(pid,date); });
  var desc={}; g.forEach(function(r){ if(r['作業内容']) desc[r['作業内容']]=1; });
  var note={}; g.forEach(function(r){ if(r['備考']) note[r['備考']]=1; });
  var h='<div class="small muted">'+esc(U.jp(date))+'</div><div style="font-size:18px;font-weight:900;margin-bottom:8px">'+esc(p?D.pname(p):(g[0]['案件名']||'現場なし'))+'</div>';
  h+='<div class="list">'+g.map(function(r){ var w=D.worker(r['作業員ID']);
    return '<div class="item"><div class="grow"><div class="t" style="font-size:15px">'+esc(w?D.wname(w):r['氏名'])+(String(r['作業員ID'])===me?' <span class="badge blue">自分</span>':'')+'</div><div class="s">'+esc(U.hm(r['開始'])+'〜'+U.hm(r['終了'])+(r['翌日']?'（翌日）':'')+'　休憩'+(U.numv(r['休憩分'])||0)+'分')+'</div></div><b>'+U.round2(U.numv(r['人工']))+'人工'+(U.numv(r['深夜人工'])?'<br><span class="xs">深夜'+U.round2(U.numv(r['深夜人工']))+'</span>':'')+'</b></div>'; }).join('')+'</div>';
  if(Object.keys(desc).length) h+='<div class="flabel">作業内容</div><div style="white-space:pre-wrap;margin-bottom:10px">'+esc(Object.keys(desc).join('\n'))+'</div>';
  if(Object.keys(note).length) h+='<div class="flabel">備考</div><div style="white-space:pre-wrap;margin-bottom:10px">'+esc(Object.keys(note).join('\n'))+'</div>';
  if(vehNames.length) h+='<div class="flabel">車両</div><div style="margin-bottom:10px">🚚 '+esc(vehNames.join('・'))+'</div>';
  if(mats.length) h+='<div class="flabel">使用材料</div><div style="margin-bottom:10px">'+mats.map(function(m){ return esc((m['品名']||'')+(m['規格']?' '+m['規格']:'')+'　'+(m['数量']||'')+(m['単位']||''))+(CAN.admin()&&m['金額']?'<span class="muted xs">（'+Number(U.numv(m['金額'])).toLocaleString()+'円）</span>':''); }).join('<br>')+'</div>';
  if(!canEdit&&CAN.reports()) h+='<div class="hint">自分が入っていない日報は、管理者だけが直せます。</div>';
  var sh=GK.sheet({ title:'日報', html:h, foot:canEdit?'<button type="button" class="btn danger" data-del>削除</button><button type="button" class="btn primary" data-ed>直す</button>':'' });
  if(!canEdit) return;
  sh.$('[data-ed]').onclick=function(){ sh.close(); GK.go('/report/edit?pid='+encodeURIComponent(pid)+'&date='+encodeURIComponent(date)); };
  sh.$('[data-del]').onclick=function(){
    GK.confirm(U.md(date)+'「'+(p?D.pname(p):'現場なし')+'」の日報（'+g.length+'名分）を削除しますか？',{ok:'削除する',danger:true}).then(function(y){ if(!y) return;
      GK.busy(true,'削除中…');
      deleteGroup(pid,date,g).then(function(){ sh.close(); GK.toast('削除しました'); return D.loadRD(); })
        .catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); D.loadRD().catch(function(){}); }).finally(function(){ GK.busy(false); }); });
  };
}
function deleteGroup(pid,date,grp){
  if(D.features&&D.features.groupOps) return API.write('deleteReportGroup',{pid:pid,date:date,ids:grp.map(function(r){ return r['日報ID']; }).join(',')});
  if(!CAN.admin()&&grp.some(function(r){ return String(r['作業員ID'])!==myId(); })) return Promise.reject(new Error('他の人の分を含む日報は、管理者に削除を依頼してください'));
  return Promise.all(grp.map(function(r){ return API.write('deleteReport',{id:r['日報ID']}); }));
}

/* ===================== 入力フォーム ===================== */
function renderForm(view,edit,q){
  if(!CAN.reports()){ view.innerHTML='<div class="card">この権限では日報を書けません。</div>'; return; }
  var isEdit=!!edit, orig=isEdit?groupRows(edit.pid,edit.date):[];
  if(isEdit&&!orig.length){
    view.innerHTML=D.t.rd?'<div class="card">この日報は見つかりませんでした（削除された可能性があります）。</div>':'<div class="skel"></div>';
    if(!D.t.rd) D.ensure('rd').then(function(){ GK.refresh(); }).catch(function(){});
    return;
  }
  var me=myId(), g0=orig[0]||{};
  var st={
    date:isEdit?edit.date:(q.get('date')||U.today()),
    pid:isEdit?edit.pid:(q.get('pid')||''),
    ws:{}, nextDay:isEdit?!!String(g0['翌日']||''):false,
    veh:{}, none:isEdit&&!edit.pid   /* none＝「現場なし（事務所・その他）」を選んだ */
  };
  if(isEdit) orig.forEach(function(r){ st.ws[String(r['作業員ID'])]=1; String(r['車両']||'').split(',').forEach(function(v){ v=v.trim(); if(v) st.veh[v]=1; }); });
  else if(q.get('names')){ var names={}; U.ownerTokens(q.get('names')).forEach(function(n){ names[n]=1; });
    activeWorkers().forEach(function(w){ if(names[U.normName(w['略称'])]||names[U.normName(w['氏名'])]) st.ws[String(w['作業員ID'])]=1; }); }
  if(!isEdit&&!Object.keys(st.ws).length&&me) st.ws[me]=1;
  var br0=isEdit?(U.numv(g0['休憩分'])||0):60;
  var h='';
  h+='<div class="card">';
  h+='<div class="grid2"><label class="fld"><span>日付<span class="req">*</span></span><input type="date" data-f="date" value="'+esc(st.date)+'"></label>'+
     '<label class="fld"><span>現場<span class="req">*</span></span><select data-f="pid"></select></label></div>';
  h+='<div class="chips scroll" data-recent style="margin:-4px 0 10px"></div>';
  h+='<div class="grid3"><label class="fld"><span>開始</span><input type="time" step="300" data-f="st" value="'+esc(isEdit&&g0['開始']?U.hm(g0['開始']):'08:00')+'"></label>'+
     '<label class="fld"><span>終了</span><input type="time" step="300" data-f="et" value="'+esc(isEdit&&g0['終了']?U.hm(g0['終了']):'17:00')+'"></label>'+
     '<label class="fld"><span>休憩（時間）</span><input type="time" step="300" data-f="br" value="'+U.pad(Math.floor(br0/60))+':'+U.pad(br0%60)+'"></label></div>';
  h+='<label class="toggle" style="margin:-6px 0 6px"><input type="checkbox" data-f="nd"'+(st.nextDay?' checked':'')+'> 終了が翌日（夜勤など）</label>';
  h+='<div class="calcbox" data-calc></div>';
  h+='</div>';
  h+='<div class="card"><div class="row"><div class="flabel grow" style="margin:0">作業員<span class="req">*</span></div><span class="small muted" data-wn></span></div><div data-ws></div></div>';
  h+='<div class="card"><label class="fld"><span>作業内容</span><textarea data-f="desc" maxlength="1000" placeholder="例：2F 照明器具取付・配線">'+esc(isEdit?(g0['作業内容']||''):'')+'</textarea></label><div class="chips" data-sugg></div>'+
     '<label class="fld mt12"><span>備考</span><textarea data-f="note" maxlength="1000" style="min-height:64px">'+esc(isEdit?(g0['備考']||''):'')+'</textarea></label>'+
     (D.vehicles.length?'<div class="flabel">車両</div><div class="pick" data-veh>'+D.vehicles.map(function(v){ var id=String(v['車両ID']); return '<label><input type="checkbox" value="'+esc(id)+'"'+(st.veh[id]?' checked':'')+'><span>🚚 '+esc(v['車両名']||id)+'</span></label>'; }).join('')+'</div>':'')+
     '<div data-mats></div></div>';
  h+='<div class="btns" style="margin-bottom:24px">'+(isEdit?'<button type="button" class="btn danger" data-del>削除</button>':'')+'<button type="button" class="btn primary" data-save style="flex:2">'+(isEdit?'直して保存':'保存する')+'</button></div>';
  view.innerHTML=h;
  var $=function(s){ return view.querySelector(s); }, f=function(n){ return $('[data-f="'+n+'"]'); };

  function projOptions(){
    var arr=D.activeProjects(), cur=st.pid, has=false;
    var o='<option value="">（選んでください）</option>';
    arr.forEach(function(p){ var id=String(p['案件ID']); if(id===cur) has=true; o+='<option value="'+esc(id)+'"'+(id===cur?' selected':'')+'>'+esc(D.pname(p))+'</option>'; });
    if(cur&&!has){ var cp=D.project(cur); o+='<option value="'+esc(cur)+'" selected>'+esc(cp?D.pname(cp):(g0['案件名']||cur))+'</option>'; }
    o+='<option value="__pick">他の現場を探す…</option><option value="__none"'+(st.none?' selected':'')+'>現場なし（事務所・その他）</option>';
    f('pid').innerHTML=o;
  }
  function recents(){
    var seen={}, out=[];
    D.reports.slice().sort(function(a,b){ return String(U.d10(b['日付'])).localeCompare(String(U.d10(a['日付']))); }).some(function(r){
      if(String(r['作業員ID'])!==me) return false; var id=String(r['案件ID']||''); if(!id||seen[id]||!D.project(id)) return false; seen[id]=1; out.push(id); return out.length>=4; });
    $('[data-recent]').innerHTML=out.length?out.map(function(id){ return '<button type="button" class="chip'+(id===st.pid?' on':'')+'" data-pid="'+esc(id)+'">'+esc(D.pname(D.project(id)))+'</button>'; }).join(''):'';
  }
  function workersHtml(){
    var ws=activeWorkers(), a=ws.filter(function(w){ return !D.isPartner(w); }), b=ws.filter(D.isPartner);
    /* 編集中の日報に、いまは停止中の作業員が入っていても外れないように表示する */
    Object.keys(st.ws).forEach(function(id){ if(!ws.some(function(w){ return String(w['作業員ID'])===id; })){ var r=orig.filter(function(x){ return String(x['作業員ID'])===id; })[0]; a.push(D.worker(id)||{'作業員ID':id,'氏名':(r&&r['氏名'])||id}); } });
    function pick(list){ return '<div class="pick">'+list.map(function(w){ var id=String(w['作業員ID']); return '<label><input type="checkbox" value="'+esc(id)+'"'+(st.ws[id]?' checked':'')+'><span>'+esc(D.wname(w))+(id===me?'（自分）':'')+'</span></label>'; }).join('')+'</div>'; }
    $('[data-ws]').innerHTML=(a.length?'<div class="pick-h">社員</div>'+pick(a):'')+(b.length?'<div class="pick-h">協力業者</div>'+pick(b):'')+(ws.length?'':'<div class="small muted">作業員を読み込み中…</div>');
    countW();
  }
  function countW(){ var n=Object.keys(st.ws).length; $('[data-wn]').textContent=n?n+'名':''; calc(); }
  function calc(){
    var c=timeCalc(f('st').value,f('et').value,f('br').value,f('nd').checked), n=Object.keys(st.ws).length, el=$('[data-calc]');
    if(c.err){ el.innerHTML='⚠ '+esc(c.err); return c; }
    var s='<span class="small">実働 '+fmtHM(c.work)+'</span>　<b>'+c.nk+' 人工'+(c.ynk?'＋深夜 '+c.ynk:'')+'</b>';
    if(n>1) s+='<span class="small"> × '+n+'名 ＝ 計 '+U.round2(c.nk*n)+' 人工'+(c.ynk?'＋深夜 '+U.round2(c.ynk*n):'')+'</span>';
    el.innerHTML=s; return c;
  }
  var estCache={};
  function sugg(){
    var el=$('[data-sugg]'), pid=st.pid; if(!pid){ el.innerHTML=''; return; }
    var seen={}, out=[];
    D.reports.filter(function(r){ return String(r['案件ID'])===pid&&r['作業内容']; }).sort(function(a,b){ return String(U.d10(b['日付'])).localeCompare(String(U.d10(a['日付']))); })
      .some(function(r){ var t=String(r['作業内容']).split('\n')[0].slice(0,40); if(seen[t]) return false; seen[t]=1; out.push(t); return out.length>=5; });
    var est=(estCache[pid]||[]).filter(function(t){ return !seen[t]; }).slice(0,8);
    el.innerHTML=(out.length?out.map(function(t){ return '<button type="button" class="chip" data-t="'+esc(t)+'">↺ '+esc(t)+'</button>'; }).join(''):'')+est.map(function(t){ return '<button type="button" class="chip" data-t="'+esc(t)+'">＋ '+esc(t)+'</button>'; }).join('');
    if(D.features&&D.features.estWorkItems&&!estCache[pid]){ estCache[pid]=[];
      API.get('estWorkItems',{id:pid},{retry:0,timeout:15000}).then(function(res){ if(res&&res.ok){ estCache[pid]=(res.items||[]).map(function(x){ return String(x.n||'').slice(0,40); }).filter(Boolean); if(st.pid===pid) sugg(); } }).catch(function(){}); }
  }
  function mats(){
    var el=$('[data-mats]'); if(!isEdit||!D.features||!D.features.reportMaterials){ el.innerHTML=''; return; }
    var ms=D.reportMaterials.filter(function(m){ return String(m['日報キー'])===grpKey(edit.pid,edit.date); });
    el.innerHTML=ms.length?'<div class="flabel mt12">使用材料（Gen-Canの日報で入力・そのまま引き継ぎます）</div><div class="small">'+ms.map(function(m){ return esc((m['品名']||'')+'　'+(m['数量']||'')+(m['単位']||'')); }).join('<br>')+'</div>':'';
  }
  projOptions(); recents(); workersHtml(); calc(); sugg(); mats();
  f('pid').onchange=function(){
    var v=f('pid').value;
    if(v==='__pick'){ GK.pickProject().then(function(p){ if(p){ st.pid=String(p['案件ID']); st.none=false; } projOptions(); recents(); sugg(); }); return; }
    st.none=(v==='__none'); st.pid=st.none?'':v; recents(); sugg(); };
  $('[data-recent]').onclick=function(e){ var b=e.target.closest('[data-pid]'); if(!b) return; st.pid=b.dataset.pid; st.none=false; projOptions(); recents(); sugg(); };
  $('[data-ws]').onchange=function(e){ var c=e.target; if(c.type!=='checkbox') return; if(c.checked) st.ws[c.value]=1; else delete st.ws[c.value]; countW(); };
  ['st','et','br'].forEach(function(n){ f(n).oninput=calc; }); f('nd').onchange=calc;
  f('date').onchange=function(){ st.date=f('date').value; };
  $('[data-sugg]').onclick=function(e){ var b=e.target.closest('[data-t]'); if(!b) return; var ta=f('desc'); ta.value=(ta.value.trim()?ta.value.replace(/\s+$/,'')+'\n':'')+b.dataset.t; ta.focus(); };
  var vb=$('[data-veh]'); if(vb) vb.onchange=function(e){ var c=e.target; if(c.checked) st.veh[c.value]=1; else delete st.veh[c.value]; };
  var dl=$('[data-del]'); if(dl) dl.onclick=function(){
    GK.confirm('この日報（'+orig.length+'名分）を削除しますか？',{ok:'削除する',danger:true}).then(function(y){ if(!y) return;
      GK.busy(true,'削除中…');
      deleteGroup(edit.pid,edit.date,orig).then(function(){ GK.toast('削除しました'); return D.loadRD(); }).then(function(){ GK.go('/reports',true); })
        .catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); }); };

  $('[data-save]').onclick=function(){
    var date=f('date').value, pid=st.pid, p=D.project(pid);
    if(!date){ GK.toast('日付を入力してください',{err:true}); return; }
    if(!pid&&!st.none){ GK.toast('現場を選んでください',{err:true}); return; }
    var wids=Object.keys(st.ws);
    if(!wids.length){ GK.toast('作業員を選んでください',{err:true}); return; }
    var c=calc(); if(c.err){ GK.toast(c.err,{err:true}); return; }
    var ws=wids.map(function(id){ var w=D.worker(id); if(w) return w; var r=orig.filter(function(x){ return String(x['作業員ID'])===id; })[0]; return {'作業員ID':id,'氏名':(r&&r['氏名'])||'','区分':(r&&r['区分'])||'','所属':(r&&r['所属'])||''}; });
    var origIds={}; orig.forEach(function(r){ origIds[String(r['日報ID'])]=1; });
    var moved=isEdit&&grpKey(edit.pid,edit.date)!==grpKey(pid,date);
    /* 同じ日・同じ現場に同じ人が登録済みなら止める（Gen-Canと同じ） */
    if(!isEdit||moved){
      var same=groupRows(pid,date).filter(function(r){ return !origIds[String(r['日報ID'])]; });
      var dup=ws.filter(function(w){ return same.some(function(r){ return String(r['作業員ID'])===String(w['作業員ID']); }); });
      if(dup.length){ GK.toast('⚠ '+dup.map(function(w){ return w['氏名']; }).join('、')+' は同じ日に同じ現場で登録済みです',{err:true}); return; }
    }
    /* 1日の上限：通常＋深夜の合計1.5人工まで（全現場合算・Gen-Canと同じ） */
    var add=c.nk+c.ynk, over=[];
    ws.forEach(function(w){ var cur=0;
      D.reports.forEach(function(r){ if(U.d10(r['日付'])!==date||String(r['作業員ID'])!==String(w['作業員ID'])||origIds[String(r['日報ID'])]) return; cur+=U.numv(r['人工'])+U.numv(r['深夜人工']); });
      if(cur+add>1.5+1e-9) over.push((w['氏名']||'')+'（登録済 '+U.round2(cur)+'＋今回 '+U.round2(add)+'）'); });
    if(over.length){ GK.toast('⚠ 1日の上限は合計1.5人工までです：'+over.join('、'),{err:true,ms:7000}); return; }
    var data={'日付':date,'案件ID':pid,'案件名':p?(p['案件名']||''):'','作業内容':f('desc').value.trim(),'人工':String(c.nk),'開始':f('st').value,'終了':f('et').value,
      '翌日':f('nd').checked?'1':'','休憩分':String(c.brMin),'作業時間':String(c.minutes),'深夜人工':String(c.ynk),'備考':f('note').value.trim(),'車両':Object.keys(st.veh).join(',')};
    data['_workers']=ws.map(function(w){ return {'作業員ID':String(w['作業員ID']),'氏名':w['氏名']||'','区分':w['区分']||'','所属':w['所属']||''}; });
    if(D.features&&D.features.reportMaterials){
      /* 材料：新規は無し（Gen-Canと同じく空で送る）。編集時は元の日報の材料をそのまま引き継ぐ */
      data['_materials']=isEdit?D.reportMaterials.filter(function(m){ return String(m['日報キー'])===grpKey(edit.pid,edit.date); }).map(function(m){
        var pr=D.products.filter(function(x){ return String(x['商品ID'])===String(m['商品ID']); })[0];
        if(m['商品ID']&&pr) return {i:String(m['商品ID']),q:String(U.round2(U.numv(m['数量'])))};
        var o={n:String(m['品名']||''),u:String(m['単位']||''),q:String(U.round2(U.numv(m['数量'])))}; if(m['商品ID']) o.i=String(m['商品ID']); return o; }).filter(function(o){ return (o.i||o.n)&&U.numv(o.q)>0; }):[];
    }
    var job;
    if(!isEdit) job=API.write('addReportMulti',{data:data});
    else if(D.features&&D.features.groupOps) job=API.write('replaceReportGroup',{pid:edit.pid,date:edit.date,ids:orig.map(function(r){ return r['日報ID']; }).join(','),data:data});
    else {
      if(!CAN.admin()&&orig.some(function(r){ return String(r['作業員ID'])!==me; })){ GK.toast('他の人の分を含む日報は、管理者に直してもらってください',{err:true}); return; }
      job=Promise.all(orig.map(function(r){ return API.write('deleteReport',{id:r['日報ID']}); })).then(function(){ return API.write('addReportMulti',{data:data}); });
    }
    var btn=$('[data-save]'); btn.disabled=true;
    GK.busy(true,'保存中…');
    job.then(function(){ return true; },function(err){
      /* 通信が途中で切れても、実は保存できていることがある → 読み直して確認してから失敗を伝える（二重登録防止） */
      if(isEdit) throw err;
      return D.loadRD().then(function(){ var hit=D.reports.some(function(r){ return U.d10(r['日付'])===date&&String(r['案件ID']||'')===String(pid)&&String(r['作業員ID'])===String(ws[0]['作業員ID']); });
        if(hit) return true; throw err; },function(){ throw err; });
    }).then(function(){
      try{ localStorage.setItem('gc_pref_last_report_date',date); }catch(e){}   /* Gen-Canホームの「日報がまだ」通知と共有 */
      GK.toast(isEdit?'日報を直しました':ws.length+'名分の日報を保存しました');
      return D.loadRD().catch(function(){}).then(function(){ GK.go('/reports?d='+encodeURIComponent(date),true); });
    }).catch(function(err){ btn.disabled=false; GK.toast('保存できませんでした：'+err.message,{err:true,ms:7000}); }).finally(function(){ GK.busy(false); });
  };
  var off=GK.on('data',function(k){ if(k==='rd'){ projOptions(); recents(); if(!view.querySelector('[data-ws] input')) workersHtml(); } });
  if(!D.t.rd) D.ensure('rd').catch(function(){});
  return off;
}

/* ===================== 人員配置（週間ボード） ===================== */
var BS={ mode:'person', week:'' };
function weekStart(s){ var d=U.parse(s)||new Date(); var dow=(d.getDay()+6)%7; d.setDate(d.getDate()-dow); return U.ymd(d); }
var PAL=['#2563eb','#0891b2','#7c3aed','#db2777','#ea580c','#16a34a','#ca8a04','#4f46e5','#0d9488','#9333ea','#be123c','#0369a1'];
function pcolor(id){ id=String(id||''); var h=0; for(var i=0;i<id.length;i++) h=(h*31+id.charCodeAt(i))>>>0; return PAL[h%PAL.length]; }
function renderBoard(view,params,q){
  if(!CAN.board()){ view.innerHTML='<div class="card">人員配置は社員以上の権限で表示できます。</div>'; return; }
  if(q.get('w')) BS.week=weekStart(q.get('w'));
  if(!BS.week) BS.week=weekStart(U.today());
  view.innerHTML=segNav('board')+'<div class="row" style="margin-bottom:10px"><button type="button" class="btn sm" data-prev aria-label="前の週">◀</button><div class="grow center"><b data-wl></b><div class="xs muted"><a href="#" data-this>今週に戻る</a></div></div><button type="button" class="btn sm" data-next aria-label="次の週">▶</button></div>'+
    '<div class="seg" data-mode><button type="button" data-v="person">人で見る</button><button type="button" data-v="site">現場で見る</button></div><div data-body></div>'+
    '<div class="hint mt8">予定（スケジュール）の「担当」をもとに表示しています。空いているマスをタップすると配置を追加できます'+(CAN.admin()?'（変更・削除もできます）':'（変更・削除は管理者のみ）')+'。</div>';
  bindSeg(view);
  view.querySelector('[data-prev]').onclick=function(){ BS.week=U.addDays(BS.week,-7); draw(); };
  view.querySelector('[data-next]').onclick=function(){ BS.week=U.addDays(BS.week,7); draw(); };
  view.querySelector('[data-this]').onclick=function(e){ e.preventDefault(); BS.week=weekStart(U.today()); draw(); };
  view.querySelector('[data-mode]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; BS.mode=b.dataset.v; draw(); };
  var cells={};
  function draw(){
    U.$$('[data-mode] button',view).forEach(function(b){ b.classList.toggle('on',b.dataset.v===BS.mode); });
    var days=[]; for(var i=0;i<7;i++) days.push(U.addDays(BS.week,i));
    view.querySelector('[data-wl]').textContent=U.mdS(days[0])+' 〜 '+U.mdS(days[6]);
    var body=view.querySelector('[data-body]');
    if(!D.t.cal&&!D.schedules.length){ body.innerHTML='<div class="skel"></div><div class="skel"></div>'; return; }
    var ws=activeWorkers(), look={};
    ws.forEach(function(w){ var a=U.normName(w['略称']), b=U.normName(w['氏名']); if(a&&!look[a]) look[a]=w; if(b&&!look[b]) look[b]=w; });
    cells={}; var others={}, siteRows={};
    D.schedules.forEach(function(s){
      var a=U.d10(s['日付']); if(!a) return; var b=U.d10(s['終了日'])||a; if(b<days[0]||a>days[6]) return;
      var toks=U.ownerTokens(s['担当']);
      days.forEach(function(d){ if(d<a||d>b) return;
        toks.forEach(function(t){ var w=look[t]; var key=w?'w:'+w['作業員ID']:'o:'+t; if(!w) others[t]=1;
          var ck=key+'|'+d; (cells[ck]=cells[ck]||[]).push(s); });
        var pid=String(s['案件ID']||'__none'); siteRows[pid]=1; var sk='p:'+pid+'|'+d; (cells[sk]=cells[sk]||[]).push(s);
      });
    });
    var today=U.today();
    var head='<thead><tr><th class="nm">'+(BS.mode==='person'?'作業員':'現場')+'</th>'+days.map(function(d){ var dw=U.parse(d).getDay(); return '<th class="'+(d===today?'today':(dw===0||dw===6?'we':''))+'">'+U.mdS(d)+'<br>'+U.DOW[dw]+'</th>'; }).join('')+'</tr></thead>';
    var rows='';
    if(BS.mode==='person'){
      var list=ws.map(function(w){ return {key:'w:'+w['作業員ID'],label:D.wname(w),w:w}; }).concat(Object.keys(others).map(function(t){ return {key:'o:'+t,label:t+'（未登録）'}; }));
      list.forEach(function(r){ rows+='<tr><th class="nm" title="'+esc(r.label)+'">'+esc(r.label)+'</th>'+days.map(function(d){ var arr=cells[r.key+'|'+d]||[], dw=U.parse(d).getDay();
        return '<td class="'+(d===today?'today ':'')+(dw===0||dw===6?'we ':'')+(arr.length?'':'free')+'" data-c="'+esc(r.key+'|'+d)+'">'+(arr.length?arr.map(function(s){ var p=D.project(s['案件ID']); return '<span class="bchip" style="background:'+pcolor(s['案件ID'])+'">'+esc(p?D.pname(p):(s['案件名']||s['予定内容']||'予定'))+'</span>'; }).join(''):'空き')+'</td>'; }).join('')+'</tr>'; });
    } else {
      var pids=Object.keys(siteRows);
      D.activeProjects().forEach(function(p){ if(D.status(p)==='施工中'&&pids.indexOf(String(p['案件ID']))<0) pids.push(String(p['案件ID'])); });
      if(!pids.length){ body.innerHTML='<div class="empty">この週の予定はありません</div>'; return; }
      pids.forEach(function(pid){ var p=D.project(pid), label=pid==='__none'?'現場なし':(p?D.pname(p):pid);
        rows+='<tr><th class="nm" title="'+esc(label)+'">'+esc(label)+'</th>'+days.map(function(d){ var arr=cells['p:'+pid+'|'+d]||[], dw=U.parse(d).getDay(); var names=[];
          arr.forEach(function(s){ U.ownerTokens(s['担当']).forEach(function(t){ var w=look[t]; var n=w?D.wname(w):t; if(names.indexOf(n)<0) names.push(n); }); });
          return '<td class="'+(d===today?'today ':'')+(dw===0||dw===6?'we ':'')+(names.length?'':'free')+'" data-c="'+esc('p:'+pid+'|'+d)+'">'+(names.length?names.map(function(n){ return '<span class="bchip" style="background:'+pcolor(pid)+'">'+esc(n)+'</span>'; }).join(''):'—')+'</td>'; }).join('')+'</tr>'; });
    }
    body.innerHTML='<div class="board"><table>'+head+'<tbody>'+rows+'</tbody></table></div>';
  }
  view.querySelector('[data-body]').onclick=function(e){
    var td=e.target.closest('[data-c]'); if(!td) return;
    var ck=td.dataset.c, arr=cells[ck]||[], k=ck.split('|'), key=k[0], day=k[1];
    if(arr.length) schedSheet(arr,key,day,draw);
    else if(key.indexOf('w:')===0) assignSheet({day:day,wid:key.slice(2)},draw);
    else if(key.indexOf('p:')===0&&key!=='p:__none') assignSheet({day:day,pid:key.slice(2)},draw);
  };
  draw();
  D.ensure('cal',60000).catch(function(e){ var b=view.querySelector('[data-body]'); if(b) b.innerHTML='<div class="card">予定を読み込めませんでした：'+esc(e.message)+'</div>'; });
  return GK.on('data',function(){ draw(); });
}

/* マスの予定を見る（管理者は外す・削除できる） */
function schedSheet(arr,key,day,redraw){
  var uniq=[]; arr.forEach(function(s){ if(uniq.indexOf(s)<0) uniq.push(s); });
  var wkr=key.indexOf('w:')===0?D.worker(key.slice(2)):null;
  var h=uniq.map(function(s,i){ var p=D.project(s['案件ID']), a=U.d10(s['日付']), b=U.d10(s['終了日']);
    return '<div class="card" style="padding:12px"><div style="font-weight:900">'+esc(p?D.pname(p):(s['案件名']||'現場なし'))+'</div><div class="small">'+esc(U.md(a)+(b&&b!==a?' 〜 '+U.md(b):'')+(U.hm(s['開始'])?'　'+U.hm(s['開始'])+'〜'+U.hm(s['終了']):''))+'</div>'+
      '<div class="small muted">'+esc([s['区分'],s['予定内容']].filter(Boolean).join('・'))+'</div><div class="small">担当：'+esc(s['担当']||'')+'</div>'+
      '<div class="btns mt8">'+(CAN.reports()&&p?'<button type="button" class="btn sm" data-rep="'+i+'">📝 日報を書く</button>':'')+
      (CAN.admin()&&wkr?'<button type="button" class="btn sm" data-out="'+i+'">'+esc(D.wname(wkr))+'を外す</button>':'')+
      (CAN.admin()?'<button type="button" class="btn sm danger" data-del="'+i+'">予定を削除</button>':'')+'</div></div>'; }).join('');
  var canAdd=key.indexOf('w:')===0||(key.indexOf('p:')===0&&key!=='p:__none');
  var sh=GK.sheet({ title:U.md(day)+(wkr?'　'+D.wname(wkr):''), html:h, foot:canAdd?'<button type="button" class="btn" data-add>＋ 配置を追加</button>':'' });
  sh.body.onclick=function(e){
    var b=e.target.closest('[data-rep],[data-out],[data-del]'); if(!b) return;
    var s=uniq[+(b.dataset.rep||b.dataset.out||b.dataset.del)];
    if(b.dataset.rep!=null){ sh.close(); GK.go('/report/new?pid='+encodeURIComponent(s['案件ID'])+'&date='+encodeURIComponent(day)+'&names='+encodeURIComponent(s['担当']||'')); return; }
    if(b.dataset.out!=null){
      var names={}; [wkr['略称'],wkr['氏名']].forEach(function(n){ n=U.normName(n); if(n) names[n]=1; });
      var rest=String(s['担当']||'').split(/[・、,，\/\s　]+/).filter(function(t){ return t&&!names[U.normName(t)]; });
      var msg=rest.length?D.wname(wkr)+' をこの予定から外しますか？\n（予定の期間すべてから外れます）':D.wname(wkr)+' を外すと担当者がいなくなるため、予定ごと削除します。よろしいですか？';
      GK.confirm(msg,{ok:rest.length?'外す':'削除する',danger:true}).then(function(y){ if(!y) return;
        GK.busy(true,'保存中…');
        (rest.length?API.write('updateSchedule',{id:s['予定ID'],data:{'担当':rest.join('・')}}):API.write('deleteSchedule',{id:s['予定ID']}))
          .then(function(){ sh.close(); GK.toast('保存しました'); return D.loadCal(); }).catch(function(err){ GK.toast('保存できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); });
      return;
    }
    GK.confirm('この予定を削除しますか？\n（担当：'+(s['担当']||'')+'）',{ok:'削除する',danger:true}).then(function(y){ if(!y) return;
      GK.busy(true,'削除中…');
      API.write('deleteSchedule',{id:s['予定ID']}).then(function(){ sh.close(); GK.toast('削除しました'); return D.loadCal(); }).catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); });
  };
  var ad=sh.$('[data-add]'); if(ad) ad.onclick=function(){ sh.close(); assignSheet(key.indexOf('w:')===0?{day:day,wid:key.slice(2)}:{day:day,pid:key.slice(2)},redraw); };
}

/* 配置（予定）を追加 */
function assignSheet(o,redraw){
  var ws=activeWorkers(), sel={}; if(o.wid) sel[o.wid]=1;
  var pid=o.pid||'';
  var h='<label class="fld"><span>現場<span class="req">*</span></span><select data-p></select></label>'+
    '<div class="grid2"><label class="fld"><span>開始日<span class="req">*</span></span><input type="date" data-s value="'+esc(o.day)+'"></label><label class="fld"><span>終了日</span><input type="date" data-e value="'+esc(o.day)+'"></label></div>'+
    '<div class="grid2"><label class="fld"><span>区分</span><select data-k><option>工事</option><option>現場調査</option><option>打ち合わせ</option><option>その他</option></select></label><label class="fld"><span>予定内容</span><input data-t maxlength="60" placeholder="例：配線工事"></label></div>'+
    '<div class="grid2"><label class="fld"><span>開始時刻</span><input type="time" step="300" data-st value="08:00"></label><label class="fld"><span>終了時刻</span><input type="time" step="300" data-et value="17:00"></label></div>'+
    '<div class="flabel">担当<span class="req">*</span></div><div data-w></div>';
  var sh=GK.sheet({ title:'配置を追加', html:h, foot:'<button type="button" class="btn primary" data-save>追加する</button>' });
  function opts(){ var arr=D.activeProjects(), has=false, o2='<option value="">（選んでください）</option>';
    arr.forEach(function(p){ var id=String(p['案件ID']); if(id===pid) has=true; o2+='<option value="'+esc(id)+'"'+(id===pid?' selected':'')+'>'+esc(D.pname(p))+'</option>'; });
    if(pid&&!has){ var cp=D.project(pid); o2+='<option value="'+esc(pid)+'" selected>'+esc(cp?D.pname(cp):pid)+'</option>'; }
    o2+='<option value="__pick">他の現場を探す…</option>'; sh.$('[data-p]').innerHTML=o2; }
  opts();
  sh.$('[data-p]').onchange=function(){ if(this.value==='__pick'){ GK.pickProject().then(function(p){ if(p) pid=String(p['案件ID']); opts(); }); } else pid=this.value; };
  var a=ws.filter(function(w){ return !D.isPartner(w); }), b=ws.filter(D.isPartner);
  function pk(list){ return '<div class="pick">'+list.map(function(w){ var id=String(w['作業員ID']); return '<label><input type="checkbox" value="'+esc(id)+'"'+(sel[id]?' checked':'')+'><span>'+esc(D.wname(w))+'</span></label>'; }).join('')+'</div>'; }
  sh.$('[data-w]').innerHTML=(a.length?'<div class="pick-h">社員</div>'+pk(a):'')+(b.length?'<div class="pick-h">協力業者</div>'+pk(b):'');
  sh.$('[data-w]').onchange=function(e){ var c=e.target; if(c.checked) sel[c.value]=1; else delete sel[c.value]; };
  sh.$('[data-save]').onclick=function(){
    var s=sh.$('[data-s]').value, e=sh.$('[data-e]').value||s, p=D.project(pid);
    if(!pid||!p){ GK.toast('現場を選んでください',{err:true}); return; }
    if(!s){ GK.toast('開始日を入力してください',{err:true}); return; }
    if(e<s){ GK.toast('終了日が開始日より前になっています',{err:true}); return; }
    var ids=Object.keys(sel); if(!ids.length){ GK.toast('担当を選んでください',{err:true}); return; }
    var names=ids.map(function(id){ return D.wname(D.worker(id)); }).filter(Boolean);
    /* 同じ人がすでに別の予定に入っている日を知らせる（Gen-Canと同じく、止めずに確認） */
    var clash=[];
    ids.forEach(function(id){ var w=D.worker(id); if(!w) return;
      D.schedules.forEach(function(x){ var xa=U.d10(x['日付']), xb=U.d10(x['終了日'])||xa; if(!xa||xb<s||xa>e) return; if(D.isMine(x,w)) clash.push(D.wname(w)+'：'+U.mdS(xa)+(xb!==xa?'〜'+U.mdS(xb):'')+' '+(D.project(x['案件ID'])?D.pname(D.project(x['案件ID'])):(x['案件名']||''))); }); });
    var go=function(){
      var data={'予定ID':'','日付':s,'終了日':e===s?'':e,'案件ID':pid,'案件名':p['案件名']||'','予定内容':sh.$('[data-t]').value.trim()||sh.$('[data-k]').value,'区分':sh.$('[data-k]').value,'担当':names.join('・'),'開始':sh.$('[data-st]').value,'終了':sh.$('[data-et]').value,'備考':'','車両':''};
      GK.busy(true,'保存中…');
      API.write('addSchedule',{data:data}).then(function(){ sh.close(); GK.toast('配置を追加しました'); return D.loadCal(); })
        .catch(function(err){ GK.toast('追加できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); });
    };
    if(clash.length) GK.confirm('次の人はこの期間にすでに予定があります。\n\n'+clash.slice(0,8).join('\n')+(clash.length>8?'\nほか':'')+'\n\nこのまま追加しますか？',{ok:'追加する'}).then(function(y){ if(y) go(); });
    else go();
  };
}

})();
