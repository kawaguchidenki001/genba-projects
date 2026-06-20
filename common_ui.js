/* Gen-Can common UI v2026.06.20-43 / support center + release prep */
(function(){
  'use strict';
  var cfg = window.GENBA_CONFIG || {};
  var appVersion = cfg.APP_VERSION || 'v2026.06.20-43';
  var path = location.pathname || '';
  var isRoot = /\/genba-projects\/?(?:index\.html)?$/.test(path) || /\/genba-projects$/.test(path);
  var isSub = !isRoot;
  var rootHref = isRoot ? './' : '../';

  // viewport未指定ページのスマホ縮小表示を防ぐ
  var viewport = document.querySelector('meta[name="viewport"]');
  if(!viewport){
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content','width=device-width,initial-scale=1,viewport-fit=cover');

  document.documentElement.setAttribute('data-gencan-version', appVersion);
  document.body.classList.add('gc-common-ui');
  document.documentElement.classList.add('gc-performance-lite');
  if(isRoot) document.body.classList.add('gc-root-page');

  function setDeviceClass(){
    var w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    document.body.classList.toggle('gc-phone', w <= 680);
    document.body.classList.toggle('gc-tablet', w > 680 && w <= 1024);
    document.body.classList.toggle('gc-desktop', w > 1024);
    document.documentElement.setAttribute('data-gc-width', String(w));
  }
  setDeviceClass();
  window.addEventListener('resize', function(){ clearTimeout(window.__gcResizeTimer); window.__gcResizeTimer=setTimeout(setDeviceClass,120); });

  // バージョンバッジを共通設定に同期
  ['verBadge','appBadge','loginVer'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = appVersion;
  });

  // 既存の「メニュー」「更新」ボタンを見た目だけ少し統一
  Array.prototype.slice.call(document.querySelectorAll('a,button')).forEach(function(el){
    var t = (el.textContent || '').replace(/\s+/g,'').trim();
    if(t === '←メニュー' || t === 'メニューへ' || t === 'メニュー' || t === '←メニューへ') el.classList.add('gc-action-menu');
    if(t === '更新' || t === '↻更新') el.classList.add('gc-action-refresh');
  });

  var style = document.createElement('style');
  style.textContent = `
    .gc-common-ui,.gc-common-ui *,.gc-common-ui *::before,.gc-common-ui *::after{box-sizing:border-box}
    html{-webkit-text-size-adjust:100%;scroll-padding-bottom:110px}
    /* v36: 画面描画の軽量化。対応ブラウザでは画面外カードの描画を遅らせる */
    .gc-common-ui .card,.gc-common-ui .sq,.gc-common-ui section,.gc-common-ui .panel{content-visibility:auto;contain-intrinsic-size:1px 240px}
    .gc-common-ui img:not([loading]){image-rendering:auto}
    .gc-performance-lite{scroll-behavior:smooth}

    body.gc-common-ui{overflow-x:hidden;touch-action:manipulation}
    .gc-common-ui img,.gc-common-ui video,.gc-common-ui canvas,.gc-common-ui svg{max-width:100%}
    .gc-common-ui input,.gc-common-ui select,.gc-common-ui textarea,.gc-common-ui button{font-family:inherit}
    .gc-common-ui .gc-table-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:14px}
    .gc-common-ui .gc-scroll-hint{font-size:11px;color:#6b7f92;margin:5px 2px 0;display:none}
    .gc-common-nav{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:120000;display:flex;gap:8px;align-items:center;padding:8px;border-radius:18px;background:rgba(244,248,252,.84);backdrop-filter:blur(14px);box-shadow:0 10px 24px rgba(31,58,82,.16);border:1px solid rgba(255,255,255,.72)}
    .gc-common-nav a,.gc-common-nav button{appearance:none;border:0;text-decoration:none;cursor:pointer;min-height:38px;padding:0 13px;border-radius:999px;background:#eef5fb;color:#1f3a52;font-weight:900;font-size:13px;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-shadow:4px 4px 9px rgba(191,201,214,.75),-4px -4px 9px rgba(255,255,255,.95);font-family:inherit;white-space:nowrap}
    .gc-common-nav a.primary{background:linear-gradient(92deg,#06b6d4,#2563eb 62%,#7c3aed);color:#fff;box-shadow:0 8px 18px rgba(37,99,235,.22)}
    .gc-action-menu,.gc-action-refresh{font-weight:900!important;border-radius:999px!important;}
    @media(max-width:1024px){
      .gc-common-ui .wrap,.gc-common-ui .container,.gc-common-ui .shell,.gc-common-ui main,.gc-common-ui .page,.gc-common-ui .page-wrap{max-width:100%!important;width:100%!important}
      .gc-common-ui .panel,.gc-common-ui .card,.gc-common-ui .box,.gc-common-ui .section{max-width:100%!important}
      .gc-common-ui .toolbar,.gc-common-ui .actions,.gc-common-ui .btnrow,.gc-common-ui .row.actions{flex-wrap:wrap!important;gap:10px!important}
      .gc-common-ui input,.gc-common-ui select,.gc-common-ui textarea{max-width:100%!important}
    }
    @media(max-width:820px){
      .gc-common-ui{min-width:0!important}
      .gc-common-ui input,.gc-common-ui select,.gc-common-ui textarea{font-size:16px!important;min-height:44px}
      .gc-common-ui button,.gc-common-ui .btn,.gc-common-ui a.btn,.gc-common-ui [role="button"]{min-height:44px}
      .gc-common-ui table{min-width:720px}
      .gc-common-ui .gc-table-scroll + .gc-scroll-hint{display:block}
      .gc-common-ui .grid:not(.ledger-photo-grid):not(.photo-grid),.gc-common-ui .cards,.gc-common-ui .tiles,.gc-common-ui .list-grid{grid-template-columns:1fr!important}
      .gc-common-ui .hide-mobile{display:none!important}
      .gc-common-ui .show-mobile{display:block!important}
    }
    @media(max-width:680px){
      body.gc-common-ui{padding-bottom:calc(74px + env(safe-area-inset-bottom))}
      .gc-common-ui .head,.gc-common-ui .hero,.gc-common-ui header{padding-left:14px!important;padding-right:14px!important}
      .gc-common-ui .panel,.gc-common-ui .card,.gc-common-ui .box{border-radius:18px!important}
      .gc-common-ui .modal,.gc-common-ui dialog{max-width:calc(100vw - 18px)!important;width:calc(100vw - 18px)!important}
      .gc-common-nav{left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));justify-content:space-between;border-radius:18px;padding:8px}
      .gc-common-nav a,.gc-common-nav button{flex:1;padding:0 8px;font-size:12.5px;min-width:0}
      .gc-root-page .grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important}
      .gc-root-page a.sq{padding:10px!important;border-radius:15px!important;min-height:0!important}
      .gc-root-page .sq .ic{width:39px!important;height:39px!important}
      .gc-root-page .sq .nm{font-size:14px!important;line-height:1.15!important}
      .gc-root-page .sq .cor{top:8px!important;right:8px!important}
      .gc-root-page .head h1{font-size:26px!important}
      #fileAddDock,#ledgerDock,.ledger-dock,.file-dock{left:0!important;right:0!important;bottom:0!important;border-radius:18px 18px 0 0!important;padding:10px 12px calc(10px + env(safe-area-inset-bottom))!important;max-width:none!important}
      #fileAddDock button,#ledgerDock button,.ledger-dock button,.file-dock button{min-height:50px!important}
    }
    @media(max-width:420px){
      .gc-root-page .grid{gap:8px!important}
      .gc-root-page .sq .nm{font-size:13px!important}
      .gc-root-page .sq .ic{width:36px!important;height:36px!important}
    }
  `;
  document.head.appendChild(style);

  function wrapTables(){
    Array.prototype.slice.call(document.querySelectorAll('table')).forEach(function(tbl){
      if(tbl.closest('.gc-table-scroll')) return;
      var parent = tbl.parentNode;
      if(!parent) return;
      var wrap = document.createElement('div');
      wrap.className = 'gc-table-scroll';
      parent.insertBefore(wrap, tbl);
      wrap.appendChild(tbl);
      var hint = document.createElement('div');
      hint.className = 'gc-scroll-hint';
      hint.textContent = '横にスクロールできます';
      wrap.parentNode.insertBefore(hint, wrap.nextSibling);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrapTables); else wrapTables();

  // 画面下に固定操作があるページでは重ねない
  var hasOwnDock = document.getElementById('fileAddDock') || document.getElementById('ledgerDock') || document.querySelector('.bottom') || document.getElementById('outBar');
  var skipPaths = /\/(files|photos|toolbox)\//.test(path);
  if(isSub && !hasOwnDock && !skipPaths && !document.getElementById('gcCommonNav')){
    var nav = document.createElement('div');
    nav.id = 'gcCommonNav';
    nav.className = 'gc-common-nav';
    nav.innerHTML = '<a class="primary" href="'+rootHref+'">← メニュー</a><button type="button" data-gc-top>上へ</button><button type="button" data-gc-reload>更新</button>';
    document.body.appendChild(nav);
    nav.querySelector('[data-gc-top]').addEventListener('click', function(){window.scrollTo({top:0,behavior:'smooth'});});
    nav.querySelector('[data-gc-reload]').addEventListener('click', function(){location.reload();});
  }

  // デモページ用の控えめな表示
  try{
    if(/\/demo\//.test(path) && !document.getElementById('gcDemoBadge')){
      var db=document.createElement('div');
      db.id='gcDemoBadge';
      db.textContent='DEMO MODE';
      db.style.cssText='position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:130000;background:linear-gradient(92deg,#06b6d4,#2563eb 62%,#7c3aed);color:#fff;border-radius:999px;padding:6px 11px;font:800 11px Manrope,sans-serif;letter-spacing:.08em;box-shadow:0 8px 18px rgba(37,99,235,.28);pointer-events:none;';
      document.body.appendChild(db);
    }
  }catch(e){}

})();
