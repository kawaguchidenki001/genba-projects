/* Gen-Can PWA service worker v2026.06.20-43 */
const GC_SW_VERSION = '20260620-login-header-fix-43';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
/* 通信はそのまま通す。古いキャッシュ表示を避けるため、アプリ側はconfig.jsにキャッシュバスターを付与。 */
self.addEventListener('fetch', function(e){ /* network passthrough 20260620-login-header-fix-43 */ });
