self.addEventListener('push', (event) => {
  try {
    const data = event.data.json();
    console.log('Push notification received:', data);
    
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/badge.png',
      data: {
        url: data.url
      },
      requireInteraction: true,
      vibrate: [200, 100, 200]
    });
  } catch (err) {
    console.error('Error handling push notification:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
}); 