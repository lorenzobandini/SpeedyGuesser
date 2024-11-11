'use client';

import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { subscribeUser, sendNotification } from '~/app/actions';


function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      void registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    const keys = sub.toJSON().keys;
    if (!keys?.p256dh || !keys?.auth) {
      throw new Error('Missing keys in the subscription');
    }
    const transformedSub = {
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };
    await subscribeUser(transformedSub);
    setSubscription(sub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
  }

  async function sendTestNotification() {
    if (subscription) {
      const result = await sendNotification(message);
      if (!result.success) {
        await subscribeToPush();
        await sendNotification(message);
      }
      setMessage('');
    }
  }

  if (!isSupported) {
    return <p>Le notifiche push non sono supportate in questo browser.</p>;
  }

  return (
    <div>
      <h3>Notifiche Push</h3>
      {subscription ? (
        <>
          <p>Sei iscritto alle notifiche push.</p>
          <button onClick={unsubscribeFromPush}>Disiscriviti</button>
          <input
            type="text"
            placeholder="Inserisci il messaggio"
            className="text-dark"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Invia notifica</button>
        </>
      ) : (
        <>
          <p>Non sei iscritto alle notifiche push.</p>
          <button onClick={subscribeToPush}>Iscriviti</button>
        </>
      )}
    </div>
  );
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
    );
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone) {
    return null; 
  }

  return (
    <div>
      <h3>Installa l&apos;App</h3>
      <button>Aggiungi alla schermata principale</button>
      {isIOS && (
        <p>
          Per installare questa app sul tuo dispositivo iOS, tocca il pulsante
          condividi
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          e poi &quot;Aggiungi a Home&quot;.
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-grow flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Speedy<span className="text-dark">Guesser</span>
          </h1>
          <Link href="game/">
            <Button variant="personal" size="xl">
              <div className="text-3x">Play</div>
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-10 p-4">
        <PushNotificationManager />
        <InstallPrompt />
      </div>
    </div>
  );
}

