// הוספה לרשימת הקבצים לשמירה במטמון
const CACHE_NAME = 'swiss-trip-navigator-v2'; // שינוי מספר גרסה
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/map.js',
  './js/itinerary.js',
  './js/utils.js',
  './js/Layer.js',
  './data/itinerary.json',
  './mainview.webp', // במקום icons/mainview.png
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', // שדרוג גרסת Leaflet
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',  // שדרוג גרסת Leaflet
  // אייקונים
  './icons/waterfall.svg',
  './icons/viewpoint.svg',
  './icons/lake.svg',
  './icons/mountain.svg',
  './icons/gorge.svg',
  './icons/landmark.svg',
  './icons/monument.svg',
  './icons/castle.svg',
  './icons/parking.svg',
  './icons/city.svg',
  './icons/cablecar.svg',
  './icons/default.svg',
  './icons/navigation.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// התקנת קבצים בקאש
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// הפעלת השירות וורקר
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// שימוש בקבצים מהקאש במקום מהרשת כשאין חיבור
self.addEventListener('fetch', event => {
  // בקשות לאריחי מפה של OpenStreetMap
  if (event.request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open('map-tiles-cache').then(cache => {
        return cache.match(event.request).then(response => {
          // החזרת תשובה מהמטמון אם היא קיימת
          if (response) {
            return response;
          }
          
          // אחרת, בקשה מהרשת ושמירה במטמון
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // אם אין חיבור לאינטרנט, החזר תמונת אריח פשוטה
            return new Response('', {
              status: 200,
              statusText: 'OK',
              headers: new Headers({'Content-Type': 'image/png'})
            });
          });
        });
      })
    );
    return;
  }
  
  // כל שאר הבקשות
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // אם הכל נכשל והבקשה היא לדף HTML, החזר דף שגיאה
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('./index.html');
        }
      })
  );
});