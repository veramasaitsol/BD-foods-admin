import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBnmbjh2yxhJ1Kxovh92cWRYfPcXg8_ugA',
  authDomain: 'brundhavanam-desi-foods.firebaseapp.com',
  projectId: 'brundhavanam-desi-foods',
  storageBucket: 'brundhavanam-desi-foods.firebasestorage.app',
  messagingSenderId: '292902930263',
  appId: '1:292902930263:web:63ae7e55fc0ca520d1e012',
  measurementId: 'G-YNP1BQWHZF',
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

const app = initializeApp(firebaseConfig);

let messagingPromise: Promise<Messaging | null> | null = null;

function getMessagingIfSupported(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((ok) => (ok ? getMessaging(app) : null));
  }
  return messagingPromise;
}

// Returns null if the browser doesn't support push, permission is denied,
// or VITE_FIREBASE_VAPID_KEY isn't configured — callers should treat push
// registration as a best-effort enhancement, not a required step.
export async function requestFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('[push] VITE_FIREBASE_VAPID_KEY not set — push notifications disabled.');
    return null;
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  try {
    return await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  } catch (err) {
    console.warn('[push] Failed to fetch FCM token:', err);
    return null;
  }
}

export async function listenForForegroundMessages(
  callback: (payload: { title?: string; body?: string }) => void
) {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    callback({ title: payload.notification?.title, body: payload.notification?.body });
  });
}
