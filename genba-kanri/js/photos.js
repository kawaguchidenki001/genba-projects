/* 現場管理 photos.js v1.0.0 — 工事写真（一覧・小黒板カメラ・写真台帳）
 * 保存先：現場フォルダ/写真/<工種>（GASの uploadPhoto dest:'photo', kind:工種）。Gen-Canの工事写真と同じ場所です。
 * 写真台帳：GASの makeLedgerFiles（Gen-Canと同じテンプレート「工事写真台帳テンプレート_GenCan標準」）で PDF / Excel を作成。 */
(function(){
'use strict';
var U=GK.u, D=GK.data, S=GK.session, CAN=GK.can, API=GK.api, IMG=GK.img, esc=U.esc;

GK.route('/photos',{ tab:'photos', title:'工事写真', render:renderPick });
GK.route('/photos/:id',{ tab:'photos', title:function(p){ var x=D.project(p.id); return x?D.pname(x)+'：写真':'工事写真'; }, back:'/photos', render:renderAlbum });
GK.route('/camera/:id',{ tab:'photos', title:'小黒板カメラ', back:function(p){ return '/photos/'+encodeURIComponent(p.id); }, noTab:true, full:true, noZoom:true, render:renderCamera });

var BASE_KINDS=['調査','施工','完了'];   /* Gen-Canが現場フォルダに自動で作る写真の工種フォルダ */
var RECENT_KEY='photo_recent';
function pushRecent(id){ var a=GK.cache.get(RECENT_KEY)||[]; a=[id].concat(a.filter(function(x){return x!==id;})).slice(0,6); GK.cache.set(RECENT_KEY,a); }

/* ===================== 現場を選ぶ ===================== */
function renderPick(view){
  function draw(){
    var rec=(GK.cache.get(RECENT_KEY)||[]).map(D.project).filter(Boolean);
    var act=D.activeProjects();
    var h='<div class="card row"><div class="grow"><b>📷 小黒板カメラ</b><div class="small muted">現場を選んで、黒板付きの写真を撮ります</div></div><button type="button" class="btn primary sm" data-cam>撮影</button></div>';
    if(rec.length) h+='<div class="sec-h">最近使った現場</div><div class="list">'+rec.map(item).join('')+'</div>';
    h+='<div class="sec-h">進行中の現場<button type="button" class="btn sm right" data-all>他の現場…</button></div>';
    h+=act.length?'<div class="list">'+act.map(item).join('')+'</div>':(D.t.rd?'<div class="empty">進行中の現場はありません</div>':'<div class="skel"></div><div class="skel"></div>');
    view.innerHTML=h;
    view.querySelector('[data-cam]').onclick=function(){ GK.pickProject({title:'撮影する現場を選ぶ'}).then(function(p){ if(p) GK.go('/camera/'+encodeURIComponent(p['案件ID'])); }); };
    view.querySelector('[data-all]').onclick=function(){ GK.pickProject({title:'写真を見る現場を選ぶ'}).then(function(p){ if(p) GK.go('/photos/'+encodeURIComponent(p['案件ID'])); }); };
  }
  function item(p){ return '<a class="item" href="#/photos/'+encodeURIComponent(p['案件ID'])+'"><span class="ico" style="background:#fce7f3;color:#be185d">📷</span><div class="grow"><div class="t ellipsis">'+esc(D.pname(p))+'</div><div class="s ellipsis">'+esc([p['顧客'],p['場所']].filter(Boolean).join('・'))+'</div></div><span class="chev">›</span></a>'; }
  draw();
  return GK.on('data',function(k){ if(k==='rd') draw(); });
}

/* ファイル名から日付・工種・内容を読み取る（このアプリ／Gen-Canの命名どちらにも対応） */
function parseName(name){
  var base=String(name||'').replace(/\.[^.]+$/,'').replace(/^台帳候補_/,'');
  var out={kind:'',place:'',date:''};
  var m=/(20\d{2})(\d{2})(\d{2})/.exec(base);
  if(m) out.date=m[1]+'-'+m[2]+'-'+m[3];
  else { var t=/^(?:board|photo)_(\d{13})/.exec(base); if(t) out.date=U.ymd(new Date(+t[1])); }
  if(/^(board|photo|rec)_/.test(base)) return out;
  var parts=base.split('_'), di=-1;
  for(var i=0;i<parts.length;i++){ if(/^20\d{6}$/.test(parts[i])){ di=i; break; } }
  var head=di>=0?parts.slice(0,di):[];
  if(head.length){ out.kind=head[0]==='写真'?'':head[0]; out.place=head.slice(1).join(' '); }
  return out;
}
GK.parsePhotoName=parseName;

/* ===================== 写真一覧（現場ごと） ===================== */
var albumCache={};   /* 画面を行き来しても再読み込みしないように（この起動中だけ） */
function renderAlbum(view,params){
  var id=params.id, p=D.project(id);
  pushRecent(id);
  var st=albumCache[id]||(albumCache[id]={folders:null,fid:'',photos:{},err:''});
  var sel=null;   /* 台帳用の選択（null＝選択していない） */
  var showN=240;
  GK.setActions('<button type="button" data-cam>📷 撮影</button>',function(r){ r.querySelector('[data-cam]').onclick=function(){ GK.go('/camera/'+encodeURIComponent(id)); }; });
  view.innerHTML='<div class="chips scroll" data-fd style="margin-bottom:10px"></div><div class="btns" style="margin-bottom:12px">'+
    (CAN.write()?'<button type="button" class="btn sm" data-add>🖼 写真を追加</button>':'')+
    '<button type="button" class="btn sm" data-led>📒 写真台帳</button><button type="button" class="btn sm" data-reload>↻ 更新</button></div><div data-grid></div><div data-dock></div>';
  var key=function(){ return st.fid||'_all'; };
  function loadFolders(){
    return API.call('photoFolders',{id:id},{timeout:40000}).then(function(res){ st.folders=(res.folders||[]).filter(function(f){ return f&&f.id; }); drawFolders(); })
      .catch(function(){ st.folders=st.folders||[]; drawFolders(); });
  }
  function loadPhotos(force){
    var k=key(); if(st.photos[k]&&!force){ drawGrid(); return Promise.resolve(); }
    st.err=''; st.photos[k]=null; drawGrid();
    var req=st.fid?API.call('photosByFolder',{fid:st.fid},{timeout:60000}):API.call('listPhotos',{id:id},{timeout:60000});
    return req.then(function(res){ st.photos[k]=(res.photos||[]); drawGrid(); })
      .catch(function(e){ st.err=e.message; st.photos[k]=null; drawGrid(); });
  }
  function drawFolders(){
    var el=view.querySelector('[data-fd]'); if(!el) return;
    var fs=st.folders||[];
    el.innerHTML='<button type="button" class="chip'+(!st.fid?' on':'')+'" data-fid="">すべて</button>'+fs.map(function(f){ return '<button type="button" class="chip'+(st.fid===f.id?' on':'')+'" data-fid="'+esc(f.id)+'">'+esc(f.name)+'</button>'; }).join('');
  }
  function drawGrid(){
    var el=view.querySelector('[data-grid]'); if(!el) return;
    var arr=st.photos[key()];
    if(arr==null){ el.innerHTML=st.err?'<div class="card">写真を読み込めませんでした：'+esc(st.err)+'<div class="btns mt8"><button type="button" class="btn sm" data-retry>もう一度</button></div></div>':'<div class="ph-grid">'+'<div class="ph skel" style="height:auto;margin:0"></div>'.repeat(9)+'</div>';
      var rt=el.querySelector('[data-retry]'); if(rt) rt.onclick=function(){ loadPhotos(true); }; return; }
    if(!arr.length){ el.innerHTML='<div class="empty"><div class="big">📷</div>写真はまだありません<br>上の「📷 撮影」から撮れます</div>'; drawDock(); return; }
    var groups={}, order=[];
    arr.slice(0,showN).forEach(function(ph){ var d=parseName(ph.name).date||'日付不明'; if(!groups[d]){ groups[d]=[]; order.push(d); } groups[d].push(ph); });
    order.sort(function(a,b){ return a==='日付不明'?1:b==='日付不明'?-1:b.localeCompare(a); });
    el.innerHTML=order.map(function(d){ return '<div class="ph-date">'+esc(d==='日付不明'?d:U.jp(d))+'　<span class="muted small">'+groups[d].length+'枚</span></div><div class="ph-grid">'+groups[d].map(cell).join('')+'</div>'; }).join('')+
      (arr.length>showN?'<div class="btns mt12"><button type="button" class="btn" data-more>もっと見る（残り'+(arr.length-showN)+'枚）</button></div>':'');
    var mo=el.querySelector('[data-more]'); if(mo) mo.onclick=function(){ showN+=240; drawGrid(); };
    drawDock();
  }
  function cell(ph){
    var info=parseName(ph.name), n=sel?sel.indexOf(ph.id):-1;
    return '<button type="button" class="ph'+(n>=0?' on':'')+'" data-pid="'+esc(ph.id)+'"><img loading="lazy" alt="'+esc(ph.name)+'" data-fid="'+esc(ph.id)+'" src="'+GK.thumb(ph.id,320)+'">'+
      (info.kind||info.place?'<span class="cap">'+esc([info.kind,info.place].filter(Boolean).join(' '))+'</span>':'')+(sel?'<span class="sel">'+(n>=0?n+1:'')+'</span>':'')+'</button>';
  }
  /* 選択の番号だけ書き換える（一覧を描き直すと写真を読み直してちらつくため） */
  function markSel(){
    U.$$('[data-grid] .ph',view).forEach(function(b){ var n=sel?sel.indexOf(b.dataset.pid):-1; b.classList.toggle('on',n>=0); var s=b.querySelector('.sel'); if(s) s.textContent=n>=0?String(n+1):''; });
    drawDock();
  }
  function drawDock(){
    var el=view.querySelector('[data-dock]'); if(!el) return;
    if(!sel){ el.innerHTML=''; return; }
    el.innerHTML='<div class="dock"><div class="grow small"><b>'+sel.length+'枚</b> 選択中<br><span class="muted xs">台帳に載せる順にタップ</span></div><button type="button" class="btn sm" data-cancel>やめる</button><button type="button" class="btn primary sm" data-make'+(sel.length?'':' disabled')+'>台帳を作る</button></div>';
    el.querySelector('[data-cancel]').onclick=function(){ sel=null; drawGrid(); };
    el.querySelector('[data-make]').onclick=function(){ ledgerSheet(id,sel.slice(),findPhoto); };
  }
  function findPhoto(pid){ var all=[]; Object.keys(st.photos).forEach(function(k){ (st.photos[k]||[]).forEach(function(x){ all.push(x); }); }); for(var i=0;i<all.length;i++) if(all[i].id===pid) return all[i]; return {id:pid,name:''}; }
  view.querySelector('[data-fd]').onclick=function(e){ var b=e.target.closest('[data-fid]'); if(!b) return; st.fid=b.dataset.fid; drawFolders(); loadPhotos(); };
  view.querySelector('[data-grid]').onclick=function(e){
    var b=e.target.closest('[data-pid]'); if(!b) return; var pid=b.dataset.pid;
    if(sel){ var i=sel.indexOf(pid); if(i>=0) sel.splice(i,1); else sel.push(pid); markSel(); return; }
    var ph=findPhoto(pid);
    var acts=[{label:'ドライブで開く',href:GK.driveView(pid)}];
    if(CAN.admin()) acts.push({label:'🗑 削除',cls:'danger',onClick:function(close){ GK.confirm('この写真を削除しますか？\n（ドライブのゴミ箱に移動します）',{ok:'削除する',danger:true}).then(function(y){ if(!y) return;
      GK.busy(true,'削除中…'); API.write('deletePhotos',{ids:pid}).then(function(){ close(); Object.keys(st.photos).forEach(function(k){ if(st.photos[k]) st.photos[k]=st.photos[k].filter(function(x){return x.id!==pid;}); }); drawGrid(); GK.toast('削除しました'); })
        .catch(function(err){ GK.toast('削除できませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); }); }); }});
    GK.viewer({ title:ph.name, src:function(){ return new Promise(function(ok){ var im=new Image(); im.onload=function(){ ok(im.src); }; im.onerror=function(){ GK.fileBlob(pid).then(function(b){ ok(URL.createObjectURL(b)); },function(){ ok(GK.thumb(pid,1600)); }); }; im.src=GK.thumb(pid,1600); }); }, actions:acts });
  };
  view.querySelector('[data-led]').onclick=function(){
    if(sel){ sel=null; drawGrid(); return; }
    GK.sheet({ title:'写真台帳', html:'<p class="small">Gen-Canと同じテンプレートで、選んだ写真の台帳（PDF または Excel）を作ります。作った台帳は現場フォルダの「台帳」に保存されます。</p>',
      foot:'<button type="button" class="btn" data-list>作成済みを見る</button><button type="button" class="btn primary" data-sel>写真を選ぶ</button>',
      onOpen:function(s){ s.$('[data-sel]').onclick=function(){ s.close(); sel=[]; drawGrid(); GK.toast('台帳に載せる写真を順番にタップしてください'); };
        s.$('[data-list]').onclick=function(){ s.close(); ledgerList(id); }; } });
  };
  view.querySelector('[data-reload]').onclick=function(){ st.photos={}; loadFolders(); loadPhotos(true); };
  var addB=view.querySelector('[data-add]'); if(addB) addB.onclick=function(){ addFromFiles(id,st,function(){ st.photos={}; loadPhotos(true); }); };
  drawFolders(); if(!st.folders) loadFolders(); loadPhotos();
  /* 写真が届いたら一覧を読み直す。続けて届く時は最後の1枚から3秒後に1回だけ（GASの負担を減らす） */
  var reloadSoon=U.debounce(function(){ if(!view.isConnected) return; st.photos={}; if(!document.hidden) loadPhotos(true); },3000);
  var off=GK.on('uploaded',function(ev){ if(ev&&ev.job&&ev.job.pid===id&&ev.job.dest==='photo') reloadSoon(); });
  return off;
}

/* 端末の写真を選んで追加（黒板の合成もできる） */
function addFromFiles(pid,st,done){
  var kinds=kindOptions(st&&st.folders);
  var last=GK.cache.get('board_'+pid)||{};
  var s=GK.sheet({ title:'写真を追加', html:
    '<label class="fld"><span>工種（保存するフォルダ）</span><select data-kind>'+kinds.map(function(k){ return '<option'+(k===(last.kind||'施工')?' selected':'')+'>'+esc(k)+'</option>'; }).join('')+'<option value="__new">＋ 新しい工種…</option></select></label>'+
    '<label class="fld"><span>内容・撮影箇所（ファイル名に入ります）</span><input data-place maxlength="30" value="'+esc(last.place||'')+'" placeholder="例：2F廊下 配線"></label>'+
    '<label class="toggle"><input type="checkbox" data-board'+(last.addBoard?' checked':'')+'> 黒板を写真に合成する</label>'+
    '<label class="fld mt8"><span>写真</span><input type="file" accept="image/*" multiple data-files></label>',
    foot:'<button type="button" class="btn primary" data-go>送信する</button>' });
  s.$('[data-kind]').onchange=function(){ if(this.value==='__new'){ var n=U.safeName(window.prompt('工種の名前を入力してください（例：配線）')||'',20); if(n){ var o=document.createElement('option'); o.textContent=n; this.insertBefore(o,this.lastElementChild); this.value=n; } else this.value=kinds[0]; } };
  s.$('[data-go]').onclick=function(){
    var files=Array.prototype.slice.call(s.$('[data-files]').files||[]);
    if(!files.length){ GK.toast('写真を選んでください',{err:true}); return; }
    var kind=s.$('[data-kind]').value, place=s.$('[data-place]').value.trim(), withBoard=s.$('[data-board]').checked;
    GK.cache.set('board_'+pid,Object.assign({},last,{kind:kind,place:place,addBoard:withBoard}));
    s.close();
    var p=D.project(pid)||{};
    var fields=boardFields(p,kind,place,U.today());
    var n=0;
    files.reduce(function(chain,f,i){ return chain.then(function(){
      return IMG.fromFile(f).then(function(img){
        var c=IMG.toCanvas(img,2048);
        if(withBoard) drawBoard(c.getContext('2d'),c.width,c.height,fields,last.size||'m',last.pos||'l');
        return IMG.blob(c,'image/jpeg',0.88);
      }).then(function(blob){
        var name=U.safeName(kind,20)+'_'+(place?U.safeName(place,30)+'_':'')+U.stamp()+U.pad(i)+'.jpg';
        n++; GK.uploader.add({pid:pid,dest:'photo',kind:kind,name:name,mime:'image/jpeg',blob:blob,label:D.pname(p)+' '+kind}).catch(function(){});
      }).catch(function(e){ GK.toast('読み込めない写真がありました：'+f.name,{err:true}); });
    }); },Promise.resolve()).then(function(){ if(n) GK.toast(n+'枚を送信しています（届いた写真から一覧に表示されます）'); });
  };
}

function kindOptions(folders){
  var out=BASE_KINDS.slice();
  (folders||[]).forEach(function(f){ var top=String(f.name||'').split(' / ')[0]; if(top&&out.indexOf(top)<0&&top!=='台帳') out.push(top); });
  return out;
}

/* ===================== 小黒板 ===================== */
function boardFields(p,kind,place,date){
  var d=U.parse(date)||new Date();
  return [
    ['工事名',String(p['案件名']||D.pname(p)||'')],
    ['工種',kind||''],
    ['場所・内容',place||''],
    ['撮影日',d.getFullYear()+'/'+U.pad(d.getMonth()+1)+'/'+U.pad(d.getDate())],
    ['施工者',String(GK.CFG.COMPANY_NAME||'')]
  ];
}
var BOARD_SIZE={s:0.40,m:0.50,l:0.62};   /* 短い辺に対する黒板の幅 */
/* 黒板を描く（プレビューと保存の両方で同じ関数を使う＝見たままに保存） */
function drawBoard(g,W,H,fields,size,pos){
  var short=Math.min(W,H), bw=Math.round(short*(BOARD_SIZE[size]||BOARD_SIZE.m)), bh=Math.round(bw*0.62);
  var mg=Math.round(short*0.025), x=pos==='r'?W-bw-mg:mg, y=H-bh-mg;
  var rows=fields.length, rh=bh/rows, lw=Math.round(bw*0.27), lineW=Math.max(1,Math.round(bw/260));
  g.save();
  g.fillStyle='#1d5b48'; g.fillRect(x,y,bw,bh);
  g.strokeStyle='#ffffff'; g.lineWidth=lineW*2; g.strokeRect(x+lineW,y+lineW,bw-lineW*2,bh-lineW*2);
  g.lineWidth=lineW;
  for(var i=1;i<rows;i++){ g.beginPath(); g.moveTo(x+lineW,y+rh*i); g.lineTo(x+bw-lineW,y+rh*i); g.stroke(); }
  g.beginPath(); g.moveTo(x+lw,y+lineW); g.lineTo(x+lw,y+bh-lineW); g.stroke();
  g.fillStyle='#ffffff'; g.textBaseline='middle';
  var fam='"Zen Kaku Gothic New","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",sans-serif';
  fields.forEach(function(f,i){
    var cy=y+rh*i+rh/2;
    fitText(g,f[0],x+lw/2,cy,lw-rh*0.3,rh*0.42,fam,'center');
    fitText(g,f[1],x+lw+rh*0.25,cy,bw-lw-rh*0.5,rh*0.5,fam,'left');
  });
  g.restore();
}
function fitText(g,txt,x,y,maxW,size,fam,align){
  txt=String(txt||''); if(!txt) return;
  var s=Math.max(6,Math.floor(size));
  g.font='700 '+s+'px '+fam;
  while(g.measureText(txt).width>maxW&&s>7){ s--; g.font='700 '+s+'px '+fam; }
  if(g.measureText(txt).width>maxW){ while(txt.length>1&&g.measureText(txt+'…').width>maxW) txt=txt.slice(0,-1); txt+='…'; }
  g.textAlign=align; g.fillText(txt,x,y);
}
GK.drawBoard=drawBoard;

/* ===================== 小黒板カメラ ===================== */
function renderCamera(view,params){
  var id=params.id, p=D.project(id)||{};
  pushRecent(id);
  var saved=GK.cache.get('board_'+id)||{};
  var cfg={ kind:saved.kind||'施工', place:saved.place||'', on:saved.on!==false, size:saved.size||'m', pos:saved.pos||'l' };
  var stream=null, vid=null, frame=null, boardC=null, shots=0, facing='environment', alive=true;
  var kinds=kindOptions(albumCache[id]&&albumCache[id].folders);
  if(kinds.indexOf(cfg.kind)<0) kinds.push(cfg.kind);
  view.innerHTML='<div class="cam">'+
    '<div class="cam-top"><button type="button" data-x aria-label="閉じる">✕</button><b>'+esc(D.pname(p)||'現場')+'</b><button type="button" data-on>黒板 '+(cfg.on?'ON':'OFF')+'</button></div>'+
    '<div class="cam-stage" data-stage><div class="cam-frame" data-frame><video playsinline muted autoplay></video><canvas class="cam-board"></canvas><div class="cam-msg" data-msg>カメラを起動しています…</div></div></div>'+
    '<div class="cam-form"><select data-kind aria-label="工種">'+kinds.map(function(k){ return '<option'+(k===cfg.kind?' selected':'')+'>'+esc(k)+'</option>'; }).join('')+'<option value="__new">＋ 新しい工種…</option></select>'+
    '<input data-place maxlength="30" placeholder="場所・内容（例：2F廊下）" value="'+esc(cfg.place)+'" aria-label="場所・内容">'+
    '<div class="full row" style="gap:6px"><button type="button" class="chip" data-size style="background:#1f2937;color:#fff;border-color:#374151">大きさ：'+({s:'小',m:'中',l:'大'}[cfg.size])+'</button><button type="button" class="chip" data-pos style="background:#1f2937;color:#fff;border-color:#374151">位置：'+(cfg.pos==='r'?'右下':'左下')+'</button><span class="grow"></span><span class="xs" style="color:#cbd5e1">保存先：写真/<span data-kv>'+esc(cfg.kind)+'</span></span></div></div>'+
    '<div class="cam-bottom"><div class="cam-side"><div class="cam-thumb" data-thumb></div><span class="xs" data-cnt style="color:#cbd5e1">0枚</span></div>'+
    '<button type="button" class="shutter" data-shot aria-label="撮影"></button>'+
    '<div class="cam-side r"><button type="button" data-flip>🔄 切替</button><button type="button" data-pick>🖼 選ぶ</button></div></div>'+
    '<input type="file" accept="image/*" capture="environment" data-file hidden></div>';
  vid=view.querySelector('video'); frame=view.querySelector('[data-frame]'); boardC=view.querySelector('.cam-board');
  var msg=view.querySelector('[data-msg]');
  function save(){ GK.cache.set('board_'+id,Object.assign({},saved,{kind:cfg.kind,place:cfg.place,on:cfg.on,size:cfg.size,pos:cfg.pos})); }
  function fields(){ return boardFields(p,cfg.kind,cfg.place,U.today()); }
  /* 枠の大きさ：縦持ちなら3:4、横持ちなら4:3（撮れる写真と同じ形） */
  function aspect(){ var w=vid.videoWidth, h=vid.videoHeight; if(w&&h) return h>w?3/4:4/3; return window.innerHeight>window.innerWidth?3/4:4/3; }
  function layout(){
    var stg=view.querySelector('[data-stage]'); if(!stg) return;
    var sw=stg.clientWidth, sh=stg.clientHeight, a=aspect(), w=sw, h=w/a;
    if(h>sh){ h=sh; w=h*a; }
    frame.style.width=Math.round(w)+'px'; frame.style.height=Math.round(h)+'px'; frame.style.aspectRatio='auto';
    var dpr=Math.min(2,window.devicePixelRatio||1);
    boardC.width=Math.round(w*dpr); boardC.height=Math.round(h*dpr);
    drawPreview();
  }
  function drawPreview(){
    var g=boardC.getContext('2d'); g.clearRect(0,0,boardC.width,boardC.height);
    if(cfg.on) drawBoard(g,boardC.width,boardC.height,fields(),cfg.size,cfg.pos);
  }
  function start(){
    stop();
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ noCam('この端末・ブラウザではアプリ内カメラが使えません。'); return; }
    navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:2560},height:{ideal:1920}}}).then(function(s){
      if(!alive){ s.getTracks().forEach(function(t){t.stop();}); return; }
      stream=s; vid.srcObject=s; var pl=vid.play(); if(pl&&pl.catch) pl.catch(function(){});
      vid.onloadedmetadata=function(){ msg.hidden=true; layout(); };
    }).catch(function(e){ noCam('カメラを起動できませんでした（'+(e&&e.name==='NotAllowedError'?'カメラの使用が許可されていません':(e&&e.message)||'不明なエラー')+'）。'); });
  }
  function noCam(t){ msg.hidden=false; msg.innerHTML='<div>'+esc(t)+'<br>端末のカメラで撮影して、黒板を合成して保存できます。</div><button type="button" class="btn primary" data-native>📷 端末のカメラで撮る</button>';
    msg.querySelector('[data-native]').onclick=function(){ view.querySelector('[data-file]').click(); }; layout(); }
  function stop(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream=null; } }
  function flash(){ frame.style.opacity='.35'; setTimeout(function(){ frame.style.opacity=''; },120); }
  function finish(c){
    if(cfg.on) drawBoard(c.getContext('2d'),c.width,c.height,fields(),cfg.size,cfg.pos);
    return IMG.blob(c,'image/jpeg',0.88).then(function(blob){
      var now=new Date();
      var name=U.safeName(cfg.kind,20)+'_'+(cfg.place?U.safeName(cfg.place,30)+'_':'')+U.stamp(now)+('00'+now.getMilliseconds()).slice(-3)+'.jpg';
      shots++; view.querySelector('[data-cnt]').textContent=shots+'枚';
      view.querySelector('[data-thumb]').style.backgroundImage='url('+URL.createObjectURL(blob)+')';
      GK.uploader.add({pid:id,dest:'photo',kind:cfg.kind,name:name,mime:'image/jpeg',blob:blob,label:D.pname(p)+' '+cfg.kind}).catch(function(){});
    });
  }
  function shoot(){
    if(!stream||!vid.videoWidth){ view.querySelector('[data-file]').click(); return; }
    flash();
    var vw=vid.videoWidth, vh=vid.videoHeight, a=aspect(), cw=vw, ch=cw/a;
    if(ch>vh){ ch=vh; cw=ch*a; }
    var crop={x:Math.round((vw-cw)/2),y:Math.round((vh-ch)/2),w:Math.round(cw),h:Math.round(ch)};
    finish(IMG.toCanvas(vid,2048,crop)).catch(function(e){ GK.toast('保存できませんでした：'+e.message,{err:true}); });
  }
  view.querySelector('[data-shot]').onclick=shoot;
  view.querySelector('[data-x]').onclick=function(){ GK.go('/photos/'+encodeURIComponent(id)); };
  view.querySelector('[data-on]').onclick=function(){ cfg.on=!cfg.on; this.textContent='黒板 '+(cfg.on?'ON':'OFF'); save(); drawPreview(); };
  view.querySelector('[data-size]').onclick=function(){ cfg.size={s:'m',m:'l',l:'s'}[cfg.size]; this.textContent='大きさ：'+({s:'小',m:'中',l:'大'}[cfg.size]); save(); drawPreview(); };
  view.querySelector('[data-pos]').onclick=function(){ cfg.pos=cfg.pos==='r'?'l':'r'; this.textContent='位置：'+(cfg.pos==='r'?'右下':'左下'); save(); drawPreview(); };
  view.querySelector('[data-flip]').onclick=function(){ facing=facing==='environment'?'user':'environment'; start(); };
  view.querySelector('[data-pick]').onclick=function(){ var f=view.querySelector('[data-file]'); f.removeAttribute('capture'); f.click(); setTimeout(function(){ f.setAttribute('capture','environment'); },500); };
  view.querySelector('[data-file]').onchange=function(){
    var files=Array.prototype.slice.call(this.files||[]); this.value='';
    files.reduce(function(ch,f){ return ch.then(function(){ return IMG.fromFile(f).then(function(img){ return finish(IMG.toCanvas(img,2048)); }); }); },Promise.resolve())
      .catch(function(e){ GK.toast('写真を読み込めませんでした：'+e.message,{err:true}); });
  };
  var ks=view.querySelector('[data-kind]');
  ks.onchange=function(){
    if(ks.value==='__new'){ var n=U.safeName(window.prompt('工種の名前を入力してください（例：配線）')||'',20);
      if(n){ var o=document.createElement('option'); o.textContent=n; ks.insertBefore(o,ks.lastElementChild); ks.value=n; } else { ks.value=cfg.kind; return; } }
    cfg.kind=ks.value; view.querySelector('[data-kv]').textContent=cfg.kind; save(); drawPreview(); };
  view.querySelector('[data-place]').oninput=function(){ cfg.place=this.value.trim(); save(); drawPreview(); };
  var onR=U.debounce(layout,120);
  window.addEventListener('resize',onR); window.addEventListener('orientationchange',onR);
  var onVis=function(){ if(document.hidden) stop(); else if(alive&&!stream) start(); };
  document.addEventListener('visibilitychange',onVis);
  layout(); start();
  if(!D.project(id)) D.ensure('rd').then(function(){ p=D.project(id)||{}; drawPreview(); }).catch(function(){});
  return function(){ alive=false; stop(); window.removeEventListener('resize',onR); window.removeEventListener('orientationchange',onR); document.removeEventListener('visibilitychange',onVis); };
}

/* ===================== 写真台帳 ===================== */
function ledgerSheet(pid,ids,findPhoto){
  var p=D.project(pid)||{};
  var memo=GK.cache.get('ledger_'+pid)||{};
  var rows=ids.map(function(fid,i){ var ph=findPhoto(fid), info=parseName(ph.name), m=memo[fid]||{};
    return '<div class="card" style="padding:10px;margin-bottom:8px"><div class="row" style="align-items:flex-start;gap:10px"><img src="'+GK.thumb(fid,200)+'" data-fid="'+esc(fid)+'" alt="" style="width:84px;height:63px;object-fit:cover;border-radius:8px;background:#e5ebf2;flex:0 0 auto">'+
      '<div class="grow"><div class="xs muted">'+(i+1)+'枚目</div><div class="grid2" style="gap:6px"><input class="inp" data-k="kind" data-id="'+esc(fid)+'" placeholder="工種" value="'+esc(m.kind!=null?m.kind:info.kind)+'"><input class="inp" data-k="place" data-id="'+esc(fid)+'" placeholder="撮影箇所" value="'+esc(m.place!=null?m.place:info.place)+'"></div>'+
      '<input class="inp" style="margin-top:6px" data-k="memo" data-id="'+esc(fid)+'" placeholder="備考" value="'+esc(m.memo||'')+'"></div></div></div>'; }).join('');
  var s=GK.sheet({ title:'写真台帳を作る（'+ids.length+'枚）', html:
    '<label class="fld"><span>工事名（台帳の表題）</span><input data-name maxlength="60" value="'+esc(p['案件名']||D.pname(p))+'"></label>'+
    '<div class="flabel">形式</div><div class="seg" data-fmt><button type="button" class="on" data-v="pdf">PDF</button><button type="button" data-v="xlsx">Excel</button></div>'+
    '<div class="hint" style="margin:-6px 0 12px">用紙の大きさ・1ページの枚数はGen-Canの台帳テンプレートのとおりです。</div>'+rows,
    foot:'<button type="button" class="btn primary" data-go>作成する</button>' });
  var fmt='pdf';
  s.$('[data-fmt]').onclick=function(e){ var b=e.target.closest('[data-v]'); if(!b) return; fmt=b.dataset.v; s.$$('[data-fmt] button').forEach(function(x){ x.classList.toggle('on',x===b); }); };
  s.$('[data-go]').onclick=function(){
    var meta={};
    ids.forEach(function(fid){ var ph=findPhoto(fid); meta[fid]={name:ph.name||''}; });
    s.$$('[data-k]').forEach(function(inp){ meta[inp.dataset.id][inp.dataset.k]=inp.value.trim().slice(0,120); });
    var keep={}; ids.forEach(function(fid){ keep[fid]={kind:meta[fid].kind,place:meta[fid].place,memo:meta[fid].memo}; });
    GK.cache.set('ledger_'+pid,Object.assign(memo,keep));
    var name=s.$('[data-name]').value.trim()||D.pname(p);
    GK.busy(true,'台帳を作成しています…（1〜2分かかることがあります）');
    API.write('makeLedgerFiles',{id:pid,ids:ids.join(','),name:name,fmt:fmt,meta:JSON.stringify(meta)},{timeout:240000}).then(function(res){
      s.close();
      var url=res.pdfUrl||res.xlsxUrl||res.fileUrl;
      GK.sheet({ title:'台帳ができました', html:'<p><b>'+esc(res.fileName||res.name||'工事写真台帳')+'</b></p><p class="small muted">'+(res.n||ids.length)+'枚の写真を載せました。現場フォルダの「台帳」に保存しました。</p>'+
        (url?'<a class="btn primary block" href="'+esc(url)+'" target="_blank" rel="noopener">開く</a>':'')+(res.folderUrl?'<a class="btn block mt8" href="'+esc(res.folderUrl)+'" target="_blank" rel="noopener">台帳フォルダを開く</a>':'') });
    }).catch(function(err){ GK.toast('台帳を作れませんでした：'+err.message,{err:true}); }).finally(function(){ GK.busy(false); });
  };
}
function ledgerList(pid){
  var s=GK.sheet({ title:'作成済みの写真台帳', html:'<div class="skel"></div><div class="skel"></div>' });
  API.call('ledgerFiles',{id:pid},{timeout:40000}).then(function(res){
    var fs=(res.files||[]).slice().sort(function(a,b){ return String(b.updated||'').localeCompare(String(a.updated||'')); });
    s.body.innerHTML=(fs.length?'<div class="list">'+fs.map(function(f){ return '<a class="item" href="'+esc(f.url)+'" target="_blank" rel="noopener"><span class="ico">'+(f.type==='Excel'?'📗':'📕')+'</span><div class="grow"><div class="t ellipsis" style="font-size:14px">'+esc(f.name)+'</div><div class="s">'+esc([f.type,f.sizeText,String(f.updated||'').slice(0,16)].filter(Boolean).join('・'))+'</div></div><span class="chev">›</span></a>'; }).join('')+'</div>':'<div class="empty">まだ台帳はありません</div>')+
      (res.folderUrl?'<a class="btn block mt8" href="'+esc(res.folderUrl)+'" target="_blank" rel="noopener">台帳フォルダを開く</a>':'');
  }).catch(function(e){ s.body.innerHTML='<div class="card">読み込めませんでした：'+esc(e.message)+'</div>'; });
}

})();
