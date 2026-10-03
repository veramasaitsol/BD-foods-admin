importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBnmbjh2yxhJ1Kxovh92cWRYfPcXg8_ugA',
  authDomain: 'brundhavanam-desi-foods.firebaseapp.com',
  projectId: 'brundhavanam-desi-foods',
  storageBucket: 'brundhavanam-desi-foods.firebasestorage.app',
  messagingSenderId: '292902930263',
  appId: '1:292902930263:web:63ae7e55fc0ca520d1e012',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Brundhavanam Desi Foods Admin', {
    body,
    icon: '/favicon.ico',
  });
});
