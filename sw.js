const CACHE="lrv-contrast-v3";
const FILES=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request).then(resp=>{
    const copy=resp.clone();
    caches.open(CACHE).then(c=>c.put(event.request,copy));
    return resp;
  }).catch(()=>caches.match("./index.html"))));
});
