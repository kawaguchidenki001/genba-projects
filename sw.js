/* Gen-Can PWA service worker v2026.06.19-08 */
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
/* fetchハンドラを持つことでインストール条件を満たす（通信はそのまま通す） */
self.addEventListener('fetch', function(e){ /* network passthrough 20260619-drive-hierarchy-08 */ });
