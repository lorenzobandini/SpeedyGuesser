'use server';

import * as webpush from 'web-push';

if (webpush && typeof webpush.setVapidDetails === 'function') {
  webpush.setVapidDetails(
    'mailto:lboa@hotmail.it',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
} else {
  throw new Error('Failed to initialize webpush');
}

let subscription: webpush.PushSubscription | null = null;

export async function subscribeUser(sub: webpush.PushSubscription) {
  const p256dh = sub.keys.p256dh;
  const auth = sub.keys.auth;

  if (!p256dh || !auth) {
    throw new Error('Missing keys in the subscription');
  }

  subscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: p256dh,
      auth: auth,
    },
  };

  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    return { success: false, error: 'No subscription available' };
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: 'SpeedyGuesser',
      body: message,
      icon: '/SpeedyGuesserLogo-LittleRounded.png',
    }));
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send notification' };
  }
}
