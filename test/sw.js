/* Gen-Can PWA service worker（インストール可能化・最小構成） */
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
/* fetchハンドラを持つことでインストール条件を満たす（通信はそのまま通す） */
self.addEventListener('fetch', function(e){ /* network passthrough */ });
