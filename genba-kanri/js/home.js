/* 現場管理 home.js v1.0.0 — 「今日」画面と「情報・設定」画面 */
(function(){
'use strict';
var U=GK.u, D=GK.data, S=GK.session, CAN=GK.can, esc=U.esc;

GK.route('/today',{ tab:'today', title:'今日', render:renderToday });
GK.route('/settings',{ tab:'today', title:'情報・設定', back:'/today', render:renderSettings });

function renderToday(view){
  GK.setActions('<button type="button" aria-label="情報・設定" data-set>⚙ 設定</button>',function(r){ r.querySelector('[data-set]').onclick=function(){ GK.go('/settings'); }; });
  var me=S.me(), today=U.today();
  var draw=function(){
    var h='';
    h+='<div class="hello"><div class="d">'+esc(U.jp(today))+'</div><div class="n">'+esc(me.name?me.name+' さん':'ようこそ')+'</div></div>';
    if(CAN.role()==='disabled'){ view.innerHTML=h+'<div class="card">このアカウントは利用停止中です。管理者にお問い合わせください。</div>'; return; }
    h+='<div class="actions">';
    if(CAN.write()) h+=act('photo','#be185d','📷','写真を撮る','小黒板付きで撮影');
    if(CAN.reports()) h+=act('report','#047857','📝','日報を書く','今日の作業を記録');
    h+=act('issue','#b91c1c','📍','指摘・検査','図面にピンを立てる');
    h+=CAN.board()?act('board','#6d28d9','👷','人員配置','誰がどの現場か'):act('proj','#1d4ed8','🏗','現場一覧','進行中の現場');
    h+='</div>';
    h+='<div class="sec-h">📅 今日の予定<a class="more" href="#/board">週間 ›</a></div><div data-sched><div class="skel"></div></div>';
    if(CAN.reports()) h+='<div class="sec-h">📝 今日の日報<a class="more" href="#/reports">一覧 ›</a></div><div data-rep></div>';
    h+='<div class="sec-h">📍 自分が担当の指摘（未完了）<a class="more" href="#/issues">すべて ›</a></div><div data-iss><div class="skel"></div></div>';
    h+='<div class="sec-h">🏗 進行中の現場<a class="more" href="#/projects">すべて ›</a></div><div data-proj></div>';
    view.innerHTML=h;
    if(!CAN.board()){ var mb=view.querySelector('.sec-h a[href="#/board"]'); if(mb) mb.remove(); }
    view.querySelector('.actions').onclick=function(e){ var b=e.target.closest('[data-act]'); if(!b) return; go(b.dataset.act); };
    drawRep(); drawProj(); drawSched(); drawIssues();
  };
  function act(k,color,ic,l,d){ return '<button type="button" class="act" data-act="'+k+'"><span class="i" style="background:'+color+'">'+ic+'</span><span class="l">'+l+'</span><span class="d">'+d+'</span></button>'; }
  function go(k){
    if(k==='photo') GK.pickProject({title:'撮影する現場を選ぶ'}).then(function(p){ if(p) GK.go('/camera/'+encodeURIComponent(p['案件ID'])); });
    else if(k==='report') GK.go('/report/new');
    else if(k==='issue') GK.go('/issues');
    else if(k==='board') GK.go('/board');
    else GK.go('/projects');
  }
  function drawRep(){
    var el=view.querySelector('[data-rep]'); if(!el) return;
    var mine=D.reports.filter(function(r){ return U.d10(r['日付'])===today && String(r['作業員ID'])===me.id; });
    if(!mine.length){ el.innerHTML='<div class="card row"><div class="grow"><b>まだ提出していません</b><div class="small muted">作業が終わったら日報を書きましょう</div></div><a class="btn primary sm" href="#/report/new">書く</a></div>'; return; }
    el.innerHTML='<div class="list">'+mine.map(function(r){ var p=D.project(r['案件ID']);
      return '<a class="item" href="#/reports?d='+esc(today)+'"><span class="ico" style="background:var(--okSoft);color:var(--ok)">✓</span><div class="grow"><div class="t ellipsis">'+esc(p?D.pname(p):(r['案件名']||'現場なし'))+'</div><div class="s ellipsis">'+esc(U.hm(r['開始'])+'〜'+U.hm(r['終了'])+'　'+(r['作業内容']||''))+'</div></div><span class="chev">›</span></a>'; }).join('')+'</div>';
  }
  function drawProj(){
    var el=view.querySelector('[data-proj]'); if(!el) return;
    var arr=D.activeProjects().slice(0,6);
    if(!arr.length){ el.innerHTML='<div class="empty">'+(D.t.rd?'進行中の現場はありません':'読み込み中…')+'</div>'; return; }
    el.innerHTML='<div class="list">'+arr.map(function(p){ var st=D.status(p);
      return '<a class="item" href="#/project/'+encodeURIComponent(p['案件ID'])+'"><div class="grow"><div class="t ellipsis">'+esc(D.pname(p))+'</div><div class="s ellipsis">'+esc([p['顧客'],p['場所']].filter(Boolean).join('・'))+'</div></div><span class="badge '+D.statusCls(st)+'">'+esc(st)+'</span><span class="chev">›</span></a>'; }).join('')+'</div>';
  }
  function drawSched(){
    var el=view.querySelector('[data-sched]'); if(!el) return;
    if(!D.t.cal&&!D.schedules.length){ el.innerHTML='<div class="skel"></div>'; return; }
    var todays=D.schedules.filter(function(s){ return D.schedCovers(s,today); });
    var mine=todays.filter(function(s){ return D.isMine(s); });
    var list=CAN.manage()?todays:mine;
    if(!list.length){ el.innerHTML='<div class="card small muted">'+(CAN.manage()?'今日の予定はありません':'今日の自分の予定はありません')+'</div>'; return; }
    list.sort(function(a,b){ return String(U.hm(a['開始'])||'99').localeCompare(String(U.hm(b['開始'])||'99')); });
    el.innerHTML='<div class="list">'+list.slice(0,8).map(function(s){ var p=D.project(s['案件ID']); var t=U.hm(s['開始'])?U.hm(s['開始'])+(U.hm(s['終了'])?'〜'+U.hm(s['終了']):''):'終日';
      var mineMark=D.isMine(s)?'<span class="badge blue">自分</span>':'';
      return '<a class="item" href="'+(p?'#/project/'+encodeURIComponent(p['案件ID']):'#/board')+'"><div class="grow"><div class="t ellipsis">'+esc(p?D.pname(p):(s['案件名']||'予定'))+' '+mineMark+'</div><div class="s ellipsis">'+esc(t+'　'+(s['予定内容']||'')+(s['担当']?'　担当：'+s['担当']:''))+'</div></div><span class="chev">›</span></a>'; }).join('')+
      (list.length>8?'<a class="item" href="#/board"><div class="grow s">ほか '+(list.length-8)+' 件</div><span class="chev">›</span></a>':'')+'</div>';
  }
  function drawIssues(){
    var el=view.querySelector('[data-iss]'); if(!el||!GK.Issues) return;
    GK.Issues.loadAll().then(function(all){
      var mine=all.filter(function(i){ return i.cur<2 && i.assigneeId && i.assigneeId===me.id; });
      if(!mine.length){ el.innerHTML='<div class="card small muted">担当の未完了の指摘はありません</div>'; return; }
      mine.sort(function(a,b){ return String(a.due||'9999').localeCompare(String(b.due||'9999')); });
      el.innerHTML='<div class="list">'+mine.slice(0,6).map(function(i){ return GK.Issues.rowHtml(i,true); }).join('')+'</div>';
    }).catch(function(e){ el.innerHTML='<div class="card small muted">指摘を読み込めませんでした（'+esc(e.message)+'）</div>'; });
  }
  draw();
  var off=GK.on('data',function(k){ if(k==='rd'){ drawRep(); drawProj(); } if(k==='cal') drawSched(); });
  D.ensure('cal',5*60000).catch(function(){ var el=view.querySelector('[data-sched]'); if(el) el.innerHTML='<div class="card small muted">予定を読み込めませんでした</div>'; });
  return off;
}

function renderSettings(view){
  var me=S.me(), role=GK.can.role(), cur='1';
  try{ cur=localStorage.getItem('gc_pref_fontscale')||'1'; }catch(e){}
  var fs=[['1','標準'],['1.12','大きめ'],['1.25','特大']];
  var h='<div class="card"><h2>👤 ログイン中</h2><dl class="kv"><dt>氏名</dt><dd>'+esc(me.name||'—')+'</dd><dt>権限</dt><dd>'+esc(GK.roleLabel(role))+'</dd></dl>'+
    '<div class="btns mt12"><button type="button" class="btn danger" data-logout>ログアウト</button></div><div class="hint">ログアウトするとGen-Canもログアウトされます（ログインは共通です）。</div></div>';
  h+='<div class="card"><h2>🔠 文字サイズ</h2><div class="chips" data-fs>'+fs.map(function(f){ return '<button type="button" class="chip'+(f[0]===cur?' on':'')+'" data-v="'+f[0]+'">'+f[1]+'</button>'; }).join('')+'</div><div class="hint">Gen-Canと同じ設定です（この端末だけに保存）。</div></div>';
  h+='<div class="card"><h2>🔄 データ</h2><div class="btns"><button type="button" class="btn" data-reload>最新データを読み込む</button></div>'+
    '<div class="hint">データはGen-Canと同じGoogleスプレッドシート・Googleドライブに保存されます。このアプリで入力した日報・予定・写真はGen-Canにも表示されます（指摘・検査はこのアプリだけで表示）。</div></div>';
  h+='<div class="card"><h2>🧭 Gen-Can</h2><a class="btn block" href="../">Gen-Can（全機能版）を開く</a><div class="hint">見積・請求・原価・勤怠・安全書類などはGen-Canで操作します。</div></div>';
  h+='<div class="card"><h2>ℹ️ バージョン</h2><dl class="kv"><dt>アプリ</dt><dd>'+esc(GK.APP.name+' '+GK.APP.version)+'</dd><dt>更新日</dt><dd>'+esc(GK.APP.updated)+'</dd><dt>会社</dt><dd>'+esc(GK.CFG.COMPANY_NAME||'—')+'</dd></dl>'+
    '<h2 class="mt12">更新履歴</h2>'+GK.CHANGELOG.map(function(c){ return '<div class="small"><b>'+esc(c.v)+'</b>（'+esc(c.d)+'）<ul style="margin:4px 0 10px;padding-left:20px">'+c.items.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></div>'; }).join('')+'</div>';
  view.innerHTML=h;
  view.querySelector('[data-logout]').onclick=function(){ GK.confirm('ログアウトしますか？\n（Gen-Canも同時にログアウトされます）',{ok:'ログアウト',danger:true}).then(function(y){ if(y) S.logout(); }); };
  view.querySelector('[data-fs]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; GK.setFontScale(b.dataset.v); U.$$('[data-fs] .chip',view).forEach(function(c){ c.classList.toggle('on',c===b); }); };
  view.querySelector('[data-reload]').onclick=function(){
    GK.busy(true,'読み込み中…');
    Promise.all([D.loadRD(),D.loadCal()]).then(function(){ if(GK.Issues) GK.Issues.clear(); GK.toast('最新のデータを読み込みました'); }).catch(function(e){ GK.toast('読み込めませんでした：'+e.message,{err:true}); }).finally(function(){ GK.busy(false); });
  };
}

})();
