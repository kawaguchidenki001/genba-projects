/* Gen-Can common UI / E-Multicolor v1.1 (2026-07-04) / バージョンはconfig.jsで一元管理 */
/* 既存ニューモーフィズム維持 + タイルアイコンを機能別カラーグラデーション化 */
/* v1.1: 全ページ共通のオフライン通知バナーを追加（現場の電波切れ対策） */
/* v43.17.1: スマホの.grid一列化ルールにカレンダー月グリッド(.cal-grid)の除外を追加（月表示の縦一列崩れを修正） */
/* v43.18.2: 右下の共通ナビ（←メニュー・上へ・更新）を全ページで廃止（左上メニューと重複のため。挿入処理をコメントアウト） */
(function(){
  'use strict';
  var cfg = window.GENBA_CONFIG || {};
  var appVersion = cfg.APP_VERSION || '—';
  var path = location.pathname || '';
  var isRoot = /\/genba-projects\/?(?:index\.html)?$/.test(path) || /\/genba-projects$/.test(path) || !!document.getElementById('gridAdmin'); // v43.12.1: 別ドメイン納品でもルート判定が働くよう、ルート限定要素でも判定
  var isSub = !isRoot;
  var rootHref = isRoot ? './' : '../';

  // ===== v43.13.0: 自社用/販売用エディション =====
  // 'customer'（販売用）では自社専用ページを隠し・直リンクをブロックする。
  var GC_EDITION = String(cfg.EDITION || 'vendor').toLowerCase();
  var GC_VENDOR = {};
  (cfg.VENDOR_PAGES || []).forEach(function(p){ GC_VENDOR[String(p).toLowerCase()] = 1; });
  function gcSeg_(loc){
    var pn = String(loc || '').replace(/[?#].*$/, '').replace(/\/index\.html?$/i, '');
    var parts = pn.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : '';
  }
  if(GC_EDITION === 'customer'){
    // (1) 自社専用ページを直接開いた場合はブロック画面に差し替え
    if(GC_VENDOR[gcSeg_(path)]){
      try{
        document.title = 'ご利用いただけません';
        document.body.innerHTML =
          '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;'
          + 'font-family:\'Zen Kaku Gothic New\',sans-serif;color:#1f3a52;background:#e8ecf2;">'
          + '<div><div style="font-size:40px;margin-bottom:10px;">🔒</div>'
          + '<div style="font-size:18px;font-weight:800;margin-bottom:6px;">この画面はご利用いただけません</div>'
          + '<div style="font-size:13.5px;color:#5e7a92;line-height:1.7;margin-bottom:18px;">管理用の画面です。<br>ご不明な点は担当者へお問い合わせください。</div>'
          + '<a href="' + rootHref + '" style="display:inline-block;padding:12px 26px;border-radius:12px;'
          + 'background:linear-gradient(92deg,#06b6d4,#2563eb 60%,#7c3aed);color:#fff;font-weight:800;text-decoration:none;">メニューへ戻る</a>'
          + '</div></div>';
      }catch(e){ try{ location.replace(rootHref); }catch(_){} }
      return; // 以降の共通UI処理は実行しない
    }
    // (2) お客様向けページ内の自社専用ページへのリンク・ボタンを隠す
    var gcHideVendorEntries = function(){
      try{
        Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function(a){
          if(GC_VENDOR[gcSeg_(a.getAttribute('href') || '')]) a.style.display = 'none';
        });
        Array.prototype.forEach.call(document.querySelectorAll('button[onclick],[data-href],[onclick]'), function(b){
          var s = (b.getAttribute('onclick') || '') + ' ' + (b.getAttribute('data-href') || '');
          var m = s.match(/['"]([^'"]*\/([a-z]+)\/[^'"]*)['"]/i);
          if(m && GC_VENDOR[String(m[2]).toLowerCase()]) b.style.display = 'none';
        });
      }catch(e){}
    };
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', gcHideVendorEntries);
    else gcHideVendorEntries();
  }

  // viewport未指定ページのスマホ縮小表示を防ぐ
  var viewport = document.querySelector('meta[name="viewport"]');
  if(!viewport){
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content','width=device-width,initial-scale=1,viewport-fit=cover');

  document.documentElement.setAttribute('data-gencan-version', appVersion);
  document.documentElement.setAttribute('data-gencan-theme', 'e-multicolor-v1');
  document.body.classList.add('gc-common-ui');
  document.body.classList.add('gc-emc-theme');
  document.documentElement.classList.add('gc-performance-lite');
  if(isRoot) document.body.classList.add('gc-root-page');

  // バージョンバッジを共通設定に同期
  ['verBadge','appBadge','loginVer'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = appVersion;
  });
  // v43.13.0: 自社用モードのときだけログイン画面に控えめな目印（販売用への切替忘れ防止）
  if(GC_EDITION === 'vendor'){
    var _lv = document.getElementById('loginVer');
    if(_lv) _lv.textContent = appVersion + '　自社用モード';
  }

  // 既存の「メニュー」「更新」ボタンを見た目だけ少し統一
  Array.prototype.slice.call(document.querySelectorAll('a,button')).forEach(function(el){
    var t = (el.textContent || '').replace(/\s+/g,'').trim();
    if(t === '←メニュー' || t === 'メニューへ' || t === 'メニュー' || t === '←メニューへ') el.classList.add('gc-action-menu');
    if(t === '更新' || t === '↻更新') el.classList.add('gc-action-refresh');
  });

  var style = document.createElement('style');
  style.textContent = `
    /* ============================================================
       Gen-Can E-Multicolor Theme v1.0
       既存のニューモーフィズム影/背景/レイアウトは維持し、
       タイル(.sq)のアイコン枠(.ic)だけを機能別カラーグラデーション化。
       既存スタイルへの破壊的変更を最小限に抑えた控えめなパッチ。
       ============================================================ */

    /* ベース：レイアウト最低限の整え（旧版維持） */
    .gc-common-ui,.gc-common-ui *,.gc-common-ui *::before,.gc-common-ui *::after{box-sizing:border-box}
    html{-webkit-text-size-adjust:100%;scroll-padding-bottom:110px}
    .gc-common-ui .card,.gc-common-ui .sq,.gc-common-ui section,.gc-common-ui .panel{content-visibility:auto;contain-intrinsic-size:1px 240px}
    .gc-performance-lite{scroll-behavior:smooth}
    body.gc-common-ui{overflow-x:hidden;touch-action:manipulation}
    .gc-common-ui img,.gc-common-ui video,.gc-common-ui canvas,.gc-common-ui svg{max-width:100%}
    .gc-common-ui input,.gc-common-ui select,.gc-common-ui textarea,.gc-common-ui button{font-family:inherit}
    .gc-common-ui .gc-table-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:14px}
    .gc-common-ui .gc-scroll-hint{font-size:11px;color:#6b7f92;margin:5px 2px 0;display:none}

    /* ========== タイルアイコン共通スタイル上書き ==========
       既存:円形 .ic{background:#e8ecf2; border-radius:50%; inset shadow}
       新規:角丸正方形 + グラデーション + 軽い影 + 白アイコン */
    body.gc-emc-theme .sq .ic{
      background:linear-gradient(135deg,#06b6d4,#7c3aed) !important;
      color:#ffffff !important;
      border-radius:12px !important;
      box-shadow:3px 3px 8px rgba(99,102,241,.3), -2px -2px 6px rgba(255,255,255,.5) !important;
      width:46px !important;
      height:46px !important;
      transition:transform .12s ease, box-shadow .12s ease !important;
    }
    body.gc-emc-theme .sq .ic svg{
      color:#ffffff !important;
      stroke:#ffffff !important;
    }
    body.gc-emc-theme .sq:active .ic{
      transform:scale(0.96) !important;
    }

    /* ========== 機能別カラーリング（16タイル） ==========
       各 .sq.t-* に対してアイコンのグラデと影色を割り当て */

    /* === 毎日使う === */
    body.gc-emc-theme .sq.t-proj .ic{
      background:linear-gradient(135deg,#3b82f6,#1d4ed8) !important;
      box-shadow:3px 3px 8px rgba(29,78,216,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-report .ic{
      background:linear-gradient(135deg,#10b981,#047857) !important;
      box-shadow:3px 3px 8px rgba(4,120,87,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-time .ic{
      background:linear-gradient(135deg,#a855f7,#6d28d9) !important;
      box-shadow:3px 3px 8px rgba(109,40,217,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-sched .ic{
      background:linear-gradient(135deg,#f97316,#c2410c) !important;
      box-shadow:3px 3px 8px rgba(194,65,12,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-files .ic{
      background:linear-gradient(135deg,#14b8a6,#0d9488) !important;
      box-shadow:3px 3px 8px rgba(13,148,136,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-photo .ic{
      background:linear-gradient(135deg,#ec4899,#be185d) !important;
      box-shadow:3px 3px 8px rgba(190,24,93,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }

    /* === 書類・経理 === */
    body.gc-emc-theme .sq.t-est .ic{
      background:linear-gradient(135deg,#eab308,#a16207) !important;
      box-shadow:3px 3px 8px rgba(161,98,7,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-cost .ic{
      background:linear-gradient(135deg,#0ea5e9,#0369a1) !important;
      box-shadow:3px 3px 8px rgba(3,105,161,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-safety .ic{
      background:linear-gradient(135deg,#22c55e,#15803d) !important;
      box-shadow:3px 3px 8px rgba(21,128,61,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }

    /* === 材料・設備 === */
    body.gc-emc-theme .sq.t-material .ic{
      background:linear-gradient(135deg,#6366f1,#4338ca) !important;
      box-shadow:3px 3px 8px rgba(67,56,202,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-veh .ic{
      background:linear-gradient(135deg,#f59e0b,#b45309) !important;
      box-shadow:3px 3px 8px rgba(180,83,9,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-tool2 .ic{
      background:linear-gradient(135deg,#64748b,#334155) !important;
      box-shadow:3px 3px 8px rgba(51,65,85,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }

    /* === AI・ツール === */
    body.gc-emc-theme .sq.t-ai .ic{
      background:linear-gradient(135deg,#8b5cf6,#ec4899) !important;
      box-shadow:3px 3px 8px rgba(139,92,246,.45), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-tool .ic{
      background:linear-gradient(135deg,#06b6d4,#0891b2) !important;
      box-shadow:3px 3px 8px rgba(8,145,178,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }

    /* === こまったとき === */
    body.gc-emc-theme .sq.t-faq .ic{
      background:linear-gradient(135deg,#38bdf8,#0284c7) !important;
      box-shadow:3px 3px 8px rgba(2,132,199,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-support .ic{
      background:linear-gradient(135deg,#f43f5e,#be123c) !important;
      box-shadow:3px 3px 8px rgba(190,18,60,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }

    /* === 管理 === */
    body.gc-emc-theme .sq.t-admin .ic{
      background:linear-gradient(135deg,#71717a,#3f3f46) !important;
      box-shadow:3px 3px 8px rgba(63,63,70,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }
    body.gc-emc-theme .sq.t-ops .ic{
      background:linear-gradient(135deg,#78716c,#44403c) !important;
      box-shadow:3px 3px 8px rgba(68,64,60,.4), -2px -2px 6px rgba(255,255,255,.5) !important;
    }

    /* ========== 共通ナビゲーション（旧版維持） ========== */
    .gc-common-nav{
      position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:120000;
      display:flex;gap:8px;align-items:center;padding:8px;border-radius:18px;
      background:rgba(244,248,252,.84);backdrop-filter:blur(14px);
      box-shadow:0 10px 24px rgba(31,58,82,.16);border:1px solid rgba(255,255,255,.72);
    }
    .gc-common-nav a,.gc-common-nav button{
      appearance:none;border:0;text-decoration:none;cursor:pointer;
      min-height:38px;padding:0 13px;border-radius:999px;
      background:#eef5fb;color:#1f3a52;font-weight:900;font-size:13px;
      display:inline-flex;align-items:center;justify-content:center;gap:5px;
      box-shadow:4px 4px 9px rgba(191,201,214,.75),-4px -4px 9px rgba(255,255,255,.95);
      font-family:inherit;white-space:nowrap;
    }
    .gc-common-nav a.primary{
      background:linear-gradient(92deg,#06b6d4,#2563eb 62%,#7c3aed);
      color:#fff;box-shadow:0 8px 18px rgba(37,99,235,.22);
    }
    .gc-action-menu,.gc-action-refresh{font-weight:900!important;border-radius:999px!important;}

    /* ========== レスポンシブ（旧版維持） ========== */
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
      .gc-common-ui .grid:not(.ledger-photo-grid):not(.photo-grid):not(.cal-grid),.gc-common-ui .cards,.gc-common-ui .tiles,.gc-common-ui .list-grid{grid-template-columns:1fr!important}
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
      body.gc-emc-theme.gc-root-page .sq .ic{width:39px!important;height:39px!important;border-radius:10px!important}
      .gc-root-page .head h1{font-size:26px!important}
      #fileAddDock,#ledgerDock,.ledger-dock,.file-dock{left:0!important;right:0!important;bottom:0!important;border-radius:18px 18px 0 0!important;padding:10px 12px calc(10px + env(safe-area-inset-bottom))!important;max-width:none!important}
      #fileAddDock button,#ledgerDock button,.ledger-dock button,.file-dock button{min-height:50px!important}
    }
    @media(max-width:420px){
      .gc-root-page .grid{gap:8px!important}
      body.gc-emc-theme.gc-root-page .sq .ic{width:36px!important;height:36px!important}
    }
  `;
  document.head.appendChild(style);

  // テーブル横スクロール化（旧版維持）
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

  // v43.18.2 右下の共通ナビ（←メニュー・上へ・更新）は廃止。
  // 各ページ左上に「← メニュー」があり重複していたため、全ページで非表示にした。
  // （復活させる場合は下のブロックのコメントを外す）
  /*
  var hasOwnDock = document.getElementById('fileAddDock') || document.getElementById('ledgerDock') || document.querySelector('.bottom') || document.getElementById('outBar') || document.querySelector('.fab');
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
  */

  // オフライン通知バナー（全ページ共通）
  // 現場は電波が切れやすく、通信失敗が「保存されたつもり」の事故につながるため、
  // オフラインになった瞬間に画面上部へ表示し、回復したら短く知らせて消す。
  try{
    var netBar = document.createElement('div');
    netBar.id = 'gcNetBar';
    netBar.setAttribute('role','status');
    netBar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:140000;display:none;text-align:center;font:800 12.5px "Zen Kaku Gothic New",sans-serif;letter-spacing:.04em;color:#fff;padding:8px 12px;padding-top:calc(8px + env(safe-area-inset-top));background:linear-gradient(92deg,#f43f5e,#b91c1c);box-shadow:0 4px 14px rgba(185,28,28,.3);';
    var netTimer = null;
    var showNet = function(offline){
      if(netTimer){clearTimeout(netTimer);netTimer=null;}
      if(offline){
        netBar.textContent = '📡 オフラインです。電波の届く場所に移動するまで保存・読込はできません';
        netBar.style.background = 'linear-gradient(92deg,#f43f5e,#b91c1c)';
        netBar.style.boxShadow = '0 4px 14px rgba(185,28,28,.3)';
        netBar.style.display = 'block';
      }else{
        netBar.textContent = '✅ 通信が回復しました';
        netBar.style.background = 'linear-gradient(92deg,#10b981,#047857)';
        netBar.style.boxShadow = '0 4px 14px rgba(4,120,87,.3)';
        netBar.style.display = 'block';
        netTimer = setTimeout(function(){netBar.style.display='none';}, 2500);
      }
    };
    var mountNet = function(){
      document.body.appendChild(netBar);
      if(navigator.onLine === false) showNet(true);
    };
    if(document.body) mountNet(); else document.addEventListener('DOMContentLoaded', mountNet);
    window.addEventListener('offline', function(){showNet(true);});
    window.addEventListener('online', function(){showNet(false);});
  }catch(e){}

  // デモページ用バッジ（旧版維持）
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
