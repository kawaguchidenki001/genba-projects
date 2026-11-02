/* 現場管理 projects.js v1.0.1 — 現場一覧・現場詳細・工程表
 * データ：案件マスタ（addProject=誰でも／updateProject=管理者）・工程シート（addKoutei=誰でも／updateKoutei・deleteKoutei=管理者）
 * 金額（受注金額・実行予算）はこのアプリでは扱いません（Gen-Canで管理者が操作）。 */
(function(){
'use strict';
var U=GK.u, D=GK.data, S=GK.session, CAN=GK.can, API=GK.api, esc=U.esc;

GK.route('/projects',{ tab:'projects', title:'現場', render:renderList });
GK.route('/project/:id',{ tab:'projects', title:function(p){ var x=D.project(p.id); return x?D.pname(x):'現場'; }, back:'/projects', render:renderDetail });

var KINDS=['公共','法人','個人'];
var PALETTE=['#2563eb','#0891b2','#7c3aed','#db2777','#ea580c','#16a34a','#ca8a04','#4f46e5','#0d9488','#9333ea'];
function colorOf(s){ s=String(s||''); var h=0; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return PALETTE[h%PALETTE.length]; }
var ST_COLOR={'見積中':'#94a3b8','受注':'#7c3aed','段取済':'#0891b2','施工中':'#2563eb','完了':'#16a34a','請求済':'#64748b'};

/* ===================== 一覧 ===================== */
var listState={ q:'', st:'active', mode:'list' };
function renderList(view,params,q){
  if(q.get('mode')) listState.mode=q.get('mode');
  if(CAN.write()) GK.setActions('<button type="button" data-new>＋ 新規</button>',function(r){ r.querySelector('[data-new]').onclick=function(){ projectForm(null); }; });
  view.innerHTML='<div class="seg" data-mode><button type="button" data-v="list">一覧</button><button type="button" data-v="gantt">工程表（全現場）</button></div>'+
    '<div class="search"><span aria-hidden="true">🔍</span><input type="search" placeholder="現場名・顧客・場所で探す" data-q></div>'+
    '<div class="chips scroll" data-st style="margin-bottom:10px"></div><div data-body></div>';
  var qi=view.querySelector('[data-q]'); qi.value=listState.q;
  qi.oninput=U.debounce(function(){ listState.q=qi.value; draw(); },150);
  view.querySelector('[data-mode]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; listState.mode=b.dataset.v; draw(); };
  view.querySelector('[data-st]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; listState.st=b.dataset.v; draw(); };
  function filtered(){
    var qq=U.normName(listState.q).toLowerCase();
    return D.projects.filter(function(p){
      var st=D.status(p);
      if(listState.st==='active'&&!D.ACTIVE[st]) return false;
      if(listState.st!=='active'&&listState.st!=='all'&&st!==listState.st) return false;
      if(!qq) return true;
      return U.normName([p['案件名'],p['略称'],p['顧客'],p['場所'],p['担当']].join(' ')).toLowerCase().indexOf(qq)>=0;
    });
  }
  function draw(){
    U.$$('[data-mode] button',view).forEach(function(b){ b.classList.toggle('on',b.dataset.v===listState.mode); });
    var cnt={}; D.projects.forEach(function(p){ var s=D.status(p); cnt[s]=(cnt[s]||0)+1; });
    var act=D.projects.filter(function(p){ return D.ACTIVE[D.status(p)]; }).length;
    var chips=[['active','進行中',act]].concat(D.STATUSES.map(function(s){ return [s,s,cnt[s]||0]; })).concat([['all','すべて',D.projects.length]]);
    view.querySelector('[data-st]').innerHTML=chips.map(function(c){ return '<button type="button" class="chip'+(listState.st===c[0]?' on':'')+'" data-v="'+esc(c[0])+'">'+esc(c[1])+' <span class="n">'+c[2]+'</span></button>'; }).join('');
    var body=view.querySelector('[data-body]');
    if(!D.projects.length){ body.innerHTML=D.t.rd?'<div class="empty"><div class="big">🏗</div>現場がまだ登録されていません</div>':'<div class="skel"></div><div class="skel"></div><div class="skel"></div>'; return; }
    var arr=filtered();
    if(listState.mode==='gantt'){ body.innerHTML=''; drawAllGantt(body,arr); return; }
    arr.sort(function(a,b){ var o={'施工中':0,'段取済':1,'受注':2,'見積中':3,'完了':4,'請求済':5}; var x=(o[D.status(a)]==null?9:o[D.status(a)])-(o[D.status(b)]==null?9:o[D.status(b)]); if(x) return x;
      return String(U.d10(b['工期開始'])||'').localeCompare(String(U.d10(a['工期開始'])||'')); });
    if(!arr.length){ body.innerHTML='<div class="empty">該当する現場がありません</div>'; return; }
    var today=U.today();
    body.innerHTML='<div class="list">'+arr.slice(0,300).map(function(p){
      var st=D.status(p), s=U.d10(p['工期開始']), e=U.d10(p['工期完了']), term='';
      if(s||e) term=(s?U.mdS(s):'')+'〜'+(e?U.mdS(e):'');
      var rest='';
      if(st==='施工中'&&e){ var n=U.diffDays(today,e); rest=n<0?'<span class="late">'+(-n)+'日超過</span>':'あと'+n+'日'; }
      return '<a class="item" href="#/project/'+encodeURIComponent(p['案件ID'])+'"><div class="grow"><div class="t ellipsis">'+esc(D.pname(p))+'</div>'+
        '<div class="pj-meta">'+(p['顧客']?'<span>'+esc(p['顧客'])+'</span>':'')+(p['場所']?'<span>📍'+esc(p['場所'])+'</span>':'')+(term?'<span>🗓 '+esc(term)+'</span>':'')+(rest?'<span>'+rest+'</span>':'')+'</div></div>'+
        '<span class="badge pj-st '+D.statusCls(st)+'">'+esc(st||'—')+'</span><span class="chev">›</span></a>';
    }).join('')+'</div>'+(arr.length>300?'<div class="hint center">先頭の300件を表示しています。検索で絞り込んでください。</div>':'');
  }
  draw();
  return GK.on('data',function(k){ if(k==='rd') draw(); });
}

/* 全現場の工期を並べた工程表（タップで現場詳細へ） */
function drawAllGantt(body,arr){
  var today=U.today();
  var rows=arr.filter(function(p){ return U.d10(p['工期開始'])||U.d10(p['工期完了']); });
  if(!rows.length){ body.innerHTML='<div class="empty">工期（開始・完了日）が入っている現場がありません</div>'; return; }
  rows.sort(function(a,b){ return String(U.d10(a['工期開始'])||U.d10(a['工期完了'])).localeCompare(String(U.d10(b['工期開始'])||U.d10(b['工期完了']))); });
  var from=U.addDays(today,-14), to=U.addDays(today,75);
  var items=rows.map(function(p){ var s=U.d10(p['工期開始'])||U.d10(p['工期完了']), e=U.d10(p['工期完了'])||s; if(e<s) e=s;
    return { id:p['案件ID'], label:D.pname(p), s:s, e:e, color:ST_COLOR[D.status(p)]||'#64748b', text:D.status(p), late:false }; });
  body.appendChild(gantt(items,from,to,function(it){ GK.go('/project/'+encodeURIComponent(it.id)); }));
  var lg=document.createElement('div'); lg.className='g-legend';
  lg.innerHTML=Object.keys(ST_COLOR).map(function(k){ return '<span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+ST_COLOR[k]+';margin-right:3px"></i>'+k+'</span>'; }).join('')+'<span>赤い線＝今日</span>';
  body.appendChild(lg);
  var hint=document.createElement('div'); hint.className='hint'; hint.textContent='前後2週間〜2か月半を表示しています。横にスクロールできます。';
  body.appendChild(hint);
}

/* 手書きのガントチャート（ライブラリ不使用）
 * items: [{id,label,s,e,color,progress?,text,late}]  */
function gantt(items,from,to,onTap){
  var days=Math.max(1,U.diffDays(from,to)+1), dw=days>70?18:(days>40?24:30), today=U.today();
  var wrap=document.createElement('div'); wrap.className='gantt';
  var w=days*dw, h='';
  h+='<div class="g-inner" style="width:'+(118+w)+'px">';
  h+='<div class="g-head"><div class="g-lab">　</div><div class="g-track" style="width:'+w+'px;height:34px">';
  var lastLab=-99;
  for(var i=0;i<days;i++){ var d=U.addDays(from,i), dt=U.parse(d), dow=dt.getDay();
    /* 幅が狭い時は「月初め」と「月曜」だけ。前の見出しと3日以上離れている時だけ出す（重なり防止） */
    var showLab=dw>=24||((dt.getDate()===1||dow===1||i===0)&&i-lastLab>=3);
    if(showLab) lastLab=i;
    if(showLab) h+='<div class="g-dlab'+(dt.getDate()===1?' mon':'')+'" style="left:'+(i*dw)+'px;width:'+(dw>=24?dw:dw*3)+'px;'+(dw<24?'text-align:left;padding-left:2px':'')+'">'+(dt.getDate()===1||i===0?(dt.getMonth()+1)+'/':'')+dt.getDate()+(dw>=24?'<br>'+U.DOW[dow]:'')+'</div>'; }
  h+='</div></div>';
  items.forEach(function(it,idx){
    var s=it.s<from?from:it.s, e=it.e>to?to:it.e;
    h+='<div class="g-row" data-i="'+idx+'"><div class="g-lab" title="'+esc(it.label)+'">'+esc(it.label)+'</div><div class="g-track" style="width:'+w+'px">';
    for(var i=0;i<days;i++){ var d=U.addDays(from,i), dow=U.parse(d).getDay(); var cls=d===today?' today':(dow===0||dow===6?' we':''); if(cls) h+='<div class="g-day'+cls+'" style="left:'+(i*dw)+'px;width:'+dw+'px"></div>'; }
    if(!(it.e<from||it.s>to)){
      var left=U.diffDays(from,s)*dw, width=(U.diffDays(s,e)+1)*dw-2;
      var prog=it.progress==null?null:Math.max(0,Math.min(100,U.numv(it.progress)));
      var bg=prog==null?it.color:'linear-gradient(90deg,'+it.color+' '+prog+'%,'+it.color+'66 '+prog+'%)';
      h+='<div class="g-bar'+(it.late?' late':'')+'" style="left:'+left+'px;width:'+Math.max(dw-2,width)+'px;background:'+bg+'"><span>'+esc(it.text||'')+'</span></div>';
    }
    h+='</div></div>';
  });
  h+='</div>';
  wrap.innerHTML=h;
  wrap.addEventListener('click',function(e){ var r=e.target.closest('.g-row'); if(!r) return; onTap(items[+r.dataset.i]); });
  /* 今日が見える位置までスクロール */
  setTimeout(function(){ var off=U.diffDays(from,today)*dw; if(off>0) wrap.scrollLeft=Math.max(0,off-dw*3); },0);
  return wrap;
}
GK.gantt=gantt;

/* ===================== 詳細 ===================== */
function renderDetail(view,params){
  var id=params.id;
  var kouteiList=null, kouteiErr='';
  function draw(){
    var p=D.project(id);
    if(!p){ view.innerHTML=D.t.rd?'<div class="empty"><div class="big">❓</div>この現場は見つかりませんでした（削除された可能性があります）</div>':'<div class="skel"></div><div class="skel"></div>'; return; }
    GK.setTitle(D.pname(p));
    if(CAN.admin()) GK.setActions('<button type="button" data-ed>✏️ 編集</button>',function(r){ r.querySelector('[data-ed]').onclick=function(){ projectForm(D.project(id)); }; });
    var st=D.status(p), s=U.d10(p['工期開始']), e=U.d10(p['工期完了']), today=U.today();
    var term=(s||e)?(s?U.md(s):'未定')+' 〜 '+(e?U.md(e):'未定'):'未定';
    if(e&&st==='施工中'){ var n=U.diffDays(today,e); term+='　'+(n<0?'<span class="late">'+(-n)+'日超過</span>':'（あと'+n+'日）'); }
    var place=String(p['場所']||'');
    var h='<div class="card"><div class="row" style="align-items:flex-start"><div class="grow"><div style="font-size:19px;font-weight:900;line-height:1.35">'+esc(p['案件名']||D.pname(p))+'</div>'+(p['略称']&&p['略称']!==p['案件名']?'<div class="small muted">略称：'+esc(p['略称'])+'</div>':'')+'</div><span class="badge '+D.statusCls(st)+'">'+esc(st||'—')+'</span></div>'+
      '<dl class="kv mt8">'+
      (p['顧客']?'<dt>顧客</dt><dd>'+esc(p['顧客'])+'</dd>':'')+
      (place?'<dt>場所</dt><dd>'+esc(place)+' <a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place)+'" target="_blank" rel="noopener">地図 ›</a></dd>':'')+
      '<dt>工期</dt><dd>'+term+'</dd>'+
      (p['担当']?'<dt>担当</dt><dd>'+esc(p['担当'])+'</dd>':'')+
      (p['先方担当者']||p['電話番号']?'<dt>先方</dt><dd>'+esc(p['先方担当者']||'')+(p['電話番号']?' <a href="tel:'+esc(String(p['電話番号']).replace(/[^\d+]/g,''))+'">📞 '+esc(p['電話番号'])+'</a>':'')+'</dd>':'')+
      (p['種別']?'<dt>区分</dt><dd>'+esc(p['種別'])+'</dd>':'')+
      (p['備考']?'<dt>備考</dt><dd style="white-space:pre-wrap">'+esc(p['備考'])+'</dd>':'')+
      '</dl>'+(p['Driveフォルダ']&&/^https:\/\/drive\.google\.com\//.test(String(p['Driveフォルダ']))?'<div class="mt8"><a class="small" href="'+esc(p['Driveフォルダ'])+'" target="_blank" rel="noopener">📁 ドライブのフォルダを開く ›</a></div>':'')+'</div>';
    h+='<div class="actions">'+
      '<a class="act" href="#/photos/'+encodeURIComponent(id)+'"><span class="i" style="background:#be185d">📷</span><span class="l">工事写真</span><span class="d">撮影・台帳</span></a>'+
      '<a class="act" href="#/issues/'+encodeURIComponent(id)+'"><span class="i" style="background:#b91c1c">📍</span><span class="l">図面・指摘</span><span class="d">指摘・検査</span></a>'+
      (CAN.reports()?'<a class="act" href="#/report/new?pid='+encodeURIComponent(id)+'"><span class="i" style="background:#047857">📝</span><span class="l">日報を書く</span><span class="d">この現場で</span></a>':'')+
      '<a class="act" href="#/reports?pid='+encodeURIComponent(id)+'&p=all"><span class="i" style="background:#0369a1">📚</span><span class="l">日報の記録</span><span class="d">この現場の日報</span></a>'+
      '</div>';
    h+='<div class="sec-h">📊 工程'+(CAN.write()?'<button type="button" class="btn sm right" data-addk>＋ 工程を追加</button>':'')+'</div><div data-koutei></div>';
    h+='<div class="sec-h">📅 これからの予定</div><div data-sched></div>';
    h+='<div class="sec-h">📝 最近の日報<a class="more" href="#/reports?pid='+encodeURIComponent(id)+'&p=all">すべて ›</a></div><div data-rep></div>';
    view.innerHTML=h;
    var ak=view.querySelector('[data-addk]'); if(ak) ak.onclick=function(){ kouteiForm(id,null,kouteiList||[],loadKoutei); };
    drawKoutei(); drawSched(); drawRep();
  }
  function drawKoutei(){
    var el=view.querySelector('[data-koutei]'); if(!el) return;
    if(kouteiList==null){ el.innerHTML=kouteiErr?'<div class="card small muted">工程を読み込めませんでした（'+esc(kouteiErr)+'）</div>':'<div class="skel"></div>'; return; }
    var p=D.project(id)||{};
    if(!kouteiList.length){ el.innerHTML='<div class="card small muted">工程はまだありません。'+(CAN.write()?'「＋ 工程を追加」から登録できます。':'')+'</div>'; return; }
    var today=U.today();
    var starts=kouteiList.map(function(k){ return U.d10(k['開始日']); }).filter(Boolean).concat([U.d10(p['工期開始'])].filter(Boolean));
    var ends=kouteiList.map(function(k){ return U.d10(k['終了日'])||U.d10(k['開始日']); }).filter(Boolean).concat([U.d10(p['工期完了'])].filter(Boolean));
    var from=starts.sort()[0]||today, to=ends.sort().reverse()[0]||U.addDays(from,30);
    from=U.addDays(from,-2); to=U.addDays(to,2);
    if(U.diffDays(from,to)>180) to=U.addDays(from,180);
    var items=kouteiList.map(function(k){ var s=U.d10(k['開始日'])||U.d10(k['終了日'])||today, e=U.d10(k['終了日'])||s; if(e<s) e=s; var prog=U.numv(k['進捗']);
      return { k:k, id:k['工程ID'], label:k['工程名']||'（名称なし）', s:s, e:e, color:colorOf(k['種別']||k['工程名']), progress:prog, text:prog+'%', late:(e<today&&prog<100) }; });
    el.innerHTML='';
    el.appendChild(gantt(items,from,to,function(it){ kouteiForm(id,it.k,kouteiList,loadKoutei); }));
    var done=items.filter(function(i){ return i.progress>=100; }).length, late=items.filter(function(i){ return i.late; }).length;
    var lg=document.createElement('div'); lg.className='g-legend';
    lg.innerHTML='<span>全'+items.length+'工程</span><span>完了 '+done+'</span>'+(late?'<span class="late">遅れ '+late+'</span>':'')+'<span>濃い部分＝進捗</span><span>赤い線＝今日</span>'+(CAN.admin()?'':'<span>変更・削除は管理者のみ</span>');
    el.appendChild(lg);
  }
  function drawSched(){
    var el=view.querySelector('[data-sched]'); if(!el) return;
    if(!D.t.cal&&!D.schedules.length){ el.innerHTML='<div class="skel"></div>'; return; }
    var today=U.today(), lim=U.addDays(today,14);
    var arr=D.schedules.filter(function(s){ if(String(s['案件ID'])!==String(id)) return false; var a=U.d10(s['日付']), b=U.d10(s['終了日'])||a; return b>=today&&a<=lim; })
      .sort(function(a,b){ return String(U.d10(a['日付'])).localeCompare(String(U.d10(b['日付']))); });
    if(!arr.length){ el.innerHTML='<div class="card small muted">2週間以内の予定はありません</div>'; return; }
    el.innerHTML='<div class="list">'+arr.slice(0,10).map(function(s){ var a=U.d10(s['日付']), b=U.d10(s['終了日']);
      return '<div class="item"><div class="grow"><div class="t">'+esc(U.md(a)+(b&&b!==a?' 〜 '+U.md(b):''))+'</div><div class="s">'+esc([U.hm(s['開始'])?U.hm(s['開始'])+'〜'+U.hm(s['終了']):'',s['予定内容'],s['担当']?'担当：'+s['担当']:''].filter(Boolean).join('　'))+'</div></div></div>'; }).join('')+'</div>';
  }
  function drawRep(){
    var el=view.querySelector('[data-rep]'); if(!el) return;
    var groups={};
    D.reports.forEach(function(r){ if(String(r['案件ID'])!==String(id)) return; var d=U.d10(r['日付']); (groups[d]=groups[d]||[]).push(r); });
    var days=Object.keys(groups).sort().reverse().slice(0,5);
    if(!days.length){ el.innerHTML='<div class="card small muted">日報はまだありません</div>'; return; }
    el.innerHTML='<div class="list">'+days.map(function(d){ var g=groups[d], nk=0; g.forEach(function(r){ nk+=U.numv(r['人工'])+U.numv(r['深夜人工']); });
      return '<a class="item" href="#/reports?pid='+encodeURIComponent(id)+'&p=all"><div class="grow"><div class="t">'+esc(U.md(d))+'　<span class="small muted">'+g.length+'名・'+U.round2(nk)+'人工</span></div><div class="s ellipsis">'+esc(g.map(function(r){return r['氏名'];}).join('・'))+'　'+esc(g[0]['作業内容']||'')+'</div></div><span class="chev">›</span></a>'; }).join('')+'</div>';
  }
  function loadKoutei(){
    kouteiErr='';
    return API.call('koutei',{projectId:id},{timeout:25000}).then(function(res){ kouteiList=res.koutei||[]; drawKoutei(); })
      .catch(function(e){ kouteiErr=e.message; kouteiList=null; drawKoutei(); });
  }
  draw(); loadKoutei();
  D.ensure('cal',5*60000).catch(function(){});
  return GK.on('data',function(k){ if(k==='rd'){ draw(); } if(k==='cal') drawSched(); });
}

/* ===================== 工程の追加・編集 ===================== */
function kouteiForm(pid,k,list,reload){
  var isNew=!k, canEdit=isNew?CAN.write():CAN.admin();
  if(!isNew&&!canEdit){
    var prog=U.numv(k['進捗']);
    GK.sheet({ title:'工程の内容', html:'<dl class="kv"><dt>工程名</dt><dd>'+esc(k['工程名'])+'</dd><dt>種別</dt><dd>'+esc(k['種別']||'—')+'</dd><dt>期間</dt><dd>'+esc(U.md(k['開始日'])+' 〜 '+U.md(k['終了日']))+'</dd><dt>進捗</dt><dd>'+prog+'%</dd>'+(k['備考']?'<dt>備考</dt><dd style="white-space:pre-wrap">'+esc(k['備考'])+'</dd>':'')+'</dl><div class="hint mt12">工程の変更・削除は管理者のみできます。</div>' });
    return;
  }
  var kinds={}; list.forEach(function(x){ if(x['種別']) kinds[x['種別']]=1; });
  var p=D.project(pid)||{};
  var s0=isNew?(U.d10(p['工期開始'])||U.today()):U.d10(k['開始日']);
  var e0=isNew?(U.d10(p['工期完了'])||U.addDays(s0,6)):U.d10(k['終了日']);
  if(isNew&&e0<s0) e0=s0;
  var prog0=isNew?0:U.numv(k['進捗']);
  var html='<label class="fld"><span>工程名<span class="req">*</span></span><input data-f="name" maxlength="60" value="'+esc(isNew?'':k['工程名'])+'" placeholder="例：配線工事" autofocus></label>'+
    '<label class="fld"><span>種別（色分けに使います）</span><input data-f="kind" list="gkKinds" maxlength="30" value="'+esc(isNew?'':(k['種別']||''))+'"><datalist id="gkKinds">'+Object.keys(kinds).map(function(x){ return '<option value="'+esc(x)+'">'; }).join('')+'</datalist></label>'+
    '<div class="grid2"><label class="fld"><span>開始日<span class="req">*</span></span><input type="date" data-f="s" value="'+esc(s0)+'"></label><label class="fld"><span>終了日<span class="req">*</span></span><input type="date" data-f="e" value="'+esc(e0)+'"></label></div>'+
    '<label class="fld"><span>進捗 <b data-pv>'+prog0+'%</b></span><input type="range" min="0" max="100" step="10" data-f="prog" value="'+prog0+'"></label>'+
    '<div class="chips" data-pq style="margin:-4px 0 12px">'+[0,30,50,80,100].map(function(v){ return '<button type="button" class="chip" data-v="'+v+'">'+v+'%</button>'; }).join('')+'</div>'+
    '<label class="fld"><span>備考</span><textarea data-f="note" maxlength="500">'+esc(isNew?'':(k['備考']||''))+'</textarea></label>';
  var sh=GK.sheet({ title:isNew?'工程を追加':'工程を編集', html:html,
    foot:(isNew?'':'<button type="button" class="btn danger" data-del>削除</button>')+'<button type="button" class="btn primary" data-save>保存</button>' });
  var f=function(n){ return sh.$('[data-f="'+n+'"]'); };
  f('prog').oninput=function(){ sh.$('[data-pv]').textContent=f('prog').value+'%'; };
  sh.$('[data-pq]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; f('prog').value=b.dataset.v; f('prog').oninput(); };
  sh.$('[data-save]').onclick=function(){
    var name=f('name').value.trim(), s=f('s').value, e=f('e').value;
    if(!name){ GK.toast('工程名を入力してください',{err:true}); return; }
    if(!s||!e){ GK.toast('開始日と終了日を入力してください',{err:true}); return; }
    if(e<s){ GK.toast('終了日が開始日より前になっています',{err:true}); return; }
    var data={'案件ID':pid,'工程名':name,'開始日':s,'終了日':e,'進捗':String(Math.max(0,Math.min(100,U.numv(f('prog').value)))),'種別':f('kind').value.trim(),'備考':f('note').value.trim()};
    if(isNew){ var mx=0; list.forEach(function(x){ mx=Math.max(mx,U.numv(x['並び順'])); }); data['並び順']=String(mx+1); }
    var btn=sh.$('[data-save]'); if(!GK.lockBtn(btn)) return;
    var before={}; list.forEach(function(x){ before[String(x['工程ID'])]=1; });
    GK.busy(true,'保存中…');
    API.write(isNew?'addKoutei':'updateKoutei',isNew?{data:data}:{id:k['工程ID'],data:data}).catch(function(err){
      if(!isNew) throw err;
      /* 通信切れの時は、同じ工程が増えていないか読み直して確かめる（二重登録防止） */
      var fresh=[];
      return GK.verifySaved(err,function(){ return API.call('koutei',{projectId:pid}).then(function(r){ fresh=r.koutei||[]; }); },
        function(){ return fresh.some(function(x){ return !before[String(x['工程ID'])]&&x['工程名']===name&&U.d10(x['開始日'])===s; }); });
    }).then(function(){
      sh.close(); GK.toast('工程を保存しました'); return reload(); })
      .catch(function(err){ btn.disabled=false; GK.toast('保存できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); });
  };
  var del=sh.$('[data-del]');
  if(del) del.onclick=function(){
    GK.confirm('工程「'+k['工程名']+'」を削除しますか？',{ok:'削除する',danger:true}).then(function(y){ if(!y) return;
      GK.busy(true,'削除中…');
      API.write('deleteKoutei',{id:k['工程ID']}).then(function(){ sh.close(); GK.toast('削除しました'); return reload(); })
        .catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); });
  };
}

/* ===================== 現場の登録・編集 ===================== */
function projectForm(p){
  var isNew=!p; p=p||{};
  if(!isNew&&!CAN.admin()){ GK.toast('現場の編集は管理者のみできます',{err:true}); return; }
  var custs=D.customers.map(function(c){ return c['顧客名']; }).filter(Boolean);
  var st0=isNew?'受注':(D.status(p)||'受注');
  var v=function(k){ return esc(isNew?'':(p[k]||'')); };
  var html='<label class="fld"><span>現場名（案件名）<span class="req">*</span></span><input data-f="案件名" maxlength="80" value="'+v('案件名')+'" autofocus></label>'+
    '<label class="fld"><span>略称（一覧で表示する短い名前）</span><input data-f="略称" maxlength="30" value="'+v('略称')+'"></label>'+
    '<label class="fld"><span>顧客</span><input data-f="顧客" list="gkCust" maxlength="60" value="'+v('顧客')+'"><datalist id="gkCust">'+custs.map(function(c){ return '<option value="'+esc(c)+'">'; }).join('')+'</datalist></label>'+
    '<label class="fld"><span>場所（住所）</span><input data-f="場所" maxlength="120" value="'+v('場所')+'"></label>'+
    '<div class="grid2"><label class="fld"><span>区分</span><select data-f="種別"><option value="">（顧客から自動）</option>'+
      /* 一覧にない古い区分（例：官公庁）が入っている現場でも、保存で消えないように選択肢に残す */
      (p['種別']&&KINDS.indexOf(String(p['種別']))<0?'<option selected>'+esc(p['種別'])+'</option>':'')+
      KINDS.map(function(k){ return '<option'+(p['種別']===k?' selected':'')+'>'+k+'</option>'; }).join('')+'</select></label>'+
    '<label class="fld"><span>ステータス</span><select data-f="ステータス">'+D.STATUSES.map(function(s){ return '<option'+(s===st0?' selected':'')+'>'+s+'</option>'; }).join('')+'</select></label></div>'+
    '<div class="grid2"><label class="fld"><span>工期開始</span><input type="date" data-f="工期開始" value="'+esc(isNew?'':U.d10(p['工期開始']))+'"></label><label class="fld"><span>工期完了</span><input type="date" data-f="工期完了" value="'+esc(isNew?'':U.d10(p['工期完了']))+'"></label></div>'+
    '<label class="fld"><span>担当（社内）</span><input data-f="担当" maxlength="40" value="'+v('担当')+'"></label>'+
    '<div class="grid2"><label class="fld"><span>先方担当者</span><input data-f="先方担当者" maxlength="40" value="'+v('先方担当者')+'"></label><label class="fld"><span>電話番号</span><input type="tel" data-f="電話番号" maxlength="20" value="'+v('電話番号')+'"></label></div>'+
    '<label class="fld"><span>備考</span><textarea data-f="備考" maxlength="1000">'+v('備考')+'</textarea></label>'+
    '<div class="hint">受注金額・実行予算はGen-Canの「現場管理」で管理者が入力します。</div>';
  var sh=GK.sheet({ title:isNew?'新しい現場':'現場を編集', html:html, foot:'<button type="button" class="btn primary" data-save>保存</button>' });
  sh.$('[data-save]').onclick=function(){
    var data={};
    ['案件名','略称','顧客','場所','種別','ステータス','工期開始','工期完了','担当','先方担当者','電話番号','備考'].forEach(function(k){ data[k]=sh.$('[data-f="'+k+'"]').value.trim(); });
    if(!data['案件名']){ GK.toast('現場名を入力してください',{err:true}); return; }
    if(data['工期開始']&&data['工期完了']&&data['工期完了']<data['工期開始']){ GK.toast('工期完了が工期開始より前になっています',{err:true}); return; }
    if(isNew){ var dup=D.projects.filter(function(x){ return U.normName(x['案件名'])===U.normName(data['案件名']); }); if(dup.length&&!window.confirm('同じ名前の現場がすでにあります。登録しますか？')) return; }
    var btn=sh.$('[data-save]'); if(!GK.lockBtn(btn)) return;
    var before={}; D.projects.forEach(function(x){ before[String(x['案件ID'])]=1; });
    var added=null;
    GK.busy(true,'保存中…');
    API.write(isNew?'addProject':'updateProject',isNew?{data:data}:{id:p['案件ID'],data:data}).catch(function(err){
      if(!isNew) throw err;
      /* 通信切れの時は、同じ名前の現場が増えていないか読み直して確かめる（二重登録防止） */
      return GK.verifySaved(err,function(){ return D.loadRD(true); },function(){ added=D.projects.filter(function(x){ return !before[String(x['案件ID'])]&&U.normName(x['案件名'])===U.normName(data['案件名']); })[0]; return !!added; })
        .then(function(){ return {project:added}; });
    }).then(function(res){
      sh.close(); GK.toast(isNew?'現場を登録しました':'保存しました');
      var np=res.project;
      return D.loadRD(true).then(function(){ if(isNew&&np&&np['案件ID']) GK.go('/project/'+encodeURIComponent(np['案件ID'])); else GK.refresh(); });
    }).catch(function(err){ btn.disabled=false; GK.toast('保存できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); });
  };
}
GK.projectForm=projectForm;

})();
