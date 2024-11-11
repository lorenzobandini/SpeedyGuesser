/* eslint-disable */
/// <reference lib="webworker" />

const swSelf = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

swSelf.addEventListener('push', function (event) {
  const pushEvent = /** @type {PushEvent} */ (event);
  const data = pushEvent.data ? pushEvent.data.json() : {};
  const options = {
    body: data.body,
    icon: data.icon || '/SpeedyGuesserLogo-LittleRounded.png',
    badge: '/SpeedyGuesserLogo-BigRounded.png',
  };
  pushEvent.waitUntil(
    swSelf.registration.showNotification(data.title, options)
  );
});

swSelf.addEventListener('notificationclick', function (event) {
  const notificationEvent = /** @type {NotificationEvent} */ (event);
  notificationEvent.notification.close();
  notificationEvent.waitUntil(
    swSelf.clients.openWindow('/')
  );
});

swSelf.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.addAll(['/offline.html']);
    })
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
