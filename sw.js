const CACHE="lrv-contrast-v9";
const FILES=["./","./index.html","./manifest.webmanifest"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;

  // Voor pagina-navigaties eerst het netwerk proberen, zodat GitHub Pages-updates
  // snel zichtbaar worden. Offline vallen we terug op de lokale cache.
  if(event.request.mode==="navigate"){
    event.respondWith(
      fetch(event.request).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put("./index.html",copy));
        return resp;
      }).catch(()=>caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached || fetch(event.request).then(resp=>{
      const copy=resp.clone();
      caches.open(CACHE).then(c=>c.put(event.request,copy));
      return resp;
    }))
  );
});
