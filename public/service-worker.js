var cacheName = 'v13::mika.house';

var filesToCache = [
  'manifest.json',
  'styles/screen.css',
  'scripts/app.js',
  'scripts/controllers.js',
  'templates/login.html',
  'icons/icon-512.png',
  'images/security/last.jpg'
];

var cacheableAssetTypes = [
  'jpg', 'png', 'webp', 'js', 'css'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(async cache => {
        const response = await cache.match(event.request);
        return response || fetch(event.request)
          .then(resource => {
            var url = event.request.url;
            if(url && evaluateCacheable(url)) {
              cache.put(event.request, resource.clone())
                .then(cached => {
                  return cached;
                })
                .catch(err => {})
            }
            return resource;
          })
          .catch(err => {})
      })
      .catch(err => {})
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key != cacheName) {
          return caches.delete(key);
        }
      })
    ))
  );  
});

var evaluateCacheable = function(url) {
  if(url.indexOf('?') != -1)
    return false;
  var shouldCache = cacheableAssetTypes.map(type => url.indexOf(type) != -1);
  return shouldCache.includes(true);
}