var version = 'v8::';
var cacheName = 'mika.house';
var filesToCache = [
    '/manifest.json',
    '/styles/screen.css',
    '/scripts/app.js',
    '/scripts/controllers.js',
    '/templates/login.html'
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(version + cacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache);
      })
  );
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== 'GET'){
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(function(cached){
        var networked = fetch(event.request)
          .then(fetchedFromNetwork, unableToResolve)
          .catch(unableToResolve);

        return networked || cached;

        function fetchedFromNetwork(response){
          var cacheCopy = response.clone();
          caches.open(version + 'pages')
            .then(function add(cache){
              cache.put(event.request, cacheCopy);
            });
          return response;
        }

        function unableToResolve(){
          return new Response('<h1>Service Unavailable</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        }
      })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(
          keys.filter(function(key){
            return !key.startsWith(version);
          })
          .map(function(key){
            return caches.delete(key);
          })
        )
      })
  );
});