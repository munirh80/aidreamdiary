// Service Worker for Dream Journal Push Notifications
const CACHE_NAME = 'dreamscape-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let data = {
    title: 'Dreamscape Reminder',
    body: 'Time to record your dreams! Don\'t let them fade away.',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'dream-reminder',
    data: {
      url: '/dreams/new'
    }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/logo192.png',
    tag: data.tag || 'dream-notification',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: [
      { action: 'record', title: 'Record Dream' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'record') {
    event.waitUntil(
      clients.openWindow('/dreams/new')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        return clients.openWindow(urlToOpen);
      })
    );
  }
});

// Background sync for offline dream recording
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-dreams') {
    console.log('Background sync triggered');
  }
});
