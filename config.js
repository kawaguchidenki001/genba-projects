// Gen-Can 共通設定 v145
// ファイル更新時は APP_VERSION / BUILD を必ず変更します。
// v2026.06.20-43.9.5 タイル文字サイズ調整＋氏名表示＋勤務状態キャッシュ
// v2026.06.20-43.9.4 PC1列+スマホ文字スワップ
// v2026.06.20-43.9.3 勤務状態のキャッシュ＋即時表示
// v2026.06.20-43.9.2 認証fix+スマホ文字拡大+状態色
// v2026.06.20-43.9.1 管理者バッジ+勤務状態ボタン
// v2026.06.20-43.9.0 メニュー再編
// v2026.06.20-43.8.3 setup getSecret修正＋テストログイン無効化
// GASを再デプロイしてURLが変わった場合は GAS_URL だけ変更します。
window.GENBA_CONFIG = {
  APP_NAME: 'Gen-Can',
  APP_VERSION: 'v2026.06.20-43.9.5',
  BUILD: '20260621-v43-9-5',
  TEST_LOGIN_ENABLED: false, // 2026-06-20 販売準備としてテストログイン無効化済み
  GAS_URL: 'https://script.google.com/macros/s/AKfycbyk8p6_gi6e3wdhQdWL0Oswz4BUtP3gR37PeFJJ9rO5mVhTRt4CikpQhK_bBwt1Ftr-/exec'
};
