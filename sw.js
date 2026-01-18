// FlowState Service Worker
// Handles push notifications and caching

const CACHE_NAME = 'flowstate-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests
  if (event.request.url.includes('/rest/v1/') || 
      event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Clone and cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = {
    title: 'FlowState',
    body: 'Günlük bulmaca hazır!',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: [100, 50, 100],
      tag: 'flowstate-push',
      requireInteraction: false,
      data: data
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('localhost') || client.url.includes('flowstate')) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return self.clients.openWindow('/');
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-scores') {
    event.waitUntil(
      // Sync any pending scores when back online
      Promise.resolve()
    );
  }
});

console.log('[SW] Service Worker loaded');
