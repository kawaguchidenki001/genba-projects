/* Gen-Can PWA service worker v2026.06.19-41 */
const GC_SW_VERSION = '20260619-rollout-check-41';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
/* 通信はそのまま通す。古いキャッシュ表示を避けるため、アプリ側はconfig.jsにキャッシュバスターを付与。 */
self.addEventListener('fetch', function(e){ /* network passthrough 20260619-rollout-check-41 */ });
