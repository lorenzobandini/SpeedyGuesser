/* eslint-disable */
/// <reference lib="webworker" />

// Cast esplicito a 'unknown' prima di convertire in 'ServiceWorkerGlobalScope'
const swSelf = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

// Gestione evento "push"
swSelf.addEventListener('push', function (event) {
  const pushEvent = /** @type {PushEvent} */ (event);
  const data = pushEvent.data ? pushEvent.data.json() : {};
  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: '/badge.png',
  };
  pushEvent.waitUntil(
    swSelf.registration.showNotification(data.title, options)
  );
});

// Gestione evento "notificationclick"
swSelf.addEventListener('notificationclick', function (event) {
  const notificationEvent = /** @type {NotificationEvent} */ (event);
  notificationEvent.notification.close();
  notificationEvent.waitUntil(
    swSelf.clients.openWindow('/')
  );
});

swSelf.addEventListener('fetch', (event) => {
  const fetchEvent = /** @type {FetchEvent} */ (event);
  fetchEvent.respondWith(
    fetch(fetchEvent.request)
      .catch(async () => {
        const response = await caches.match('/offline.html');
        return response || new Response('Offline page not available', { status: 503 });
      })
  );
});
