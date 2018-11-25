var version = 'v00003::';
var cacheName = version + 'mika.house';
var filesToCache = [
    'styles/screen.css',
    'scripts/app.js',
    'scripts/controllers.js',
    'templates/login.html',
    'icons/icon-192.png',
    'icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if(url.indexOf('jpg') > -1 || url.indexOf('webp') > -1 && url.indexOf('?') == -1){
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          return response || fetchPromise;
        })
      })
    );
  }  
});

self.addEventListener('activate', function(event) {
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

function fromCache(request) {
  return caches.open(version + cacheName).then(function (cache) {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(version + cacheName).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}

function refresh(response) {
  return self.clients.matchAll()
    .then(function(clients) {
      clients.forEach(function(client) {
        var message = {
          type: 'refresh',
          url: response.url,
          eTag: response.headers.get('ETag')
        };

        client.postMessage(JSON.stringify(message));
      })
    })
}