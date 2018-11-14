var version = 'v6::';
var cacheName = 'mika.house';
var filesToCache = [
    '/manifest.json',
    '/styles/screen.css',
    '/scripts/app.js',
    '/scripts/controllers.js',
    '/fonts/fontawesome-webfont.woff2?v=4.7.0'
];

self.addEventListener("install", function(e) {
  // console.log('WORKER: install event in progress.');
  e.waitUntil(
    caches.open(version + cacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache);
      })
      .then(function(){
        // do stuff
      })
  );
});

self.addEventListener("fetch", function(event){
  // console.log('WORKER: fetch event in progress.');
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
            })
            .then(function(){
              // console.log('WORKER: fetch response stored in cache.', event.request.url);
            });
          return response;
        }

        function unableToResolve(){
          // console.log('WORKER: fetch request failed in both cache and network.');
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
  // console.log('WORKER: activate event in progress.');
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
      .then(function(){
        // stuff
      })
  );
});