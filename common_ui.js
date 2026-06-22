/* Gen-Can common UI / Claude Theme v1.0 (2026-06-22) / バージョンはconfig.jsで一元管理 */
/* 全ページ統一Claude風デザイン：ニューモーフィズム→フラット化、背景#f7f7f5、cyan-to-purpleグラデ維持 */
(function(){
  'use strict';
  var cfg = window.GENBA_CONFIG || {};
  var appVersion = cfg.APP_VERSION || '—';
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

  // テーマカラー（モバイルブラウザのアドレスバー色）をClaude風に
  var themeColor = document.querySelector('meta[name="theme-color"]');
  if(themeColor) themeColor.setAttribute('content','#f7f7f5');

  document.documentElement.setAttribute('data-gencan-version', appVersion);
  document.documentElement.setAttribute('data-gencan-theme', 'claude-v1');
  document.body.classList.add('gc-common-ui');
  document.body.classList.add('gc-claude-theme');
  document.documentElement.classList.add('gc-performance-lite');
  if(isRoot) document.body.classList.add('gc-root-page');

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
    /* ============================================================
       Gen-Can Claude Theme v1.0
       基本方針: 背景#f7f7f5、白カード+薄ボーダー、cyan-to-purpleグラデーション維持
       既存ニューモーフィズム影 → フラット化（軽いshadow + border）
       ============================================================ */

    /* CSS変数の強制上書き（既存:root定義を無効化） */
    body.gc-claude-theme,
    body.gc-claude-theme :root{
      --bg1:#f7f7f5 !important;
      --bg2:#ffffff !important;
      --ink:#1a1a2e !important;
      --sub:#6b7280 !important;
      --line:#e5e5e3 !important;
      --card:#ffffff !important;
      --shadow:0 1px 4px rgba(0,0,0,.06) !important;
      --shadow-lg:0 4px 12px rgba(0,0,0,.08) !important;
      --grad:linear-gradient(92deg,#06b6d4,#2563eb 52%,#7c3aed) !important;
      --rise:0 1px 4px rgba(0,0,0,.06) !important;
      --well:none !important;
    }

    /* ベース：レイアウト */
    .gc-common-ui,.gc-common-ui *,.gc-common-ui *::before,.gc-common-ui *::after{box-sizing:border-box}
    html{-webkit-text-size-adjust:100%;scroll-padding-bottom:110px}
    .gc-common-ui .card,.gc-common-ui .sq,.gc-common-ui section,.gc-common-ui .panel{content-visibility:auto;contain-intrinsic-size:1px 240px}
    .gc-performance-lite{scroll-behavior:smooth}
    body.gc-common-ui{overflow-x:hidden;touch-action:manipulation}
    .gc-common-ui img,.gc-common-ui video,.gc-common-ui canvas,.gc-common-ui svg{max-width:100%}
    .gc-common-ui input,.gc-common-ui select,.gc-common-ui textarea,.gc-common-ui button{font-family:inherit}

    /* ========== 背景・基本色の統一 ========== */
    body.gc-claude-theme{
      background:#f7f7f5 !important;
      color:#1a1a2e !important;
      font-family:"Zen Kaku Gothic New",sans-serif !important;
    }

    /* ログイン画面・ローディング画面 */
    body.gc-claude-theme #login,
    body.gc-claude-theme .login,
    body.gc-claude-theme #loading{
      background:#f7f7f5 !important;
    }

    /* ========== ヘッダー周辺 ========== */
    body.gc-claude-theme .head,
    body.gc-claude-theme header,
    body.gc-claude-theme .hbar,
    body.gc-claude-theme .hd,
    body.gc-claude-theme .hd2,
    body.gc-claude-theme .topbar,
    body.gc-claude-theme .top-bar{
      background:#f7f7f5 !important;
    }

    /* ロゴテキスト：Gen-Can のグラデーションは保持 */
    body.gc-claude-theme .gc-name,
    body.gc-claude-theme .hmark,
    body.gc-claude-theme .brand,
    body.gc-claude-theme .logo-text{
      background-image:linear-gradient(92deg,#06b6d4 10%,#2563eb 55%,#7c3aed 95%) !important;
      -webkit-background-clip:text !important;
      background-clip:text !important;
      color:transparent !important;
    }

    /* ヘッダーの見出しテキストは黒に統一（青系→ダーク） */
    body.gc-claude-theme .head h1,
    body.gc-claude-theme h1.title,
    body.gc-claude-theme .page-title{
      color:#1a1a2e !important;
    }

    /* ========== カード・パネル・ボックス（ニューモーフィズム影を一掃） ========== */
    body.gc-claude-theme .card,
    body.gc-claude-theme .dcard,
    body.gc-claude-theme .panel,
    body.gc-claude-theme .box:not(input):not(button),
    body.gc-claude-theme .section.card,
    body.gc-claude-theme .tile,
    body.gc-claude-theme .lbox,
    body.gc-claude-theme .rem-box,
    body.gc-claude-theme .dnote,
    body.gc-claude-theme .pane{
      background:#ffffff !important;
      border:1px solid #e5e5e3 !important;
      box-shadow:0 1px 4px rgba(0,0,0,.06) !important;
      border-radius:12px !important;
    }

    /* ========== メインメニュータイル（index画面の .sq） ========== */
    body.gc-claude-theme a.sq,
    body.gc-claude-theme button.sq,
    body.gc-claude-theme .sq{
      background:#ffffff !important;
      border:1px solid #e5e5e3 !important;
      box-shadow:0 1px 4px rgba(0,0,0,.06) !important;
      border-radius:14px !important;
      color:#1a1a2e !important;
      transition:transform .12s ease,box-shadow .12s ease,border-color .12s !important;
    }
    body.gc-claude-theme a.sq:hover,
    body.gc-claude-theme .sq:hover{
      transform:translateY(-1px) !important;
      box-shadow:0 4px 10px rgba(0,0,0,.08) !important;
      border-color:#d1d5db !important;
    }
    body.gc-claude-theme a.sq:active,
    body.gc-claude-theme .sq:active{
      transform:translateY(0) !important;
      box-shadow:0 1px 2px rgba(0,0,0,.06) !important;
      border-color:#9ca3af !important;
    }

    /* ========== アイコン枠（円形inset → 角丸グラデーション） ========== */
    body.gc-claude-theme .sq .ic,
    body.gc-claude-theme .tile .ic,
    body.gc-claude-theme .hic,
    body.gc-claude-theme .icon-circle,
    body.gc-claude-theme .ic-circle{
      background:linear-gradient(135deg,#06b6d4,#7c3aed) !important;
      color:#ffffff !important;
      border-radius:10px !important;
      box-shadow:0 2px 6px rgba(6,182,212,.25) !important;
      border:none !important;
    }
    body.gc-claude-theme .sq .ic svg,
    body.gc-claude-theme .tile .ic svg,
    body.gc-claude-theme .hic svg{
      color:#ffffff !important;
      stroke:currentColor !important;
    }
    /* 個別の色分け（t-proj等）は無効化してグラデに統一 */
    body.gc-claude-theme [class*="t-"] .ic{
      color:#ffffff !important;
    }

    /* ========== カードのテキスト ========== */
    body.gc-claude-theme .sq .nm,
    body.gc-claude-theme .nm{
      color:#1a1a2e !important;
    }
    body.gc-claude-theme .sq .en,
    body.gc-claude-theme .en,
    body.gc-claude-theme .lbl,
    body.gc-claude-theme .kicker{
      color:#9ca3af !important;
      font-family:"Manrope",sans-serif !important;
      font-weight:700 !important;
      letter-spacing:.14em !important;
      text-transform:uppercase !important;
    }
    body.gc-claude-theme .sq .ds,
    body.gc-claude-theme .ds,
    body.gc-claude-theme .co,
    body.gc-claude-theme .sub,
    body.gc-claude-theme .gc-sub{
      color:#6b7280 !important;
    }
    body.gc-claude-theme .sq .cor,
    body.gc-claude-theme .cor{
      color:#9ca3af !important;
    }
    body.gc-claude-theme .sq .cor.lock,
    body.gc-claude-theme .cor.lock{
      background:#f9fafb !important;
      border:1px solid #e5e5e3 !important;
      color:#6b7280 !important;
      box-shadow:none !important;
    }

    /* ========== 入力欄（inset影をフラットボーダーに） ========== */
    body.gc-claude-theme input[type="text"],
    body.gc-claude-theme input[type="search"],
    body.gc-claude-theme input[type="email"],
    body.gc-claude-theme input[type="tel"],
    body.gc-claude-theme input[type="number"],
    body.gc-claude-theme input[type="date"],
    body.gc-claude-theme input[type="time"],
    body.gc-claude-theme input[type="datetime-local"],
    body.gc-claude-theme input[type="password"],
    body.gc-claude-theme input[type="url"],
    body.gc-claude-theme input:not([type]),
    body.gc-claude-theme select,
    body.gc-claude-theme textarea,
    body.gc-claude-theme .inp,
    body.gc-claude-theme .fld input,
    body.gc-claude-theme .fld select,
    body.gc-claude-theme .fld textarea{
      background:#ffffff !important;
      border:1.5px solid #d1d5db !important;
      border-radius:10px !important;
      box-shadow:none !important;
      color:#1a1a2e !important;
      padding:10px 12px !important;
      font-size:14px !important;
      transition:border-color .15s,box-shadow .15s !important;
    }
    body.gc-claude-theme input:focus,
    body.gc-claude-theme select:focus,
    body.gc-claude-theme textarea:focus,
    body.gc-claude-theme .inp:focus{
      outline:none !important;
      border-color:#2563eb !important;
      box-shadow:0 0 0 3px rgba(37,99,235,.1) !important;
    }
    body.gc-claude-theme input::placeholder,
    body.gc-claude-theme textarea::placeholder{
      color:#9ca3af !important;
    }

    /* ラベル */
    body.gc-claude-theme label,
    body.gc-claude-theme .fld > label,
    body.gc-claude-theme .field > label{
      color:#374151 !important;
      font-weight:600 !important;
    }

    /* ========== ボタン ========== */
    body.gc-claude-theme button,
    body.gc-claude-theme .btn,
    body.gc-claude-theme a.btn,
    body.gc-claude-theme .cbtn{
      background:#ffffff !important;
      border:1.5px solid #d1d5db !important;
      border-radius:10px !important;
      box-shadow:none !important;
      color:#1a1a2e !important;
      font-family:inherit !important;
      font-weight:700 !important;
      padding:9px 16px !important;
      transition:all .15s !important;
      cursor:pointer !important;
    }
    body.gc-claude-theme button:hover:not(:disabled),
    body.gc-claude-theme .btn:hover:not(.disabled),
    body.gc-claude-theme a.btn:hover{
      background:#f9fafb !important;
      border-color:#9ca3af !important;
    }
    body.gc-claude-theme button:active:not(:disabled),
    body.gc-claude-theme .btn:active:not(.disabled){
      background:#f3f4f6 !important;
      transform:translateY(0) !important;
    }
    body.gc-claude-theme button:disabled,
    body.gc-claude-theme .btn.disabled,
    body.gc-claude-theme .btn[disabled]{
      opacity:.55 !important;
      cursor:not-allowed !important;
    }

    /* プライマリーボタン（グラデーション） */
    body.gc-claude-theme button.primary,
    body.gc-claude-theme .btn.primary,
    body.gc-claude-theme a.btn.primary,
    body.gc-claude-theme button.btn-primary,
    body.gc-claude-theme .btn-primary{
      background:linear-gradient(92deg,#06b6d4,#2563eb 52%,#7c3aed) !important;
      border:none !important;
      color:#ffffff !important;
      box-shadow:0 2px 6px rgba(37,99,235,.22) !important;
    }
    body.gc-claude-theme button.primary:hover:not(:disabled),
    body.gc-claude-theme .btn.primary:hover:not(.disabled){
      box-shadow:0 4px 10px rgba(37,99,235,.32) !important;
      transform:translateY(-1px) !important;
    }

    /* セカンダリー */
    body.gc-claude-theme .btn.secondary,
    body.gc-claude-theme button.secondary,
    body.gc-claude-theme .btn.sub,
    body.gc-claude-theme .btn.ghost{
      background:#ffffff !important;
      border:1.5px solid #d1d5db !important;
      color:#374151 !important;
    }

    /* 危険系ボタン（赤系維持） */
    body.gc-claude-theme .btn.danger,
    body.gc-claude-theme button.danger,
    body.gc-claude-theme .btn.del,
    body.gc-claude-theme button.del,
    body.gc-claude-theme .rem-del{
      background:#fef2f2 !important;
      border:1.5px solid #fca5a5 !important;
      color:#b91c1c !important;
    }
    body.gc-claude-theme .btn.danger:hover,
    body.gc-claude-theme button.danger:hover{
      background:#fee2e2 !important;
    }

    /* OK・成功系 */
    body.gc-claude-theme .rem-ok,
    body.gc-claude-theme .btn.ok,
    body.gc-claude-theme button.ok{
      background:#f0fdf4 !important;
      border:1.5px solid #86efac !important;
      color:#15803d !important;
    }

    /* ========== チップ・タグ ========== */
    body.gc-claude-theme .chip,
    body.gc-claude-theme .dchip,
    body.gc-claude-theme .tag,
    body.gc-claude-theme .filter-chip,
    body.gc-claude-theme .soon{
      background:#ffffff !important;
      border:1.5px solid #d1d5db !important;
      border-radius:999px !important;
      box-shadow:none !important;
      color:#6b7280 !important;
      font-weight:700 !important;
      padding:6px 13px !important;
      font-size:12.5px !important;
    }
    body.gc-claude-theme .chip.on,
    body.gc-claude-theme .chip.active,
    body.gc-claude-theme .chip.selected,
    body.gc-claude-theme .dchip.on,
    body.gc-claude-theme .filter-chip.on{
      background:#1a1a2e !important;
      color:#ffffff !important;
      border-color:#1a1a2e !important;
    }

    /* ========== バッジ（区分・状態） ========== */
    body.gc-claude-theme .badge,
    body.gc-claude-theme .d-bdg,
    body.gc-claude-theme .status-badge{
      font-weight:700 !important;
      border-radius:999px !important;
      padding:3px 10px !important;
      font-size:11.5px !important;
      box-shadow:none !important;
    }

    /* 施工中（オレンジ系） */
    body.gc-claude-theme .badge.work,
    body.gc-claude-theme .badge.施工中,
    body.gc-claude-theme .d-bdg.st.work,
    body.gc-claude-theme [data-st="施工中"]{
      background:#fff4ed !important;
      color:#c2410c !important;
      border:1px solid #fdba74 !important;
    }
    /* 完了（緑系） */
    body.gc-claude-theme .badge.done,
    body.gc-claude-theme .badge.完了,
    body.gc-claude-theme .d-bdg.st.done,
    body.gc-claude-theme [data-st="完了"]{
      background:#f0fdf4 !important;
      color:#15803d !important;
      border:1px solid #86efac !important;
    }
    /* 見積中（グレー系） */
    body.gc-claude-theme .badge.est,
    body.gc-claude-theme .badge.見積中,
    body.gc-claude-theme .d-bdg.st.est{
      background:#f9fafb !important;
      color:#374151 !important;
      border:1px solid #d1d5db !important;
    }

    /* 権限バッジ（青系） */
    body.gc-claude-theme .permBadge{
      background:#eff6ff !important;
      color:#1d4ed8 !important;
      border:1px solid #bfdbfe !important;
      box-shadow:none !important;
    }
    /* 管理者タグ（赤系維持） */
    body.gc-claude-theme .adminTag{
      background:#fef2f2 !important;
      color:#b91c1c !important;
      border:1px solid #fca5a5 !important;
      box-shadow:none !important;
    }

    /* 勤務状態バッジ */
    body.gc-claude-theme .timeStatus{
      box-shadow:none !important;
      border-radius:10px !important;
      border-width:1.5px !important;
    }
    body.gc-claude-theme .timeStatus.s-work{
      background:#f0fdf4 !important;
      border-color:#86efac !important;
      color:#15803d !important;
    }
    body.gc-claude-theme .timeStatus.s-done{
      background:#fef2f2 !important;
      border-color:#fca5a5 !important;
      color:#b91c1c !important;
    }
    body.gc-claude-theme .timeStatus.s-none{
      background:#f9fafb !important;
      border-color:#d1d5db !important;
      color:#6b7280 !important;
    }

    /* ========== ダッシュボード（index画面） ========== */
    body.gc-claude-theme .dash{
      margin:0 0 18px !important;
    }
    body.gc-claude-theme .dashHd{
      background:#ffffff !important;
      border:1px solid #e5e5e3 !important;
      box-shadow:0 1px 4px rgba(0,0,0,.06) !important;
      border-radius:12px !important;
      color:#1a1a2e !important;
    }
    body.gc-claude-theme .dashHd .arw{color:#9ca3af !important;}
    body.gc-claude-theme .dttl{
      color:#1a1a2e !important;
    }
    body.gc-claude-theme .drow{
      border-bottom:1px dashed #e5e5e3 !important;
      color:#374151 !important;
    }
    body.gc-claude-theme .dtime{
      color:#2563eb !important;
    }
    body.gc-claude-theme .dnote-empty,
    body.gc-claude-theme .dnote-load,
    body.gc-claude-theme .dempty{
      color:#9ca3af !important;
      background:transparent !important;
    }

    /* ========== テーブル ========== */
    body.gc-claude-theme table,
    body.gc-claude-theme .ktbl{
      background:#ffffff !important;
      border-radius:10px !important;
    }
    body.gc-claude-theme thead th,
    body.gc-claude-theme th{
      background:#f9fafb !important;
      color:#374151 !important;
      border-bottom:1px solid #e5e5e3 !important;
      font-weight:700 !important;
    }
    body.gc-claude-theme td{
      border-bottom:1px solid #f3f4f6 !important;
      color:#1a1a2e !important;
    }
    body.gc-claude-theme tr:hover td{
      background:#f9fafb !important;
    }

    /* テーブル横スクロール */
    .gc-common-ui .gc-table-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px}
    .gc-common-ui .gc-scroll-hint{font-size:11px;color:#9ca3af;margin:5px 2px 0;display:none}

    /* ========== セクション・見出し ========== */
    body.gc-claude-theme h1,
    body.gc-claude-theme h2,
    body.gc-claude-theme h3,
    body.gc-claude-theme h4{
      color:#1a1a2e !important;
    }
    body.gc-claude-theme .head .kicker,
    body.gc-claude-theme .section-title{
      color:#9ca3af !important;
    }

    /* ========== 共通ナビゲーション（下部固定） ========== */
    .gc-common-nav{
      position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:120000;
      display:flex;gap:8px;align-items:center;padding:8px;border-radius:14px;
      background:rgba(255,255,255,.94);
      backdrop-filter:blur(14px);
      box-shadow:0 4px 14px rgba(0,0,0,.10);
      border:1px solid #e5e5e3;
    }
    .gc-common-nav a,.gc-common-nav button{
      appearance:none;border:1.5px solid #d1d5db;text-decoration:none;cursor:pointer;
      min-height:38px;padding:0 14px;border-radius:999px;
      background:#ffffff;color:#1a1a2e;font-weight:700;font-size:13px;
      display:inline-flex;align-items:center;justify-content:center;gap:5px;
      box-shadow:none;font-family:inherit;white-space:nowrap;
    }
    .gc-common-nav a.primary{
      background:linear-gradient(92deg,#06b6d4,#2563eb 62%,#7c3aed);
      color:#ffffff;border:none;
      box-shadow:0 2px 6px rgba(37,99,235,.22);
    }
    .gc-common-nav a:active,.gc-common-nav button:active{
      transform:translateY(1px);
    }
    .gc-action-menu,.gc-action-refresh{
      font-weight:700 !important;border-radius:999px !important;
    }

    /* ========== FAB（フローティングボタン） ========== */
    body.gc-claude-theme .fab{
      background:linear-gradient(135deg,#06b6d4,#7c3aed) !important;
      box-shadow:0 4px 14px rgba(124,58,237,.35) !important;
      color:#ffffff !important;
      border:none !important;
    }

    /* ========== モーダル・ダイアログ ========== */
    body.gc-claude-theme .modal,
    body.gc-claude-theme dialog,
    body.gc-claude-theme .dbody,
    body.gc-claude-theme .dhead{
      background:#ffffff !important;
    }
    body.gc-claude-theme .dhead{
      border-bottom:1px solid #e5e5e3 !important;
    }
    body.gc-claude-theme .dclose{
      background:#ffffff !important;
      border:1px solid #e5e5e3 !important;
      box-shadow:none !important;
      color:#6b7280 !important;
    }

    /* ========== 戻るボタン / topbar の back ========== */
    body.gc-claude-theme .back,
    body.gc-claude-theme a.back,
    body.gc-claude-theme button.back{
      background:#ffffff !important;
      border:1.5px solid #d1d5db !important;
      color:#374151 !important;
      box-shadow:none !important;
      border-radius:999px !important;
      padding:6px 12px !important;
      font-weight:700 !important;
    }

    /* ========== その他の補助スタイル ========== */
    body.gc-claude-theme .err,
    body.gc-claude-theme .error{
      color:#b91c1c !important;
    }
    body.gc-claude-theme .empty,
    body.gc-claude-theme .dnote-empty{
      color:#9ca3af !important;
      background:transparent !important;
    }

    /* リンク色 */
    body.gc-claude-theme a:not(.sq):not(.btn):not(.back):not(.chip):not(.dchip){
      color:#2563eb !important;
    }
    body.gc-claude-theme a:not(.sq):not(.btn):not(.back):not(.chip):not(.dchip):hover{
      color:#1d4ed8 !important;
    }

    /* ロゴ画像（角丸統一） */
    body.gc-claude-theme .head-logo img{
      border-radius:10px !important;
      box-shadow:0 2px 6px rgba(0,0,0,.08) !important;
    }

    /* スピナー */
    body.gc-claude-theme .spin{
      border-color:#e5e5e3 !important;
      border-top-color:#7c3aed !important;
    }

    /* ========== レスポンシブ対応 ========== */
    @media(max-width:1024px){
      .gc-common-ui .wrap,.gc-common-ui .container,.gc-common-ui .shell,.gc-common-ui main,.gc-common-ui .page,.gc-common-ui .page-wrap{max-width:100% !important;width:100% !important}
      .gc-common-ui .panel,.gc-common-ui .card,.gc-common-ui .box,.gc-common-ui .section{max-width:100% !important}
      .gc-common-ui .toolbar,.gc-common-ui .actions,.gc-common-ui .btnrow,.gc-common-ui .row.actions{flex-wrap:wrap !important;gap:10px !important}
      .gc-common-ui input,.gc-common-ui select,.gc-common-ui textarea{max-width:100% !important}
    }
    @media(max-width:820px){
      .gc-common-ui{min-width:0 !important}
      .gc-common-ui input,.gc-common-ui select,.gc-common-ui textarea{font-size:16px !important;min-height:44px}
      .gc-common-ui button,.gc-common-ui .btn,.gc-common-ui a.btn,.gc-common-ui [role="button"]{min-height:44px}
      .gc-common-ui table{min-width:720px}
      .gc-common-ui .gc-table-scroll + .gc-scroll-hint{display:block}
      .gc-common-ui .grid:not(.ledger-photo-grid):not(.photo-grid),.gc-common-ui .cards,.gc-common-ui .tiles,.gc-common-ui .list-grid{grid-template-columns:1fr !important}
      .gc-common-ui .hide-mobile{display:none !important}
      .gc-common-ui .show-mobile{display:block !important}
    }
    @media(max-width:680px){
      body.gc-common-ui{padding-bottom:calc(74px + env(safe-area-inset-bottom))}
      .gc-common-ui .head,.gc-common-ui .hero,.gc-common-ui header{padding-left:14px !important;padding-right:14px !important}
      .gc-common-ui .panel,.gc-common-ui .card,.gc-common-ui .box{border-radius:14px !important}
      .gc-common-ui .modal,.gc-common-ui dialog{max-width:calc(100vw - 18px) !important;width:calc(100vw - 18px) !important}
      .gc-common-nav{left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));justify-content:space-between;border-radius:14px;padding:8px}
      .gc-common-nav a,.gc-common-nav button{flex:1;padding:0 8px;font-size:12.5px;min-width:0}
      .gc-root-page .grid{grid-template-columns:repeat(3,minmax(0,1fr)) !important;gap:9px !important}
      .gc-root-page a.sq{padding:10px !important;border-radius:12px !important;min-height:0 !important}
      .gc-root-page .sq .ic{width:39px !important;height:39px !important;border-radius:8px !important}
      .gc-root-page .head h1{font-size:26px !important;color:#1a1a2e !important}
      #fileAddDock,#ledgerDock,.ledger-dock,.file-dock{left:0 !important;right:0 !important;bottom:0 !important;border-radius:14px 14px 0 0 !important;padding:10px 12px calc(10px + env(safe-area-inset-bottom)) !important;max-width:none !important;background:#ffffff !important;border-top:1px solid #e5e5e3 !important}
      #fileAddDock button,#ledgerDock button,.ledger-dock button,.file-dock button{min-height:50px !important}
    }
    @media(max-width:420px){
      .gc-root-page .grid{gap:8px !important}
      .gc-root-page .sq .ic{width:36px !important;height:36px !important}
    }
  `;
  document.head.appendChild(style);

  // テーブル横スクロール化
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

  // 共通ナビゲーション挿入
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

  // デモページ用バッジ
  try{
    if(/\/demo\//.test(path) && !document.getElementById('gcDemoBadge')){
      var db=document.createElement('div');
      db.id='gcDemoBadge';
      db.textContent='DEMO MODE';
      db.style.cssText='position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:130000;background:linear-gradient(92deg,#06b6d4,#2563eb 62%,#7c3aed);color:#fff;border-radius:999px;padding:6px 11px;font:800 11px Manrope,sans-serif;letter-spacing:.08em;box-shadow:0 4px 12px rgba(37,99,235,.28);pointer-events:none;';
      document.body.appendChild(db);
    }
  }catch(e){}

})();
