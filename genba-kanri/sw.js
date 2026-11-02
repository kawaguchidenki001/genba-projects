/* 現場管理 service worker v1.0.0 (2026-11-02)
 * 方針：Gen-Canと同じく、ファイルはキャッシュせずネットワークから直接読む（古い画面が残る事故を防ぐ）。
 * 電波がなくてページを開けない時だけ、案内ページを返す。 */
var GK_SW_VERSION = 'gk-20261102-1-0-0';
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  if(e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function(){
    return new Response(
      '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>オフライン｜現場管理</title>'+
      '<body style="margin:0;font-family:sans-serif;background:#eef2f7;color:#1b2a3a;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;">'+
      '<div><div style="font-size:46px;margin-bottom:8px;">📡</div><h1 style="font-size:20px;margin:0 0 6px;">オフラインです</h1>'+
      '<p style="color:#5a6b7e;font-size:14px;line-height:1.7;margin:0 0 16px;">電波の届く場所に移動してから<br>もう一度開いてください。</p>'+
      '<button onclick="location.reload()" style="padding:13px 26px;border:none;border-radius:12px;background:#2563eb;color:#fff;font-size:15px;font-weight:700;">再読み込み</button>'+
      '</div></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }));
});
