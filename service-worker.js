const CACHE_NAME = 'cancheo-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.tsx', // Assuming this is the entry point
    'https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q'
];

// URLs de CDNs y recursos externos que deben ser cacheados
const EXTERNAL_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js',
    'https://aistudiocdn.com/react@^19.1.1',
    'https://aistudiocdn.com/react-dom@^19.1.1/',
    'https://aistudiocdn.com/@google/genai@^1.28.0',
    'https://aistudiocdn.com/@tanstack/react-virtual@^3.13.12'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            // Cachear el App Shell y recursos externos críticos
            const assetsToCache = [...STATIC_ASSETS, ...EXTERNAL_ASSETS];
            return cache.addAll(assetsToCache).catch(err => {
                console.error('Failed to cache assets during install:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Estrategia: Stale-While-Revalidate para CDNs y fuentes
    if (EXTERNAL_ASSETS.some(url => request.url.startsWith(url))) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(response => {
                    const fetchPromise = fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    // Estrategia: Cache-First para el App Shell e imágenes
    if (STATIC_ASSETS.includes(request.url) || request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((response) => {
                return response || fetch(request).then((fetchResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
        );
        return;
    }
    
    // Estrategia: Network-First para APIs (Firebase, Open-Meteo, etc.)
    // Esto asegura que siempre se obtengan los datos más recientes si hay conexión.
    if (request.url.includes('firestore.googleapis.com') || request.url.includes('api.open-meteo.com')) {
         event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    // Si la respuesta es válida, la cacheamos y la devolvemos
                    if (networkResponse.ok) {
                         const responseClone = networkResponse.clone();
                         caches.open(CACHE_NAME).then(cache => {
                             cache.put(request, responseClone);
                         });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Si la red falla, intentamos devolver desde el caché
                    return caches.match(request).then(response => {
                        return response || new Response(JSON.stringify({ offline: true }), { headers: { 'Content-Type': 'application/json' }});
                    });
                })
        );
        return;
    }


    // Fallback: solo red para cualquier otra cosa.
    event.respondWith(fetch(request));
});
