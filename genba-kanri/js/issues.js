/* 現場管理 issues.js v1.0.1 — 図面・指摘（是正）・検査
 * GASは変更していません。既存の仕組みだけで保存します。
 *  - 図面：現場フォルダの「図面」フォルダ（ドライブで入れた図面）＋ アプリから追加した図面（現場フォルダの「ファイル」に「図面_」付きで保存）
 *          PDFはアプリで1ページずつ画像にしてから保存（表示を速くするため）。図面フォルダに直接入れたPDFはそのまま表示。
 *  - 指摘：現場メモシート 種類「指摘」（内容はJSON：番号・図面上の位置・担当・期限・写真など）
 *  - 対応状況：現場メモシート 種類「指摘履歴」（追記のみ）。GASは作成者本人と管理者しかメモを書き換えられないため、
 *          作業員が「対応済」にする等は履歴の追記で行う。今の状況＝最後の履歴。誰がいつ直したかが残る。
 *  - 検査：現場メモシート 種類「検査」／検査テンプレート：種類「検査テンプレ」（案件IDなし＝会社共通）
 *  - 写真：現場フォルダ/写真/指摘・写真/検査（Gen-Canの工事写真からも見える）
 *  これらの種類はGen-Canの画面には表示されません。 */
(function(){
'use strict';
var U=GK.u, D=GK.data, S=GK.session, CAN=GK.can, API=GK.api, IMG=GK.img, esc=U.esc;

var K_ISS='指摘', K_LOG='指摘履歴', K_INSP='検査', K_TPL='検査テンプレ';
var ST=['未対応','対応中','対応済','確認済'];
var CATS=['是正','確認','その他'];
var PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
var PDFJS_SRI='sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e';
var PDFJS_WORKER='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

GK.route('/issues',{ tab:'issues', title:'図面・指摘', render:renderHub });
GK.route('/issues/:pid',{ tab:'issues', title:function(p){ var x=D.project(p.pid); return x?D.pname(x):'図面・指摘'; }, back:'/issues', render:renderProject });
GK.route('/drawing/:pid/:fid',{ tab:'issues', title:'図面', back:function(p){ return '/issues/'+encodeURIComponent(p.pid)+'?t=draw'; }, noTab:true, noZoom:true, render:renderDrawing });
GK.route('/issue/:pid/:nid',{ tab:'issues', title:'指摘', back:function(p){ return '/issues/'+encodeURIComponent(p.pid)+'?t=list'; }, render:renderIssue });
GK.route('/inspect/:pid/:nid',{ tab:'issues', title:'検査', back:function(p){ return '/issues/'+encodeURIComponent(p.pid)+'?t=insp'; }, noTab:true, render:renderInspect });
GK.route('/print/issues/:pid',{ tab:'issues', title:'指摘一覧（印刷）', back:function(p){ return '/issues/'+encodeURIComponent(p.pid)+'?t=list'; }, noTab:true, render:printIssues });
GK.route('/print/inspect/:pid/:nid',{ tab:'issues', title:'検査記録（印刷）', back:function(p){ return '/inspect/'+encodeURIComponent(p.pid)+'/'+encodeURIComponent(p.nid); }, noTab:true, render:printInspect });

/* ===================== データ ===================== */
var I = GK.Issues = {};
var proj={};      /* pid → {t, notes} */
var allC=null;    /* {t, issues} */
var draws={};     /* pid → {t, list} */
I.clear = function(){ proj={}; allC=null; draws={}; };
function json(s){ return U.jsonParse(s,{}); }
function ts(n){ var j=json(n['内容']); return Number(j.ts)||Date.parse(String(n['登録日時']||'').replace(' ','T'))||0; }
/* 指摘メモ＋履歴メモから「今の状態」を組み立てる */
function build(notes,logs){
  var byIssue={};
  logs.forEach(function(l){ var j=json(l['内容']); var nid=String(j.i||l['タイトル']||''); if(!nid) return;
    (byIssue[nid]=byIssue[nid]||[]).push({ nid:l['メモID'], s:(j.s==null||j.s==='')?null:Number(j.s), c:String(j.c||''), p:j.p||[], by:l['作成者名']||'', byId:String(l['作成者ID']||''), t:ts(l), at:String(l['登録日時']||'') }); });
  return notes.map(function(n){
    var j=json(n['内容']), lg=(byIssue[String(n['メモID'])]||[]).sort(function(a,b){ return a.t-b.t; });
    var cur=Number(j.s)||0, closedAt='';
    lg.forEach(function(x){ if(x.s!=null&&x.s>=0&&x.s<=3){ cur=x.s; if(x.s>=2&&!closedAt) closedAt=x.at; if(x.s<2) closedAt=''; } });
    return { nid:String(n['メモID']), pid:String(n['案件ID']||''), no:Number(j.no)||0, title:String(n['タイトル']||''), body:String(j.body||''), place:String(j.place||''),
      cat:String(j.cat||'是正'), assigneeId:String(j.aid||''), assigneeName:String(j.an||''), due:U.d10(j.due), draw:j.draw||null, photos:j.p||[],
      insp:j.insp||null, creatorId:String(n['作成者ID']||''), creatorName:String(n['作成者名']||''), created:String(n['登録日時']||''), updated:String(n['更新日時']||''),
      logs:lg, cur:cur, closedAt:closedAt, cid:j.cid||'', raw:j, note:n };
  });
}
I.loadProject = function(pid,force){
  var c=proj[pid];
  if(c&&!force&&Date.now()-c.t<60000) return Promise.resolve(c);
  return API.call('notesList',{id:pid},{timeout:40000}).then(function(res){
    var notes=res.notes||[];
    var iss=notes.filter(function(n){ return n['種類']===K_ISS; }), logs=notes.filter(function(n){ return n['種類']===K_LOG; }), insp=notes.filter(function(n){ return n['種類']===K_INSP; });
    c=proj[pid]={ t:Date.now(), issues:build(iss,logs), insp:insp.map(function(n){ var j=json(n['内容']); j.nid=String(n['メモID']); j.creatorId=String(n['作成者ID']||''); j.creatorName=String(n['作成者名']||''); j.updated=String(n['更新日時']||''); j.title=String(n['タイトル']||j.name||''); return j; }) };
    allC=null; return c;
  });
};
I.loadAll = function(force){
  if(allC&&!force&&Date.now()-allC.t<60000) return Promise.resolve(allC.issues);
  return Promise.all([API.call('notesList',{type:K_ISS},{timeout:40000}),API.call('notesList',{type:K_LOG},{timeout:40000})]).then(function(r){
    var list=build(r[0].notes||[],r[1].notes||[]); allC={t:Date.now(),issues:list}; return list; });
};
I.issue = function(pid,nid){ var c=proj[pid]; if(!c) return null; for(var i=0;i<c.issues.length;i++) if(c.issues[i].nid===nid) return c.issues[i]; return null; };
I.stBadge = function(s){ return '<span class="st-badge st'+s+'">'+esc(ST[s]||'')+'</span>'; };
I.rowHtml = function(i,withProj){
  var p=D.project(i.pid), today=U.today(), late=i.due&&i.due<today&&i.cur<2;
  var sub=[I.stBadge(i.cur), i.assigneeName?'👷 '+esc(i.assigneeName):'', i.due?'<span class="'+(late?'late':'')+'">⏰ '+esc(U.mdS(i.due))+(late?' 期限切れ':'')+'</span>':'', i.place?'📍'+esc(i.place):'', (i.photos.length?'📷'+i.photos.length:'')].filter(Boolean).join('　');
  return '<a class="item" href="#/issue/'+encodeURIComponent(i.pid)+'/'+encodeURIComponent(i.nid)+'"><span class="is-no s'+i.cur+'">'+(i.no||'—')+'</span><div class="grow"><div class="t ellipsis" style="font-size:15px">'+esc(i.title)+'</div>'+
    (withProj&&p?'<div class="s ellipsis">🏗 '+esc(D.pname(p))+'</div>':'')+'<div class="s">'+sub+'</div></div><span class="chev">›</span></a>';
};
function canEditIssue(i){ return CAN.admin()||(i&&i.creatorId&&i.creatorId===S.me().id); }
function canConfirm(i){ return CAN.manage()||(i&&i.creatorId&&i.creatorId===S.me().id); }
function workersOpts(sel){ var me=S.me().id;
  return '<option value="">（未定）</option>'+D.workers.filter(function(w){ var st=String(w['利用状態']||''); return st!=='停止'&&st!=='利用停止'; }).map(function(w){ var id=String(w['作業員ID']); return '<option value="'+esc(id)+'"'+(id===sel?' selected':'')+'>'+esc(D.wname(w))+(id===me?'（自分）':'')+'</option>'; }).join(''); }

/* メモの保存。通信が途中で切れても二重登録しないよう、cid（端末で作る番号）で保存済みか確かめる */
function saveNote(data,cid,pid){
  return API.write('noteSave',{data:data}).then(function(res){ return res.note||{}; },function(err){
    if(data['メモID']||!cid||!err||!err.net) throw err;   /* 通信切れの時だけ、保存済みかを確かめる */
    var req=pid?API.call('notesList',{id:pid}):API.call('notesList',{type:data['種類']});
    return req.then(function(res){ var hit=(res.notes||[]).filter(function(n){ return n['種類']===data['種類']&&json(n['内容']).cid===cid; })[0]; if(hit) return hit; throw err; },function(){ throw err; });
  });
}
/* 写真を送ってファイルIDを受け取る（写真/指摘 などのフォルダへ） */
function uploadPhotos(pid,files,kind,prefix,onProg){
  var out=[], done=0;
  return files.reduce(function(ch,f,i){ return ch.then(function(){
    return IMG.fromFile(f).then(function(img){ return IMG.blob(IMG.toCanvas(img,1920),'image/jpeg',0.85); }).then(function(blob){
      var name=U.safeName(prefix,40)+'_'+U.stamp()+U.pad(i)+'.jpg';
      return GK.uploader.add({pid:pid,dest:'photo',kind:kind,name:name,mime:'image/jpeg',blob:blob,label:prefix,failFast:true}).then(function(file){ done++; if(onProg) onProg(done,files.length); out.push({id:file.id,name:file.name||name}); });
    });
  }); },Promise.resolve()).then(function(){ return out; });
}
function photoPicker(el,list,opt){
  opt=opt||{};
  function draw(){ el.innerHTML='<div class="thumbs">'+list.map(function(f,i){ return '<button type="button" data-rm="'+i+'" aria-label="写真を外す"><img src="'+URL.createObjectURL(f)+'" alt=""><span class="tg">✕</span></button>'; }).join('')+
    '<label class="addph"><span style="font-size:22px">📷</span>写真を追加<input type="file" accept="image/*" multiple hidden></label></div>'+(opt.hint?'<div class="hint">'+esc(opt.hint)+'</div>':''); }
  el.onclick=function(e){ var b=e.target.closest('[data-rm]'); if(!b) return; list.splice(+b.dataset.rm,1); draw(); };
  el.onchange=function(e){ if(e.target.type!=='file') return; Array.prototype.forEach.call(e.target.files||[],function(f){ list.push(f); }); draw(); };
  draw();
}
function thumbsHtml(ph,tag){ return ph.map(function(x){ return '<button type="button" data-ph="'+esc(x.id)+'" data-nm="'+esc(x.name||'')+'"><img loading="lazy" data-fid="'+esc(x.id)+'" src="'+GK.thumb(x.id,200)+'" alt="">'+(tag?'<span class="tg">'+esc(tag)+'</span>':'')+'</button>'; }).join(''); }
function bindThumbs(root){ root.addEventListener('click',function(e){ var b=e.target.closest('[data-ph]'); if(!b) return; var id=b.dataset.ph;
  GK.viewer({ title:b.dataset.nm||'写真', src:function(){ return GK.fileBlob(id).then(function(bl){ return URL.createObjectURL(bl); },function(){ return GK.thumb(id,1600); }); }, actions:[{label:'ドライブで開く',href:GK.driveView(id)}] }); }); }

/* ===================== 図面の一覧 ===================== */
var DRAW_RE=/^図面_(.+?)(?:_p(\d{2,3}))?\.(jpe?g|png|webp|gif|pdf)$/i;
function isPdf(f){ return /pdf/i.test(f.mime||'')||/\.pdf$/i.test(f.name||''); }
function isImg(f){ return /^image\//i.test(f.mime||'')||/\.(jpe?g|png|webp|gif)$/i.test(f.name||''); }
I.loadDrawings = function(pid,force){
  var c=draws[pid]; if(c&&!force&&Date.now()-c.t<120000) return Promise.resolve(c.list);
  var fromFolder=API.call('projectDriveRoot',{id:pid},{timeout:40000}).then(function(res){
    var f=(res.folders||[]).filter(function(x){ return x.name==='図面'; })[0]; if(!f) return [];
    return API.call('driveItems',{fid:f.id},{timeout:40000}).then(function(r){
      var files=(r.files||[]).map(function(x){ x.folder=''; return x; });
      var subs=(r.folders||[]).slice(0,6);
      return Promise.all(subs.map(function(sf){ return API.call('driveItems',{fid:sf.id},{timeout:40000}).then(function(rr){ return (rr.files||[]).map(function(x){ x.folder=sf.name; return x; }); }).catch(function(){ return []; }); }))
        .then(function(arrs){ arrs.forEach(function(a){ files=files.concat(a); }); return files; });
    });
  }).catch(function(e){ console.warn(e); return []; });
  var fromApp=API.call('listFiles',{id:pid},{timeout:40000}).then(function(res){ return (res.files||[]).filter(function(f){ return DRAW_RE.test(f.name||''); }); }).catch(function(){ return []; });
  return Promise.all([fromFolder,fromApp]).then(function(r){
    var list=[];
    r[0].forEach(function(f){ if(!(isPdf(f)||isImg(f))) return; list.push({ key:f.id, title:String(f.name||'').replace(/\.[^.]+$/,''), sub:'図面フォルダ'+(f.folder?' / '+f.folder:''), pdf:isPdf(f), pages:[{fid:f.id,name:f.name}], updated:f.updated||'' }); });
    var groups={};
    r[1].forEach(function(f){ var m=DRAW_RE.exec(f.name); if(!m) return; var t=m[1], ext=m[3].toLowerCase();
      if(ext==='pdf'){ list.push({key:f.id,title:t,sub:'アプリで追加',pdf:true,pages:[{fid:f.id,name:f.name}]}); return; }
      (groups[t]=groups[t]||[]).push({fid:f.id,name:f.name,pg:Number(m[2]||1)}); });
    Object.keys(groups).forEach(function(t){ var pg=groups[t].sort(function(a,b){ return a.pg-b.pg; }); list.push({key:pg[0].fid,title:t,sub:'アプリで追加'+(pg.length>1?'・'+pg.length+'ページ':''),pdf:false,pages:pg}); });
    list.sort(function(a,b){ return a.title.localeCompare(b.title,'ja'); });
    draws[pid]={t:Date.now(),list:list}; return list;
  });
};
function findDrawing(pid,fid){ var c=draws[pid]; if(!c) return null; for(var i=0;i<c.list.length;i++){ var d=c.list[i]; if(d.key===fid||d.pages.some(function(p){ return p.fid===fid; })) return d; } return null; }

/* pdf.js（PDF図面を画像にする）を必要な時だけ読み込む */
var pdfP=null;
function loadPdfJs(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if(pdfP) return pdfP;
  pdfP=new Promise(function(ok,ng){ var s=document.createElement('script'); s.src=PDFJS; s.integrity=PDFJS_SRI; s.crossOrigin='anonymous';
    s.onload=function(){ if(!window.pdfjsLib){ ng(new Error('PDFの表示部品を読み込めませんでした')); return; } window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKER; ok(window.pdfjsLib); };
    s.onerror=function(){ pdfP=null; ng(new Error('PDFの表示部品を読み込めませんでした（通信を確認してください）')); }; document.head.appendChild(s); });
  return pdfP;
}
function pdfDoc(buf){ return loadPdfJs().then(function(lib){ return lib.getDocument({data:buf}).promise; }); }
function renderPdfPage(doc,n,width){
  return doc.getPage(n).then(function(page){
    var vp1=page.getViewport({scale:1}), sc=Math.min(width/vp1.width, 4), vp=page.getViewport({scale:sc});
    if(vp.width*vp.height>14000000){ sc=sc*Math.sqrt(14000000/(vp.width*vp.height)); vp=page.getViewport({scale:sc}); }
    var c=document.createElement('canvas'); c.width=Math.floor(vp.width); c.height=Math.floor(vp.height);
    var g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return page.render({canvasContext:g,viewport:vp}).promise.then(function(){ return c; });
  });
}
function blobToBuf(b){ return b.arrayBuffer?b.arrayBuffer():new Response(b).arrayBuffer(); }

/* 図面を追加（PDFはページごとにJPEGにして保存） */
function addDrawing(pid,existing,done){
  var s=GK.sheet({ title:'図面を追加', html:'<label class="fld"><span>図面ファイル（PDF・画像）<span class="req">*</span></span><input type="file" accept="application/pdf,image/*" data-file></label>'+
    '<label class="fld"><span>図面の名前<span class="req">*</span></span><input data-name maxlength="40" placeholder="例：1F平面図"></label>'+
    '<div class="hint">PDFは1ページずつ画像にして保存します（30ページまで）。保存先：現場フォルダの「ファイル」（名前の先頭に「図面_」が付きます）。<br>ドライブの現場フォルダ「図面」に直接入れた図面も、この一覧に表示されます。</div><div data-prog class="mt8"></div>',
    foot:'<button type="button" class="btn primary" data-go>追加する</button>' });
  var fi=s.$('[data-file]'), nm=s.$('[data-name]');
  fi.onchange=function(){ var f=fi.files&&fi.files[0]; if(f&&!nm.value) nm.value=U.safeName(f.name.replace(/\.[^.]+$/,''),40); };
  s.$('[data-go]').onclick=function(){
    var f=fi.files&&fi.files[0], title=U.safeName(nm.value,40).replace(/_p\d+$/,'');
    if(!f){ GK.toast('図面ファイルを選んでください',{err:true}); return; }
    if(!title){ GK.toast('図面の名前を入力してください',{err:true}); return; }
    var titles={}; existing.forEach(function(d){ titles[d.title]=1; }); var base=title, n=2; while(titles[title]){ title=base+'('+n+')'; n++; }
    var btn=s.$('[data-go]'), prog=s.$('[data-prog]'); btn.disabled=true;
    var pages=[];
    var make;
    if(f.type==='application/pdf'||/\.pdf$/i.test(f.name)){
      prog.textContent='PDFを読み込んでいます…';
      make=blobToBuf(f).then(pdfDoc).then(function(doc){ var cnt=Math.min(doc.numPages,30);
        var seq=Promise.resolve(); for(var i=1;i<=cnt;i++) (function(i){ seq=seq.then(function(){ prog.textContent='ページを画像にしています… '+i+' / '+cnt; return renderPdfPage(doc,i,2400).then(function(c){ return IMG.blob(c,'image/jpeg',0.85); }).then(function(b){ pages.push(b); }); }); })(i);
        return seq.then(function(){ if(doc.numPages>30) GK.toast('31ページ目以降は追加していません（30ページまで）',{err:true}); }); });
    } else {
      make=IMG.fromFile(f).then(function(img){ return IMG.blob(IMG.toCanvas(img,2400),'image/jpeg',0.88); }).then(function(b){ pages.push(b); });
    }
    make.then(function(){
      prog.textContent='送信しています… 0 / '+pages.length;
      var cnt=0;
      return Promise.all(pages.map(function(b,i){
        var name='図面_'+title+(pages.length>1?'_p'+U.pad(i+1):'')+'.jpg';
        return GK.uploader.add({pid:pid,dest:'file',name:name,mime:'image/jpeg',blob:b,label:'図面 '+title,failFast:true}).then(function(){ cnt++; prog.textContent='送信しています… '+cnt+' / '+pages.length; });
      }));
    }).then(function(){ s.close(); GK.toast('図面「'+title+'」を追加しました'); done(); })
      .catch(function(err){ btn.disabled=false; prog.textContent=''; GK.toast('図面を追加できませんでした：'+err.message,{err:true}); });
  };
}

/* ===================== 図面・指摘の入口 ===================== */
var hubMode='site';
function renderHub(view){
  view.innerHTML='<div class="seg" data-m><button type="button" data-v="site">現場から選ぶ</button><button type="button" data-v="mine">自分の担当</button><button type="button" data-v="open">未完了すべて</button></div><div data-body></div>';
  var all=null, err='';
  function draw(){
    U.$$('[data-m] button',view).forEach(function(b){ b.classList.toggle('on',b.dataset.v===hubMode); });
    var body=view.querySelector('[data-body]');
    if(hubMode==='site'){
      var cnt={}; (all||[]).forEach(function(i){ if(i.cur<2) cnt[i.pid]=(cnt[i.pid]||0)+1; });
      var act=D.activeProjects(), ids={}; act.forEach(function(p){ ids[p['案件ID']]=1; });
      var extra=Object.keys(cnt).filter(function(pid){ return !ids[pid]&&D.project(pid); }).map(D.project);
      var arr=act.concat(extra);
      body.innerHTML='<div class="btns" style="margin-bottom:10px"><button type="button" class="btn sm" data-other>他の現場を探す…</button></div>'+
        (arr.length?'<div class="list">'+arr.map(function(p){ var n=cnt[p['案件ID']]||0;
          return '<a class="item" href="#/issues/'+encodeURIComponent(p['案件ID'])+'"><span class="ico" style="background:#fee2e2;color:#b91c1c">📍</span><div class="grow"><div class="t ellipsis">'+esc(D.pname(p))+'</div><div class="s">'+(all?(n?'<span class="late">未完了の指摘 '+n+'件</span>':'未完了の指摘なし'):'…')+'</div></div><span class="chev">›</span></a>'; }).join('')+'</div>':(D.t.rd?'<div class="empty">進行中の現場はありません</div>':'<div class="skel"></div>'));
      body.querySelector('[data-other]').onclick=function(){ GK.pickProject().then(function(p){ if(p) GK.go('/issues/'+encodeURIComponent(p['案件ID'])); }); };
      return;
    }
    if(!all){ body.innerHTML=err?'<div class="card">読み込めませんでした：'+esc(err)+'</div>':'<div class="skel"></div><div class="skel"></div>'; return; }
    var me=S.me().id;
    var list=all.filter(function(i){ return i.cur<2&&(hubMode==='open'||i.assigneeId===me); });
    list.sort(function(a,b){ return String(a.due||'9999').localeCompare(String(b.due||'9999'))||b.no-a.no; });
    body.innerHTML=list.length?'<div class="list">'+list.map(function(i){ return I.rowHtml(i,true); }).join('')+'</div>':'<div class="empty"><div class="big">✅</div>'+(hubMode==='mine'?'自分が担当の未完了の指摘はありません':'未完了の指摘はありません')+'</div>';
  }
  view.querySelector('[data-m]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; hubMode=b.dataset.v; draw(); };
  draw();
  I.loadAll().then(function(a){ all=a; draw(); }).catch(function(e){ err=e.message; all=null; draw(); });
  return GK.on('data',function(k){ if(k==='rd') draw(); });
}

/* ===================== 現場ごと：図面／指摘／検査 ===================== */
var projTab={}, listFilt='open';
function renderProject(view,params,q){
  var pid=params.pid, tab=q.get('t')||projTab[pid]||'draw';
  projTab[pid]=tab;
  view.innerHTML='<div class="seg" data-t><button type="button" data-v="draw">🗺 図面</button><button type="button" data-v="list">📍 指摘</button><button type="button" data-v="insp">✅ 検査</button></div><div data-body></div>';
  var c=null, dl=null, err='', derr='';
  function draw(){
    if(!view.isConnected) return;   /* 別の画面に移った後に読み込みが終わった時は何もしない */
    U.$$('[data-t] button',view).forEach(function(b){ b.classList.toggle('on',b.dataset.v===tab); });
    var body=view.querySelector('[data-body]');
    GK.setActions('');
    if(tab==='draw') drawDraw(body); else if(tab==='list') drawList(body); else drawInsp(body);
  }
  function drawDraw(body){
    if(CAN.write()) GK.setActions('<button type="button" data-add>＋ 図面</button>',function(r){ r.querySelector('[data-add]').onclick=function(){ addDrawing(pid,dl||[],function(){ dl=null; draw(); I.loadDrawings(pid,true).then(function(l){ dl=l; draw(); }); }); }; });
    if(!dl){ body.innerHTML=derr?'<div class="card">図面を読み込めませんでした：'+esc(derr)+'</div>':'<div class="dw-grid">'+'<div class="skel" style="height:150px"></div>'.repeat(4)+'</div>'; return; }
    var cnt={}; ((c&&c.issues)||[]).forEach(function(i){ if(i.draw&&i.draw.fid&&i.cur<2){ var d=findDrawing(pid,i.draw.fid); if(d) cnt[d.key]=(cnt[d.key]||0)+1; } });
    if(!dl.length){ body.innerHTML='<div class="empty"><div class="big">🗺</div>図面がまだありません。<br>'+(CAN.write()?'右上の「＋ 図面」からPDF・写真を追加できます。<br>':'')+'<span class="small">ドライブの現場フォルダ「図面」に入れた図面もここに出ます。</span></div>'+(c?'<div class="hint center">図面なしで指摘を登録する場合は「📍 指摘」から。</div>':''); return; }
    body.innerHTML='<div class="dw-grid">'+dl.map(function(d){ var f=d.pages[0];
      return '<button type="button" class="dw" data-k="'+esc(d.key)+'"><div class="th">'+(d.pdf?'<span>📄</span>':'<img loading="lazy" alt="" data-fid="'+esc(f.fid)+'" src="'+GK.thumb(f.fid,500)+'">')+'</div><div class="nm">'+esc(d.title)+(cnt[d.key]?' <span class="badge red">'+cnt[d.key]+'</span>':'')+'<small>'+esc(d.sub||'')+(d.pdf?'・PDF':'')+'</small></div></button>'; }).join('')+'</div>'+
      '<div class="hint mt8">図面をタップして開き、「＋ 指摘」で図面の場所をタップするとピンを立てられます。</div>';
    body.querySelector('.dw-grid').onclick=function(e){ var b=e.target.closest('[data-k]'); if(b) GK.go('/drawing/'+encodeURIComponent(pid)+'/'+encodeURIComponent(b.dataset.k)); };
  }
  function drawList(body){
    if(CAN.write()) GK.setActions('<button type="button" data-add>＋ 指摘</button>',function(r){ r.querySelector('[data-add]').onclick=function(){ if(!c){ GK.toast('読み込み中です'); return; } issueForm(pid,null,null,function(it){ GK.go('/issue/'+encodeURIComponent(pid)+'/'+encodeURIComponent(it.nid)); }); }; });
    if(!c){ body.innerHTML=err?'<div class="card">読み込めませんでした：'+esc(err)+'</div>':'<div class="skel"></div><div class="skel"></div>'; return; }
    var me=S.me().id, today=U.today();
    var all=c.issues.slice().sort(function(a,b){ return b.no-a.no; });
    var n={open:0,done:0,ok:0,mine:0,all:all.length};
    all.forEach(function(i){ if(i.cur<2) n.open++; if(i.cur===2) n.done++; if(i.cur===3) n.ok++; if(i.cur<2&&i.assigneeId===me) n.mine++; });
    var arr=all.filter(function(i){ return listFilt==='all'||(listFilt==='open'&&i.cur<2)||(listFilt==='done'&&i.cur===2)||(listFilt==='ok'&&i.cur===3)||(listFilt==='mine'&&i.cur<2&&i.assigneeId===me); });
    var late=all.filter(function(i){ return i.cur<2&&i.due&&i.due<today; }).length;
    body.innerHTML='<div class="chips scroll" data-f style="margin-bottom:10px">'+[['open','未完了'],['mine','自分の担当'],['done','対応済（確認待ち）'],['ok','確認済'],['all','すべて']].map(function(x){ return '<button type="button" class="chip'+(listFilt===x[0]?' on':'')+'" data-v="'+x[0]+'">'+x[1]+' <span class="n">'+n[x[0]]+'</span></button>'; }).join('')+'</div>'+
      (late?'<div class="card small" style="background:var(--ngSoft);color:var(--ng);font-weight:800">⏰ 期限切れの未完了が '+late+' 件あります</div>':'')+
      (arr.length?'<div class="list">'+arr.map(function(i){ return I.rowHtml(i,false); }).join('')+'</div>':'<div class="empty">この条件の指摘はありません</div>')+
      '<div class="btns mt12"><a class="btn" href="#/print/issues/'+encodeURIComponent(pid)+'?f='+(listFilt==='all'?'all':'open')+'">🖨 指摘一覧を印刷・PDF</a></div>';
    body.querySelector('[data-f]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; listFilt=b.dataset.v; draw(); };
  }
  function drawInsp(body){
    if(CAN.write()) GK.setActions('<button type="button" data-add>＋ 検査</button>',function(r){ r.querySelector('[data-add]').onclick=function(){ startInspect(pid); }; });
    if(!c){ body.innerHTML=err?'<div class="card">読み込めませんでした：'+esc(err)+'</div>':'<div class="skel"></div>'; return; }
    var arr=c.insp.slice().sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||''))||String(b.updated).localeCompare(String(a.updated)); });
    body.innerHTML=(arr.length?'<div class="list">'+arr.map(function(x){ var it=x.items||[], ok=0, ng=0, un=0; it.forEach(function(r){ if(r.r===1) ok++; else if(r.r===2) ng++; else if(!r.r) un++; });
      var badge=un?'<span class="badge orange">途中 '+(it.length-un)+'/'+it.length+'</span>':(ng?'<span class="badge red">否 '+ng+'件</span>':'<span class="badge green">すべて良</span>');
      return '<a class="item" href="#/inspect/'+encodeURIComponent(pid)+'/'+encodeURIComponent(x.nid)+'"><span class="ico" style="background:var(--okSoft);color:var(--ok)">✅</span><div class="grow"><div class="t ellipsis" style="font-size:15px">'+esc(x.title||'検査')+'</div><div class="s">'+esc(U.md(x.date)+'　'+((x.insp&&x.insp.name)||x.creatorName||''))+'　良'+ok+'・否'+ng+'</div></div>'+badge+'<span class="chev">›</span></a>'; }).join('')+'</div>':'<div class="empty"><div class="big">✅</div>検査の記録はまだありません'+(CAN.write()?'<br>右上の「＋ 検査」から始められます':'')+'</div>')+
      '<div class="btns mt12"><button type="button" class="btn sm" data-tpl>📋 検査項目のテンプレート</button></div>';
    body.querySelector('[data-tpl]').onclick=function(){ tplManager(); };
  }
  view.querySelector('[data-t]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; tab=projTab[pid]=b.dataset.v; GK.go('/issues/'+encodeURIComponent(pid)+'?t='+tab,true); };
  draw();
  I.loadProject(pid).then(function(x){ c=x; draw(); }).catch(function(e){ err=e.message; draw(); });
  I.loadDrawings(pid).then(function(l){ dl=l; draw(); }).catch(function(e){ derr=e.message; draw(); });
  if(!D.t.rd) D.ensure('rd').then(function(){ if(view.isConnected) GK.setTitle(D.project(pid)?D.pname(D.project(pid)):'図面・指摘'); }).catch(function(){});
}

/* ===================== 図面ビューア（拡大・移動・ピン） ===================== */
function renderDrawing(view,params,q){
  var pid=params.pid, fid=params.fid, focus=q.get('is')||'';
  var d=null, pageIdx=0, pdf=null, pdfPages=1, c=null, alive=true, addMode=false, tempPin=null;
  var W=0, H=0, s=1, tx=0, ty=0;
  view.innerHTML='<div class="stage" data-st><div class="cvs" data-cvs></div><div class="cam-msg" data-msg style="color:#fff"><div class="spin"></div><div>図面を読み込んでいます…</div></div></div>'+
    '<div class="stage-tools"><button type="button" data-zi aria-label="拡大">＋</button><button type="button" data-zo aria-label="縮小">－</button><button type="button" data-fit aria-label="全体を表示">⤢</button></div>'+
    (CAN.write()?'<div class="stage-add"><button type="button" class="btn primary" data-add>📍 指摘を追加</button></div>':'')+
    '<div class="stage-pages" data-pg hidden><button type="button" data-pp aria-label="前のページ">◀</button><span data-pl></span><button type="button" data-pn aria-label="次のページ">▶</button></div>'+
    '<div class="stage-banner" data-ban hidden>指摘する場所をタップしてください</div>';
  var stage=view.querySelector('[data-st]'), cvs=view.querySelector('[data-cvs]'), msg=view.querySelector('[data-msg]');
  GK.setActions('<button type="button" data-list>📍 一覧</button>',function(r){ r.querySelector('[data-list]').onclick=function(){ GK.go('/issues/'+encodeURIComponent(pid)+'?t=list'); }; });
  function apply(){ cvs.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')'; cvs.style.setProperty('--pz',String(1/s)); }
  function fit(){ var r=stage.getBoundingClientRect(); if(!W||!H) return; s=Math.min(r.width/W,r.height/H)*0.96; tx=(r.width-W*s)/2; ty=(r.height-H*s)/2; apply(); }
  function zoomAt(px,py,ns){ var mn=fitScale()*0.6, mx=Math.max(3,fitScale()*12); ns=Math.max(mn,Math.min(mx,ns)); var ix=(px-tx)/s, iy=(py-ty)/s; s=ns; tx=px-ix*s; ty=py-iy*s; apply(); }
  function fitScale(){ var r=stage.getBoundingClientRect(); return (W&&H)?Math.min(r.width/W,r.height/H):1; }
  function curRef(){ var pg=d.pages[pageIdx]||d.pages[0]; return d.pdf?{fid:d.pages[0].fid,page:pageIdx+1}:{fid:pg.fid,page:1}; }
  function onThisPage(i){ if(!i.draw||!i.draw.fid) return false; var r=curRef(); return String(i.draw.fid)===String(r.fid)&&(Number(i.draw.page)||1)===r.page; }
  function drawPins(){
    U.$$('.pin',cvs).forEach(function(p){ if(p!==tempPin) p.remove(); });
    if(!c||!W||loading) return;
    c.issues.filter(onThisPage).forEach(function(i){ var el=document.createElement('div'); el.className='pin s'+i.cur; el.style.left=(i.draw.x*W)+'px'; el.style.top=(i.draw.y*H)+'px';
      el.innerHTML='<b data-nid="'+esc(i.nid)+'" title="'+esc(i.title)+'">'+(i.no||'?')+'</b>'; cvs.appendChild(el); });
  }
  /* ページの読み込み番号：ページを素早く切り替えた時、最後に選んだページだけを表示する（ピンが別のページに付かないように） */
  var loadSeq=0, loading=false, pdfP=null;
  function showImg(url,my){
    return new Promise(function(ok,ng){ var img=new Image(); img.onload=function(){ if(!alive||my!==loadSeq){ ok(false); return; } cvs.innerHTML=''; W=img.naturalWidth; H=img.naturalHeight;
        /* 図面は原寸の大きさで置き、拡大縮小は transform で行う（ピンの位置＝図面上の割合とずれないように） */
        cvs.style.width=W+'px'; cvs.style.height=H+'px'; img.style.width=W+'px'; img.style.height=H+'px'; img.alt=d.title; cvs.appendChild(img); msg.hidden=true; loading=false; fit(); drawPins(); ok(true); };
      img.onerror=function(){ ng(new Error('図面の画像を表示できませんでした')); }; img.src=url; });
  }
  function loadPage(){
    var my=++loadSeq, idx=pageIdx;
    loading=true; U.$$('.pin',cvs).forEach(function(p){ p.remove(); });
    msg.hidden=false; msg.innerHTML='<div class="spin"></div><div>図面を読み込んでいます…</div>';
    var pg=view.querySelector('[data-pg]');
    var p;
    if(d.pdf){
      /* PDFはページを画像にして端末に一時保存（2回目からは速く開ける）。ページ数も一緒に保存。PDF本体の取得は1回だけ */
      var pfid=d.pages[0].fid, key='pdfpg_'+pfid+'_'+(idx+1);
      var ensureDoc=function(){ if(!pdfP){ pdfP=GK.fileBlob(pfid,{timeout:120000,cache:false}).then(blobToBuf).then(pdfDoc).then(function(doc){ pdf=doc; GK.idb.set('pdfn_'+pfid,doc.numPages); return doc; }); pdfP.catch(function(){ pdfP=null; }); } return pdfP; };
      p=GK.idb.get(key).then(function(hit){ if(hit) return hit;
        return ensureDoc().then(function(doc){ return renderPdfPage(doc,idx+1,2200); }).then(function(cv){ return IMG.blob(cv,'image/jpeg',0.85); }).then(function(b){ GK.idb.set(key,b); return b; }); })
        .then(function(b){ return my===loadSeq?showImg(URL.createObjectURL(b),my):false; })
        .then(function(shown){ if(!shown) return; return Promise.resolve(pdf?pdf.numPages:GK.idb.get('pdfn_'+pfid)).then(function(n){ if(n) pdfPages=Number(n)||1; navPg(); }); });
    } else {
      p=GK.fileBlob(d.pages[idx].fid,{timeout:90000}).then(function(b){ return my===loadSeq?showImg(URL.createObjectURL(b),my):false; }).then(function(shown){ if(shown) navPg(); });
    }
    function navPg(){ var n=d.pdf?pdfPages:d.pages.length; pg.hidden=n<=1; view.querySelector('[data-pl]').textContent=(pageIdx+1)+' / '+n; }
    return p.catch(function(e){ if(my!==loadSeq) return; msg.hidden=false; msg.innerHTML='<div>'+esc(e.message)+'</div><button type="button" class="btn" data-retry>もう一度</button>'; msg.querySelector('[data-retry]').onclick=loadPage; });
  }
  /* 操作：1本指で移動、2本指で拡大縮小、ホイールで拡大縮小、タップでピン追加（追加モード時） */
  var pts={}, start=null, pinch=null;
  stage.addEventListener('pointerdown',function(e){
    if(e.target.closest('.pin b')) return;
    stage.setPointerCapture(e.pointerId); pts[e.pointerId]={x:e.clientX,y:e.clientY};
    var ids=Object.keys(pts);
    if(ids.length===1) start={x:e.clientX,y:e.clientY,t:Date.now(),moved:false,multi:false};
    if(ids.length===2){ var a=pts[ids[0]], b=pts[ids[1]]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:s,mx:(a.x+b.x)/2,my:(a.y+b.y)/2}; if(start) start.multi=true; }
  });
  stage.addEventListener('pointermove',function(e){
    var p=pts[e.pointerId]; if(!p) return;
    var ids=Object.keys(pts), r=stage.getBoundingClientRect();
    if(ids.length===1){ tx+=e.clientX-p.x; ty+=e.clientY-p.y; if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8) start.moved=true; apply(); }
    pts[e.pointerId]={x:e.clientX,y:e.clientY};
    if(ids.length===2&&pinch){ var a=pts[ids[0]], b=pts[ids[1]], dd=Math.hypot(a.x-b.x,a.y-b.y), mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      tx+=mx-pinch.mx; ty+=my-pinch.my; pinch.mx=mx; pinch.my=my; zoomAt(mx-r.left,my-r.top,pinch.s*dd/pinch.d); }
  });
  function up(e){
    if(!pts[e.pointerId]) return;
    delete pts[e.pointerId];
    if(Object.keys(pts).length<2) pinch=null;
    if(!Object.keys(pts).length&&start){ var st0=start; start=null;
      if(!st0.moved&&!st0.multi&&Date.now()-st0.t<600) tap(e.clientX,e.clientY); }
  }
  stage.addEventListener('pointerup',up); stage.addEventListener('pointercancel',function(e){ delete pts[e.pointerId]; pinch=null; start=null; });
  stage.addEventListener('wheel',function(e){ e.preventDefault(); var r=stage.getBoundingClientRect(); zoomAt(e.clientX-r.left,e.clientY-r.top,s*Math.exp(-e.deltaY*0.0015)); },{passive:false});
  var lastTap=0;
  function tap(cx,cy){
    if(!W) return;
    if(loading){ if(addMode) GK.toast('図面を読み込み中です。少しお待ちください'); return; }
    var r=stage.getBoundingClientRect(), ix=(cx-r.left-tx)/s, iy=(cy-r.top-ty)/s;
    if(addMode){
      if(ix<0||iy<0||ix>W||iy>H){ GK.toast('図面の上をタップしてください'); return; }
      var x=Math.round(ix/W*10000)/10000, y=Math.round(iy/H*10000)/10000;   /* 図面の幅・高さに対する割合（0〜1）で保存 */
      setAdd(false);
      tempPin=document.createElement('div'); tempPin.className='pin temp'; tempPin.style.left=(x*W)+'px'; tempPin.style.top=(y*H)+'px'; tempPin.innerHTML='<b>＋</b>'; cvs.appendChild(tempPin);
      var ref=curRef();
      issueForm(pid,null,{fid:ref.fid,page:ref.page,x:x,y:y,name:d.title},function(it){ if(tempPin){ tempPin.remove(); tempPin=null; } I.loadProject(pid,true).then(function(x2){ c=x2; drawPins(); }); GK.toast('指摘 No.'+it.no+' を登録しました'); },function(){ if(tempPin){ tempPin.remove(); tempPin=null; } });
      return;
    }
    var now=Date.now(); if(now-lastTap<300){ var r2=stage.getBoundingClientRect(); zoomAt(cx-r2.left,cy-r2.top,s*2); lastTap=0; return; } lastTap=now;
  }
  stage.addEventListener('click',function(e){ var b=e.target.closest('.pin b[data-nid]'); if(!b) return; var i=I.issue(pid,b.dataset.nid); if(i) pinSheet(i); });
  function pinSheet(i){
    var sh=GK.sheet({ title:'No.'+i.no+'　'+i.title, html:'<div class="row wrap" style="margin-bottom:8px">'+I.stBadge(i.cur)+(i.assigneeName?'<span class="small">👷 '+esc(i.assigneeName)+'</span>':'')+(i.due?'<span class="small">⏰ '+esc(U.md(i.due))+'</span>':'')+'</div>'+(i.body?'<div style="white-space:pre-wrap">'+esc(i.body)+'</div>':'')+(i.photos.length?'<div class="thumbs" data-t>'+thumbsHtml(i.photos.slice(0,4))+'</div>':''),
      foot:'<a class="btn primary" href="#/issue/'+encodeURIComponent(pid)+'/'+encodeURIComponent(i.nid)+'">詳しく見る・状況を更新</a>' });
    bindThumbs(sh.body);
  }
  function setAdd(on){ addMode=on; view.querySelector('[data-ban]').hidden=!on; var b=view.querySelector('[data-add]'); if(b){ b.textContent=on?'✕ やめる':'📍 指摘を追加'; b.classList.toggle('primary',!on); } }
  var ab=view.querySelector('[data-add]'); if(ab) ab.onclick=function(){ if(!c){ GK.toast('読み込み中です'); return; } setAdd(!addMode); };
  view.querySelector('[data-zi]').onclick=function(){ var r=stage.getBoundingClientRect(); zoomAt(r.width/2,r.height/2,s*1.5); };
  view.querySelector('[data-zo]').onclick=function(){ var r=stage.getBoundingClientRect(); zoomAt(r.width/2,r.height/2,s/1.5); };
  view.querySelector('[data-fit]').onclick=fit;
  view.querySelector('[data-pp]').onclick=function(){ if(pageIdx>0){ pageIdx--; loadPage(); } };
  view.querySelector('[data-pn]').onclick=function(){ var n=d.pdf?pdfPages:d.pages.length; if(pageIdx<n-1){ pageIdx++; loadPage(); } };
  /* 画面の幅が変わった時（回転など）だけ全体表示に戻す。キーボードの出し入れ（高さだけ変わる）では拡大を保つ */
  var lastW=window.innerWidth;
  var onR=U.debounce(function(){ if(window.innerWidth!==lastW){ lastW=window.innerWidth; fit(); } },150); window.addEventListener('resize',onR);
  function begin(){
    if(!alive) return;
    d=findDrawing(pid,fid);
    if(!d){ msg.innerHTML='<div>図面が見つかりませんでした（削除された可能性があります）</div>'; return; }
    GK.setTitle(d.title);
    if(!d.pdf){ for(var k=0;k<d.pages.length;k++) if(d.pages[k].fid===fid){ pageIdx=k; break; } }
    var fi=focus?I.issue(pid,focus):null;
    if(fi&&fi.draw){ if(d.pdf) pageIdx=Math.max(0,(Number(fi.draw.page)||1)-1); else for(var k2=0;k2<d.pages.length;k2++) if(d.pages[k2].fid===fi.draw.fid) pageIdx=k2; }
    loadPage().then(function(){ if(fi&&fi.draw&&W&&onThisPage(fi)){ var r=stage.getBoundingClientRect(); var ns=fitScale()*3; s=ns; tx=r.width/2-fi.draw.x*W*s; ty=r.height/2-fi.draw.y*H*s; apply(); } });
  }
  Promise.all([I.loadDrawings(pid),I.loadProject(pid).then(function(x){ c=x; drawPins(); })]).then(begin).catch(function(e){ msg.innerHTML='<div>読み込めませんでした：'+esc(e.message)+'</div>'; });
  return function(){ alive=false; window.removeEventListener('resize',onR); };
}

/* ===================== 指摘の登録・編集 ===================== */
function issueForm(pid,it,drawRef,onSaved,onCancel){
  var isNew=!it, c=proj[pid], me=S.me(), files=[], saved=false;
  var j=it?it.raw:{};
  var cat0=it?it.cat:'是正';
  var html='<label class="fld"><span>指摘の内容（見出し）<span class="req">*</span></span><input data-f="title" maxlength="60" value="'+esc(it?it.title:'')+'" placeholder="例：ケーブルの固定不足" autofocus></label>'+
    '<div class="flabel">区分</div><div class="chips" data-cat style="margin-bottom:12px">'+CATS.map(function(x){ return '<button type="button" class="chip'+(x===cat0?' on':'')+'" data-v="'+x+'">'+x+'</button>'; }).join('')+'</div>'+
    '<label class="fld"><span>場所</span><input data-f="place" maxlength="40" value="'+esc(it?it.place:'')+'" placeholder="例：2F 廊下 天井"></label>'+
    '<label class="fld"><span>詳しい内容・直し方</span><textarea data-f="body" maxlength="1000">'+esc(it?it.body:'')+'</textarea></label>'+
    '<div class="grid2"><label class="fld"><span>担当</span><select data-f="aid">'+workersOpts(it?it.assigneeId:'')+'</select></label><label class="fld"><span>期限</span><input type="date" data-f="due" value="'+esc(it?it.due:'')+'"></label></div>'+
    (drawRef||(it&&it.draw)?'<div class="small muted" style="margin:-4px 0 10px">🗺 図面：'+esc((drawRef||it.draw).name||'')+'</div>':'')+
    '<div class="flabel">写真（直す前）</div><div data-ph></div>'+(it&&it.photos.length?'<div class="thumbs" data-old>'+thumbsHtml(it.photos)+'</div><div class="hint">登録済みの写真：'+it.photos.length+'枚</div>':'');
  var sh=GK.sheet({ title:isNew?'指摘を登録':'指摘を直す', html:html, foot:'<button type="button" class="btn primary" data-save>'+(isNew?'登録する':'保存する')+'</button>', onClose:function(){ if(!saved&&onCancel) onCancel(); } });
  photoPicker(sh.$('[data-ph]'),files);
  var cat=cat0;
  sh.$('[data-cat]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; cat=b.dataset.v; sh.$$('[data-cat] .chip').forEach(function(x){ x.classList.toggle('on',x===b); }); };
  sh.$('[data-save]').onclick=function(){
    var g=function(n){ return sh.$('[data-f="'+n+'"]').value.trim(); };
    var title=g('title'); if(!title){ GK.toast('指摘の内容（見出し）を入力してください',{err:true}); return; }
    var aid=g('aid'), w=D.worker(aid);
    var btn=sh.$('[data-save]'); btn.disabled=true;
    var no=it?it.no:(function(){ var mx=0; ((c&&c.issues)||[]).forEach(function(x){ mx=Math.max(mx,x.no); }); return mx+1; })();
    GK.busy(true,files.length?'写真を送信しています…':'保存中…');
    uploadPhotos(pid,files,'指摘','指摘_No'+no,function(n,t){ document.getElementById('busyTxt').textContent='写真を送信しています… '+n+' / '+t; }).then(function(ph){
      document.getElementById('busyTxt').textContent='保存中…';
      var cid=isNew?U.uid('c'):(j.cid||'');
      var body={ v:1, no:no, cat:cat, place:g('place'), body:g('body'), aid:aid, an:w?D.wname(w):'', due:g('due'), draw:it?it.draw:(drawRef?{fid:drawRef.fid,page:drawRef.page,x:drawRef.x,y:drawRef.y,name:drawRef.name}:null),
        p:(it?it.photos:[]).concat(ph.map(function(x){ return {id:x.id,name:x.name,t:'before'}; })), s:it?(Number(j.s)||0):0, cid:cid, ts:it?(j.ts||Date.now()):Date.now(), insp:it?it.insp:null };
      var data={'案件ID':pid,'種類':K_ISS,'タイトル':title,'内容':JSON.stringify(body)};
      if(it) data['メモID']=it.nid; else { data['作成者ID']=me.id; data['作成者名']=me.name; }
      return saveNote(data,isNew?cid:'',pid);
    }).then(function(note){
      saved=true; sh.close();
      return I.loadProject(pid,true).then(function(){ if(onSaved) onSaved({nid:String(note['メモID']||(it&&it.nid)||''),no:no}); });
    }).catch(function(err){ btn.disabled=false; GK.toast('保存できませんでした：'+err.message,{err:true,ms:7000}); }).finally(function(){ GK.busy(false); });
  };
  var old=sh.$('[data-old]'); if(old) bindThumbs(old);
}

/* ===================== 指摘の詳細 ===================== */
function renderIssue(view,params){
  var pid=params.pid, nid=params.nid;
  bindThumbs(view);   /* 写真のタップで拡大（1回だけ登録） */
  function draw(){
    if(!view.isConnected) return;
    var i=I.issue(pid,nid);
    if(!i){ view.innerHTML=proj[pid]?'<div class="empty">この指摘は見つかりませんでした（削除された可能性があります）</div>':'<div class="skel"></div><div class="skel"></div>'; return; }
    GK.setTitle('指摘 No.'+i.no);
    if(canEditIssue(i)) GK.setActions('<button type="button" data-ed>✏️ 直す</button>',function(r){ r.querySelector('[data-ed]').onclick=function(){ issueForm(pid,i,null,function(){ draw(); }); }; });
    var p=D.project(pid), today=U.today(), late=i.due&&i.due<today&&i.cur<2;
    var h='<div class="card"><div class="row" style="align-items:flex-start"><span class="is-no s'+i.cur+'">'+i.no+'</span><div class="grow"><div style="font-size:18px;font-weight:900;line-height:1.35">'+esc(i.title)+'</div><div class="small muted">'+esc(p?D.pname(p):'')+'</div></div></div>'+
      '<div class="row wrap mt8">'+I.stBadge(i.cur)+'<span class="badge gray">'+esc(i.cat)+'</span>'+(i.insp?'<a class="badge cyan" href="#/inspect/'+encodeURIComponent(pid)+'/'+encodeURIComponent(i.insp.nid||'')+'">検査から</a>':'')+'</div>'+
      '<dl class="kv mt8">'+(i.place?'<dt>場所</dt><dd>'+esc(i.place)+'</dd>':'')+'<dt>担当</dt><dd>'+esc(i.assigneeName||'未定')+'</dd><dt>期限</dt><dd class="'+(late?'late':'')+'">'+esc(i.due?U.md(i.due)+(late?'（期限切れ）':''):'なし')+'</dd>'+
      '<dt>登録</dt><dd>'+esc(i.creatorName+'　'+i.created)+'</dd>'+(i.body?'<dt>内容</dt><dd style="white-space:pre-wrap">'+esc(i.body)+'</dd>':'')+'</dl>'+
      (i.photos.length?'<div class="flabel mt8">写真（直す前）</div><div class="thumbs">'+thumbsHtml(i.photos,'前')+'</div>':'')+
      (i.draw&&i.draw.fid?'<div class="btns mt12"><a class="btn" href="#/drawing/'+encodeURIComponent(pid)+'/'+encodeURIComponent(i.draw.fid)+'?is='+encodeURIComponent(i.nid)+'">🗺 図面で場所を見る</a></div>':'')+'</div>';
    if(CAN.write()) h+='<div class="btns" style="margin-bottom:12px"><button type="button" class="btn primary" data-up style="flex:2">状況を更新する</button></div>';
    h+='<div class="sec-h">🕘 経過</div><div class="card"><div class="tl"><div class="ev s0"><b>登録</b>　<span class="small muted">'+esc(i.created+'　'+i.creatorName)+'</span></div>'+
      i.logs.map(function(l){ return '<div class="ev'+(l.s!=null?' s'+l.s:'')+'">'+(l.s!=null?'<b>'+esc(ST[l.s]||'')+'</b>':'<b>コメント</b>')+'　<span class="small muted">'+esc(l.at+'　'+l.by)+'</span>'+(l.c?'<div style="white-space:pre-wrap">'+esc(l.c)+'</div>':'')+(l.p&&l.p.length?'<div class="thumbs">'+thumbsHtml(l.p,'後')+'</div>':'')+'</div>'; }).join('')+'</div></div>';
    if(canEditIssue(i)) h+='<div class="btns" style="margin-bottom:24px"><button type="button" class="btn danger" data-del>この指摘を削除</button></div>';
    view.innerHTML=h;
    var upb=view.querySelector('[data-up]'); if(upb) upb.onclick=function(){ statusSheet(i,draw); };
    var db=view.querySelector('[data-del]'); if(db) db.onclick=function(){
      GK.confirm('指摘 No.'+i.no+'「'+i.title+'」を削除しますか？',{ok:'削除する',danger:true}).then(function(y){ if(!y) return;
        GK.busy(true,'削除中…');
        API.write('noteDelete',{id:i.nid}).then(function(){ GK.toast('削除しました'); return I.loadProject(pid,true); }).then(function(){ GK.go('/issues/'+encodeURIComponent(pid)+'?t=list',true); })
          .catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); }); };
  }
  draw();
  I.loadProject(pid).then(draw).catch(function(e){ view.innerHTML='<div class="card">読み込めませんでした：'+esc(e.message)+'</div>'; });
  if(!D.t.rd) D.ensure('rd').then(draw).catch(function(){});
}

/* 状況の更新（履歴を追記） */
function statusSheet(i,redraw){
  var opts=[];
  if(i.cur===0) opts=[[1,'対応中にする'],[2,'対応済にする']];
  else if(i.cur===1) opts=[[2,'対応済にする'],[0,'未対応に戻す']];
  else if(i.cur===2) opts=canConfirm(i)?[[3,'確認済にする（完了）'],[0,'差し戻す（未対応へ）']]:[[0,'未対応に戻す']];
  else opts=canConfirm(i)?[[0,'再開する（未対応へ）']]:[];
  var sel=opts.length?opts[0][0]:null, files=[], me=S.me();
  var sh=GK.sheet({ title:'No.'+i.no+' の状況を更新', html:
    '<div class="flabel">今の状況：'+I.stBadge(i.cur)+'</div><div class="chips" data-s style="margin:8px 0 12px">'+opts.map(function(o,k){ return '<button type="button" class="chip'+(k===0?' on':'')+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'<button type="button" class="chip'+(opts.length?'':' on')+'" data-v="">コメントだけ</button></div>'+
    (i.cur===2&&!canConfirm(i)?'<div class="hint" style="margin:-6px 0 10px">「確認済」にできるのは、指摘した人・現場責任者・管理者です。</div>':'')+
    '<label class="fld"><span>コメント</span><textarea data-c maxlength="1000" placeholder="例：結束バンドで固定しました"></textarea></label>'+
    '<div class="flabel">写真（直した後など）</div><div data-ph></div>',
    foot:'<button type="button" class="btn primary" data-save>記録する</button>' });
  if(!opts.length) sel=null;
  photoPicker(sh.$('[data-ph]'),files);
  sh.$('[data-s]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; sel=b.dataset.v===''?null:Number(b.dataset.v); sh.$$('[data-s] .chip').forEach(function(x){ x.classList.toggle('on',x===b); }); };
  sh.$('[data-save]').onclick=function(){
    var cm=sh.$('[data-c]').value.trim();
    if(sel==null&&!cm&&!files.length){ GK.toast('コメントか写真を入れてください',{err:true}); return; }
    var btn=sh.$('[data-save]'); btn.disabled=true;
    GK.busy(true,files.length?'写真を送信しています…':'保存中…');
    uploadPhotos(i.pid,files,'指摘','指摘_No'+i.no+'_対応',function(n,t){ document.getElementById('busyTxt').textContent='写真を送信しています… '+n+' / '+t; }).then(function(ph){
      var cid=U.uid('c');
      var data={'案件ID':i.pid,'種類':K_LOG,'タイトル':i.nid,'内容':JSON.stringify({v:1,i:i.nid,s:sel,c:cm,p:ph.map(function(x){ return {id:x.id,name:x.name,t:'after'}; }),cid:cid,ts:Date.now()}),'作成者ID':me.id,'作成者名':me.name};
      return saveNote(data,cid,i.pid);
    }).then(function(){ sh.close(); GK.toast('記録しました'); allC=null; return I.loadProject(i.pid,true); }).then(function(){ redraw(); })
      .catch(function(err){ btn.disabled=false; GK.toast('記録できませんでした：'+err.message,{err:true,ms:7000}); }).finally(function(){ GK.busy(false); });
  };
}

/* ===================== 検査 ===================== */
var SAMPLE_TPL=[
  { nid:'', title:'電気設備 自主検査（サンプル）', sample:true, items:['器具・機器の取付状態','配線・結線（端子の締付け）','ケーブルの支持・固定・保護','絶縁抵抗測定','接地抵抗測定','回路・相の確認（表示との一致）','照明・コンセントの点灯・通電確認','分電盤の回路表示・銘板','清掃・片付け・残材の回収'] },
  { nid:'', title:'完了確認（サンプル）', sample:true, items:['図面・仕様どおりの施工','仕上がり（傷・汚れ・すき間）','開口部・貫通部の処理','清掃・片付け','残材・ゴミの回収','お客様への説明'] }
];
var tplCache=null;
function loadTpl(force){
  if(tplCache&&!force) return Promise.resolve(tplCache);
  return API.call('notesList',{type:K_TPL},{timeout:30000}).then(function(res){
    tplCache=(res.notes||[]).map(function(n){ var j=json(n['内容']); return { nid:String(n['メモID']), title:String(n['タイトル']||''), items:(j.items||[]).map(String).filter(Boolean), creatorId:String(n['作成者ID']||'') }; });
    return tplCache; });
}
function startInspect(pid){
  var s=GK.sheet({ title:'検査を始める', html:'<div class="skel"></div>' });
  loadTpl().then(function(tpls){
    var all=tpls.concat(SAMPLE_TPL);
    s.body.innerHTML='<div class="small muted" style="margin-bottom:8px">検査項目のテンプレートを選んでください</div><div class="list">'+all.map(function(t,k){ return '<button type="button" class="item" data-k="'+k+'"><span class="ico">📋</span><div class="grow"><div class="t" style="font-size:15px">'+esc(t.title)+'</div><div class="s">'+t.items.length+'項目'+(t.sample?'・サンプル':'')+'</div></div><span class="chev">›</span></button>'; }).join('')+
      '<button type="button" class="item" data-k="-1"><span class="ico">✏️</span><div class="grow"><div class="t" style="font-size:15px">白紙から（項目を自分で入れる）</div></div><span class="chev">›</span></button></div>';
    s.body.onclick=function(e){ var b=e.target.closest('[data-k]'); if(!b) return; var k=+b.dataset.k; var t=k>=0?all[k]:{title:'',items:[]};
      newInspDraft={pid:pid,title:t.title.replace(/（サンプル）$/,''),items:t.items.slice(),tpl:t.title}; s.close(); GK.go('/inspect/'+encodeURIComponent(pid)+'/new'); };
  }).catch(function(e){ s.body.innerHTML='<div class="card">読み込めませんでした：'+esc(e.message)+'</div>'; });
}
var newInspDraft=null;
function renderInspect(view,params){
  var pid=params.pid, nid=params.nid, isNew=nid==='new', me=S.me();
  var x=null;
  function init(c){
    if(isNew){
      var dr=newInspDraft&&newInspDraft.pid===pid?newInspDraft:{title:'',items:[],tpl:''};
      x={ v:1, name:dr.title||'', date:U.today(), insp:{id:me.id,name:me.name}, wit:'', note:'', tpl:dr.tpl||'', items:dr.items.map(function(l){ return {l:l,r:0,n:''}; }), cid:U.uid('c') };
      if(!x.items.length) x.items.push({l:'',r:0,n:''});
    } else {
      var hit=(c.insp||[]).filter(function(y){ return y.nid===nid; })[0];
      if(!hit){ view.innerHTML='<div class="empty">この検査記録は見つかりませんでした</div>'; return false; }
      x=JSON.parse(JSON.stringify(hit));
      linkIssues(c);
    }
    return true;
  }
  /* 「否」の項目が、すでに指摘として登録済みかを指摘の側からも確認する（検査記録に書き戻せない人が登録した分も含む＝重複登録防止） */
  function linkIssues(c){
    ((c&&c.issues)||[]).forEach(function(i){ if(i.insp&&String(i.insp.nid)===String(nid)){ var r=x.items[Number(i.insp.idx)]; if(r&&!r.iss) r.iss=i.nid; } });
  }
  var editable=false;
  function draw(){
    if(!view.isConnected) return;
    editable=CAN.write()&&(isNew||CAN.admin()||x.creatorId===me.id);
    GK.setTitle(isNew?'検査を記録':(x.title||x.name||'検査'));
    if(!isNew) GK.setActions('<a href="#/print/inspect/'+encodeURIComponent(pid)+'/'+encodeURIComponent(nid)+'">🖨 印刷</a>');
    var p=D.project(pid);
    var ok=0, ng=0, un=0; x.items.forEach(function(r){ if(r.r===1) ok++; else if(r.r===2) ng++; else if(!r.r) un++; });
    var dis=editable?'':' disabled';
    var h='<div class="card"><div class="small muted">'+esc(p?D.pname(p):'')+'</div>'+
      '<label class="fld"><span>検査名<span class="req">*</span></span><input data-h="name" maxlength="60" value="'+esc(x.name||x.title||'')+'" placeholder="例：2F 配線完了検査"'+dis+'></label>'+
      '<div class="grid2"><label class="fld"><span>検査日</span><input type="date" data-h="date" value="'+esc(x.date||'')+'"'+dis+'></label><label class="fld"><span>立会者</span><input data-h="wit" maxlength="40" value="'+esc(x.wit||'')+'"'+dis+'></label></div>'+
      '<div class="small">検査者：'+esc((x.insp&&x.insp.name)||x.creatorName||'')+'</div></div>';
    h+='<div class="card"><div class="row"><h2 class="grow" style="margin:0">検査項目</h2><span class="small"><span style="color:var(--ok)">良 '+ok+'</span>・<span style="color:var(--ng)">否 '+ng+'</span>・未 '+un+'</span></div>'+
      x.items.map(function(r,k){ return '<div class="ck" data-i="'+k+'"><div class="grow">'+(editable&&!r.l?'<input class="inp" data-l="'+k+'" placeholder="検査項目を入力" maxlength="60">':'<div class="lb">'+(k+1)+'. '+esc(r.l)+'</div>')+'</div>'+
        '<div class="rs">'+[[1,'良'],[2,'否'],[3,'―']].map(function(o){ return '<button type="button" class="r'+o[0]+(r.r===o[0]?' on':'')+'" data-r="'+k+'" data-v="'+o[0]+'"'+dis+'>'+o[1]+'</button>'; }).join('')+'</div>'+
        (editable?'<div class="note"><input class="inp" data-n="'+k+'" maxlength="200" placeholder="備考（数値・気づいた点）" value="'+esc(r.n||'')+'"></div>':(r.n?'<div class="note small muted">'+esc(r.n)+'</div>':''))+
        (r.r===2&&r.iss?'<div class="lnk small"><a href="#/issue/'+encodeURIComponent(pid)+'/'+encodeURIComponent(r.iss)+'">📍 指摘として登録済み ›</a></div>':'')+'</div>'; }).join('')+
      (editable?'<div class="btns mt8"><button type="button" class="btn sm" data-addi>＋ 項目を追加</button></div>':'')+'</div>';
    h+='<div class="card"><label class="fld mb0"><span>所見・備考</span><textarea data-h="note" maxlength="1000"'+dis+'>'+esc(x.note||'')+'</textarea></label></div>';
    var ngNoIss=x.items.filter(function(r){ return r.r===2&&!r.iss; }).length;
    if(editable) h+='<div class="btns" style="margin-bottom:12px">'+(!isNew?'<button type="button" class="btn danger" data-del>削除</button>':'')+'<button type="button" class="btn primary" data-save style="flex:2">保存する</button></div>';
    if(!isNew&&ngNoIss&&CAN.write()) h+='<div class="card" style="background:var(--ngSoft)"><b>「否」が '+ngNoIss+' 件あります</b><div class="small">指摘として登録すると、担当・期限を決めて直したかどうかを管理できます。</div><div class="btns mt8"><button type="button" class="btn danger" data-toiss>否の項目を指摘に登録</button></div></div>';
    if(!editable&&!isNew) h+='<div class="hint">この検査記録を直せるのは、記録した人と管理者です。</div>';
    view.innerHTML=h;
  }
  function collect(){
    U.$$('[data-h]',view).forEach(function(el){ x[el.dataset.h]=el.value.trim(); });
    U.$$('[data-n]',view).forEach(function(el){ x.items[+el.dataset.n].n=el.value.trim(); });
    U.$$('[data-l]',view).forEach(function(el){ x.items[+el.dataset.l].l=el.value.trim(); });
  }
  view.addEventListener('click',function(e){
    var b=e.target.closest('[data-r]');
    if(b&&editable){ collect(); var k=+b.dataset.r, v=+b.dataset.v; x.items[k].r=(x.items[k].r===v)?0:v; draw(); return; }
    if(e.target.closest('[data-addi]')){ collect(); x.items.push({l:'',r:0,n:''}); draw(); var ins=U.$$('[data-l]',view); if(ins.length) ins[ins.length-1].focus(); return; }
    if(e.target.closest('[data-save]')){ collect(); save(); return; }
    if(e.target.closest('[data-del]')){ GK.confirm('この検査記録を削除しますか？',{ok:'削除する',danger:true}).then(function(y){ if(!y) return; GK.busy(true,'削除中…');
      API.write('noteDelete',{id:nid}).then(function(){ GK.toast('削除しました'); return I.loadProject(pid,true); }).then(function(){ GK.go('/issues/'+encodeURIComponent(pid)+'?t=insp',true); })
        .catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); }); return; }
    if(e.target.closest('[data-toiss]')){ toIssues(); }
  });
  function payload(){
    var o={ v:1, name:x.name, date:x.date, insp:x.insp||{id:me.id,name:me.name}, wit:x.wit||'', note:x.note||'', tpl:x.tpl||'', cid:x.cid||U.uid('c'), ts:x.ts||Date.now(),
      items:x.items.filter(function(r){ return r.l; }).map(function(r){ var o2={l:r.l,r:r.r||0}; if(r.n) o2.n=r.n; if(r.iss) o2.iss=r.iss; return o2; }) };
    return o;
  }
  function save(){
    if(!x.name){ GK.toast('検査名を入力してください',{err:true}); return; }
    if(!x.items.some(function(r){ return r.l; })){ GK.toast('検査項目を1つ以上入れてください',{err:true}); return; }
    var body=payload();
    var data={'案件ID':pid,'種類':K_INSP,'タイトル':x.name,'内容':JSON.stringify(body)};
    if(!isNew) data['メモID']=nid; else { data['作成者ID']=me.id; data['作成者名']=me.name; }
    var btn=view.querySelector('[data-save]'); if(!GK.lockBtn(btn)) return;
    GK.busy(true,'保存中…');
    saveNote(data,isNew?body.cid:'',pid).then(function(note){ GK.toast('検査記録を保存しました'); newInspDraft=null; return I.loadProject(pid,true).then(function(){ return note; }); })
      .then(function(note){ var id=String(note['メモID']||nid); GK.go('/inspect/'+encodeURIComponent(pid)+'/'+encodeURIComponent(id),true); })
      .catch(function(err){ if(btn) btn.disabled=false; GK.toast('保存できませんでした：'+err.message,{err:true,ms:7000}); }).finally(function(){ GK.busy(false); });
  }
  /* 「否」の項目を指摘として登録し、検査記録に紐づける */
  var toIssBusy=false;
  function toIssues(){
    if(toIssBusy) return; toIssBusy=true;
    /* 最新の指摘を読み直してから、まだ登録されていない「否」だけを登録する */
    GK.busy(true,'確認中…');
    I.loadProject(pid,true).then(function(c0){ GK.busy(false); linkIssues(c0); toIssues2(); },function(err){ GK.busy(false); toIssBusy=false; GK.toast('読み込めませんでした：'+err.message,{err:true}); });
  }
  function toIssues2(){
    var ngs=[]; x.items.forEach(function(r,k){ if(r.r===2&&!r.iss&&r.l) ngs.push(k); });
    if(!ngs.length){ toIssBusy=false; draw(); GK.toast('「否」の項目はすべて指摘として登録済みです'); return; }
    GK.confirm('「否」の '+ngs.length+' 項目を指摘として登録します。\n（担当・期限は、あとで各指摘の「直す」から入れられます）',{ok:'登録する'}).then(function(y){ if(!y){ toIssBusy=false; return; }
      GK.busy(true,'登録中…');
      var c=proj[pid], mx=0; ((c&&c.issues)||[]).forEach(function(i){ mx=Math.max(mx,i.no); });
      var seq=Promise.resolve();
      ngs.forEach(function(k){ seq=seq.then(function(){ mx++; var r=x.items[k], cid=U.uid('c');
        var body={v:1,no:mx,cat:'是正',place:'',body:(r.n?r.n+'\n':'')+'（検査「'+x.name+'」'+U.md(x.date)+'）',aid:'',an:'',due:'',draw:null,p:[],s:0,cid:cid,ts:Date.now(),insp:{nid:nid,idx:k}};
        return saveNote({'案件ID':pid,'種類':K_ISS,'タイトル':r.l,'内容':JSON.stringify(body),'作成者ID':me.id,'作成者名':me.name},cid,pid).then(function(note){ r.iss=String(note['メモID']||''); }); }); });
      seq.then(function(){
        /* 検査記録に「登録済み」を書き戻す（記録した本人・管理者のみ。それ以外は指摘だけ登録） */
        if(CAN.admin()||x.creatorId===me.id) return API.write('noteSave',{data:{'メモID':nid,'内容':JSON.stringify(payload())}});
      }).then(function(){ GK.toast(ngs.length+'件の指摘を登録しました'); return I.loadProject(pid,true); }).then(function(c2){ init(c2); draw(); })
        .catch(function(err){ GK.toast('登録できませんでした：'+err.message,{err:true}); I.loadProject(pid,true).catch(function(){}); }).finally(function(){ toIssBusy=false; GK.busy(false); });
    });
  }
  view.innerHTML='<div class="skel"></div><div class="skel"></div>';
  (isNew?Promise.resolve(proj[pid]||{insp:[]}):I.loadProject(pid)).then(function(c){ if(init(c)) draw(); }).catch(function(e){ view.innerHTML='<div class="card">読み込めませんでした：'+esc(e.message)+'</div>'; });
  if(!D.t.rd) D.ensure('rd').catch(function(){});
}

/* 検査テンプレート（会社共通）の管理 */
function tplManager(){
  var s=GK.sheet({ title:'検査項目のテンプレート', html:'<div class="skel"></div>' });
  function draw(){
    loadTpl(true).then(function(tpls){
      s.body.innerHTML='<div class="hint" style="margin-bottom:8px">会社共通のテンプレートです。検査を始める時に選べます。サンプルは自由に写して使ってください。</div>'+
        '<div class="list">'+tpls.map(function(t,k){ return '<button type="button" class="item" data-e="'+k+'"><span class="ico">📋</span><div class="grow"><div class="t" style="font-size:15px">'+esc(t.title)+'</div><div class="s">'+t.items.length+'項目</div></div><span class="chev">›</span></button>'; }).join('')+
        SAMPLE_TPL.map(function(t,k){ return '<button type="button" class="item" data-s="'+k+'"><span class="ico">📄</span><div class="grow"><div class="t" style="font-size:15px">'+esc(t.title)+'</div><div class="s">'+t.items.length+'項目・タップで写して編集</div></div><span class="chev">›</span></button>'; }).join('')+'</div>'+
        (CAN.write()?'<div class="btns"><button type="button" class="btn primary" data-new>＋ 新しいテンプレート</button></div>':'');
      s.body.onclick=function(e){ var b=e.target.closest('[data-e],[data-s],[data-new]'); if(!b) return;
        if(b.dataset.e!=null) edit(tpls[+b.dataset.e]); else if(b.dataset.s!=null){ var sm=SAMPLE_TPL[+b.dataset.s]; edit({nid:'',title:sm.title.replace(/（サンプル）$/,''),items:sm.items.slice()}); } else edit({nid:'',title:'',items:[]}); };
    }).catch(function(e){ s.body.innerHTML='<div class="card">読み込めませんでした：'+esc(e.message)+'</div>'; });
  }
  function edit(t){
    var mine=!t.nid||CAN.admin()||t.creatorId===S.me().id, canW=CAN.write()&&mine;
    var e=GK.sheet({ title:t.nid?'テンプレートを直す':'新しいテンプレート', html:'<label class="fld"><span>テンプレート名<span class="req">*</span></span><input data-t maxlength="60" value="'+esc(t.title)+'"'+(canW?'':' disabled')+'></label>'+
      '<label class="fld"><span>検査項目（1行に1項目）</span><textarea data-i style="min-height:220px"'+(canW?'':' disabled')+'>'+esc(t.items.join('\n'))+'</textarea></label>'+(canW?'':'<div class="hint">このテンプレートを直せるのは、作った人と管理者です。</div>'),
      foot:canW?((t.nid?'<button type="button" class="btn danger" data-d>削除</button>':'')+'<button type="button" class="btn primary" data-sv>保存</button>'):'' });
    if(!canW) return;
    e.$('[data-sv]').onclick=function(){
      var title=e.$('[data-t]').value.trim(), items=e.$('[data-i]').value.split('\n').map(function(x){ return x.trim().slice(0,60); }).filter(Boolean).slice(0,80);
      if(!title||!items.length){ GK.toast('名前と項目を入れてください',{err:true}); return; }
      var me=S.me(), data={'案件ID':'','種類':K_TPL,'タイトル':title,'内容':JSON.stringify({v:1,items:items})};
      if(t.nid) data['メモID']=t.nid; else { data['作成者ID']=me.id; data['作成者名']=me.name; }
      var btn=e.$('[data-sv]'); if(!GK.lockBtn(btn)) return;
      var cid=U.uid('c'); if(!t.nid) data['内容']=JSON.stringify({v:1,items:items,cid:cid});
      GK.busy(true,'保存中…');
      saveNote(data,t.nid?'':cid,'').then(function(){ e.close(); GK.toast('保存しました'); draw(); }).catch(function(err){ btn.disabled=false; GK.toast('保存できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); });
    };
    var d=e.$('[data-d]'); if(d) d.onclick=function(){ GK.confirm('テンプレート「'+t.title+'」を削除しますか？',{ok:'削除する',danger:true}).then(function(y){ if(!y) return; GK.busy(true,'削除中…');
      API.write('noteDelete',{id:t.nid}).then(function(){ e.close(); GK.toast('削除しました'); draw(); }).catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); }); };
  }
  draw();
}

/* ===================== 印刷（A4縦・IPA明朝。印刷画面で「PDFに保存」を選ぶとPDFになります） ===================== */
function printHead(view,title,onReady){
  GK.setActions('<button type="button" data-pr>🖨 印刷・PDF</button>',function(r){ r.querySelector('[data-pr]').onclick=function(){ window.print(); }; });
  view.innerHTML='<div class="card no-print small">印刷画面で「PDFに保存」を選ぶとPDFにできます（用紙：A4縦）。文字は「IPA明朝」で表示します（この端末にIPA明朝が無く、アプリにもフォントを置いていない場合は、端末の明朝体になります）。<div data-ld class="mt8 muted"></div></div><div class="pr-screen pr-doc" data-doc></div>';
  return view.querySelector('[data-doc]');
}
function loadImgs(root,lab){
  var imgs=U.$$('img[data-pfid]',root), n=0;
  if(!imgs.length){ lab.textContent=''; return Promise.resolve(); }
  lab.textContent='写真を読み込んでいます… 0 / '+imgs.length;
  return Promise.all(imgs.map(function(img){ return GK.fileBlob(img.dataset.pfid).then(function(b){ img.src=URL.createObjectURL(b); },function(){ img.alt='（写真を読み込めませんでした）'; })
    .then(function(){ n++; lab.textContent=n<imgs.length?'写真を読み込んでいます… '+n+' / '+imgs.length:'準備ができました。右上の「🖨 印刷・PDF」を押してください。'; }); }));
}
function printIssues(view,params,q){
  var pid=params.pid, f=q.get('f')||'open';
  var doc=printHead(view);
  I.loadProject(pid).then(function(c){
    if(!view.isConnected) return;
    var p=D.project(pid)||{}, arr=c.issues.filter(function(i){ return f==='all'||i.cur<2; }).sort(function(a,b){ return a.no-b.no; });
    var h='<h1>指摘・是正一覧表</h1><div class="pr-meta"><span>工事名：'+esc(p['案件名']||D.pname(p))+'</span><span>出力日：'+esc(U.jp(U.today()))+'</span></div>'+
      '<div class="pr-meta"><span>対象：'+(f==='all'?'すべて':'未完了のみ')+'（'+arr.length+'件）</span><span>'+esc(GK.CFG.COMPANY_NAME||'')+'</span></div>'+
      '<table class="pr-tbl"><thead><tr><th style="width:9mm">No</th><th style="width:30mm">場所・図面</th><th>指摘内容</th><th style="width:26mm">担当・期限</th><th style="width:22mm">状況</th><th style="width:62mm">写真</th></tr></thead><tbody>'+
      arr.map(function(i){ var after=[]; i.logs.forEach(function(l){ (l.p||[]).forEach(function(x){ after.push(x); }); });
        var last=i.logs.filter(function(l){ return l.s!=null; }).slice(-1)[0];
        return '<tr><td style="text-align:center">'+i.no+'</td><td>'+esc(i.place||'')+(i.draw&&i.draw.name?'<br><small>図面：'+esc(i.draw.name)+'</small>':'')+'</td><td><b>'+esc(i.title)+'</b>'+(i.body?'<br>'+esc(i.body).replace(/\n/g,'<br>'):'')+(last&&last.c?'<br><small>対応：'+esc(last.c)+'</small>':'')+'</td>'+
          '<td>'+esc(i.assigneeName||'未定')+'<br>'+esc(i.due?U.mdS(i.due):'')+'</td><td>'+esc(ST[i.cur])+(i.closedAt?'<br><small>'+esc(i.closedAt.slice(0,10))+'</small>':'')+'</td>'+
          '<td>'+i.photos.slice(0,2).map(function(x){ return '<img data-pfid="'+esc(x.id)+'" alt="直す前">'; }).join('')+after.slice(-2).map(function(x){ return '<img data-pfid="'+esc(x.id)+'" alt="直した後">'; }).join('')+'</td></tr>'; }).join('')+
      '</tbody></table>'+(arr.length?'':'<p>該当する指摘はありません。</p>');
    doc.innerHTML=h;
    return loadImgs(doc,view.querySelector('[data-ld]'));
  }).catch(function(e){ doc.innerHTML='読み込めませんでした：'+esc(e.message); });
  if(!D.t.rd) D.ensure('rd').catch(function(){});
}
function printInspect(view,params){
  var pid=params.pid, nid=params.nid;
  var doc=printHead(view);
  I.loadProject(pid).then(function(c){
    if(!view.isConnected) return;
    var x=(c.insp||[]).filter(function(y){ return y.nid===nid; })[0];
    if(!x){ doc.innerHTML='この検査記録は見つかりませんでした'; return; }
    var p=D.project(pid)||{}, ok=0, ng=0, na=0;
    (x.items||[]).forEach(function(r){ if(r.r===1) ok++; else if(r.r===2) ng++; else if(r.r===3) na++; });
    doc.innerHTML='<h1>検査記録</h1><table class="pr-tbl" style="margin-bottom:4mm"><tbody>'+
      '<tr><th style="width:28mm">工事名</th><td colspan="3">'+esc(p['案件名']||D.pname(p))+'</td></tr>'+
      '<tr><th>検査名</th><td colspan="3">'+esc(x.name||x.title||'')+'</td></tr>'+
      '<tr><th>検査日</th><td>'+esc(U.jp(x.date))+'</td><th style="width:22mm">検査者</th><td>'+esc((x.insp&&x.insp.name)||x.creatorName||'')+'</td></tr>'+
      '<tr><th>立会者</th><td>'+esc(x.wit||'')+'</td><th>結果</th><td>良 '+ok+'・否 '+ng+'・該当なし '+na+'</td></tr></tbody></table>'+
      '<table class="pr-tbl"><thead><tr><th style="width:9mm">No</th><th>検査項目</th><th style="width:16mm">結果</th><th style="width:70mm">備考</th></tr></thead><tbody>'+
      (x.items||[]).map(function(r,k){ return '<tr><td style="text-align:center">'+(k+1)+'</td><td>'+esc(r.l)+'</td><td style="text-align:center">'+({1:'良',2:'否',3:'―'}[r.r]||'')+'</td><td>'+esc(r.n||'')+(r.iss?' ※指摘登録':'')+'</td></tr>'; }).join('')+
      '</tbody></table>'+(x.note?'<p><b>所見・備考</b><br>'+esc(x.note).replace(/\n/g,'<br>')+'</p>':'')+
      '<div class="pr-meta" style="margin-top:8mm"><span>'+esc(GK.CFG.COMPANY_NAME||'')+'</span><span>確認印：　　　　　　</span></div>';
    view.querySelector('[data-ld]').textContent='準備ができました。右上の「🖨 印刷・PDF」を押してください。';
  }).catch(function(e){ doc.innerHTML='読み込めませんでした：'+esc(e.message); });
  if(!D.t.rd) D.ensure('rd').catch(function(){});
}

})();
