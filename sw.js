/* Gen-Can PWA service worker v2026.07.04-43.12.0 */
/* 方針：キャッシュ事故防止のためリソースはネットワーク直通のまま（cache-lock維持）。
   v43.12.0: オフラインでページを開いた時に真っ白になるのを防ぐため、
   ページ遷移(navigate)の通信失敗時だけ案内ページを返すフォールバックを追加。 */
const GC_SW_VERSION = '20260704-v43-12-0-offline-fallback';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  if(e.request.mode !== 'navigate') return; /* ページ以外は素通し（従来どおり） */
  e.respondWith(fetch(e.request).catch(function(){
    return new Response(
      '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>オフライン｜Gen-Can</title>'+
      '<body style="margin:0;font-family:\'Zen Kaku Gothic New\',sans-serif;background:#e8ecf2;color:#1f3a52;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;">'+
      '<div><div style="font-size:46px;margin-bottom:8px;">📡</div>'+
      '<h1 style="font-size:20px;margin:0 0 6px;">オフラインです</h1>'+
      '<p style="color:#5e7a92;font-size:14px;line-height:1.7;margin:0 0 16px;">電波の届く場所に移動してから<br>再読み込みしてください。</p>'+
      '<button onclick="location.reload()" style="padding:13px 26px;border:none;border-radius:12px;background:linear-gradient(92deg,#06b6d4,#2563eb 60%,#7c3aed);color:#fff;font-size:15px;font-weight:800;cursor:pointer;">再読み込み</button>'+
      '</div></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }));
});
