const CACHE='estadistica1p-v4';
const TOPICS=Array.from({length:17},(_,i)=>`./topics/topic-${String(i+1).padStart(2,'0')}.html`);
const CORE=[
  './','./index.html','./manifest.webmanifest','./app.css','./app.js','./content-a.html',
  ...TOPICS,'./topics/inventory.html','./icon-192.png','./icon-512.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r && (r.ok||r.type==='opaque')){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
    return r;
  })));
});
