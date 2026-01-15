// PillTime Service Worker
// Basic PWA service worker for installability
// Full offline functionality to be added later

const CACHE_NAME = 'pilltime-v1';
const STATIC_CACHE = [
  '/',
  '/manifest.json',
];

// Install event - basic cache setup
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching basic files');
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first strategy for now
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Push notification event (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Time to take your medication',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'medication-reminder',
      requireInteraction: true,
      actions: [
        { action: 'taken', title: 'Mark as Taken' },
        { action: 'snooze', title: 'Snooze 10 min' },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'PillTime Reminder', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'taken') {
    // Handle mark as taken
    console.log('[SW] Medication marked as taken from notification');
    // TODO: Send to API
  } else if (event.action === 'snooze') {
    // Handle snooze
    console.log('[SW] Medication snoozed');
    // TODO: Reschedule notification
  } else {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker loaded');
