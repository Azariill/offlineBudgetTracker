/** @format */
const DATA_CACHE_NAME = 'data-cache-v1';
const APP_PREFIX = "MyBudget-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = ["./index.html", "./css/styles.css", "./js/index.js", './manifest.json'];

// Responds with cached resources if the exits if not does the fetch request
self.addEventListener('fetch', function(evt) {
  if (evt.request.url.includes('/api/')) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(cache => {
            return fetch(evt.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  // else{
    evt.respondWith(
      fetch(evt.request).catch(function() {
        return caches.match(evt.request).then(function(response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get('accept').includes('text/html')) {
            // return the cached home page for all requests for html pages
            return caches.match('./index.html');
          }
        });
      })
    );
  // }
});


// Cache resources
self.addEventListener('install', function (e) {
e.waitUntil(
  caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(FILES_TO_CACHE)
  })
)
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
e.waitUntil(
  caches.keys().then(function (keyList) {
    // `keyList` contains all cache names under your username.github.io
    // filter out ones that has this app prefix to create keeplist
    let cacheKeeplist = keyList.filter(function (key) {
      return key.indexOf(APP_PREFIX);
    })
    // add current cache name to keeplist
    cacheKeeplist.push(CACHE_NAME);

    return Promise.all(keyList.map(function (key, i) {
      if (cacheKeeplist.indexOf(key) === -1) {
        return caches.delete(keyList[i]);
      }
    }));
  })
);
});
