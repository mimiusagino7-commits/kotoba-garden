const CACHE_NAME = 'kotoba-garden-v2'; // 画像追加に伴いキャッシュバージョンを更新したわよ✨
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg',
  'images/wind.png',
  'images/earth.png',
  'images/water.png',
  'images/fire.png'
];

// インストール時にキャッシュをそっと敷き詰めるの
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('お庭の草花と妖精たち（キャッシュ）を植え込んでいくわよ🌿');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベート時、古いお庭をお掃除するわね
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('古いお庭の落ち葉をお掃除するわね🧹:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ処理：オフラインのときはキャッシュからそっと取り出して差し上げるの
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => { /* オフライン時はサイレントに失敗してOK */ });
          
          return cachedResponse;
        }

        return fetch(event.request);
      })
  );
});
