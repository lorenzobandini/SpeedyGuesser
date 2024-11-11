'use client'

import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { IoMdSettings, IoMdNotifications, IoMdAddCircle, IoMdNotificationsOff } from "react-icons/io"; // Aggiungi nuove icone
import { useState, useEffect } from 'react';
import { subscribeUser, sendNotification } from '~/app/actions';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
    <div className="flex flex-col space-y-4">
      <h3 className="text-lg font-semibold">Notifiche Push</h3>
      {subscription ? (
        <>
          <div className="flex items-center space-x-2">
            <IoMdNotifications size={24} />
            <p>Sei iscritto alle notifiche push.</p>
          </div>
          <Button variant="personalDestructive" onClick={unsubscribeFromPush} aria-label="Disiscriviti">
            <IoMdNotificationsOff size={20} />
          </Button>
          <div className="flex flex-col space-y-2 mt-4">
            <input
              type="text"
              placeholder="Inserisci il messaggio"
              className="text-dark border px-2 py-1 rounded-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button variant="personalIcon" onClick={sendTestNotification} aria-label="Invia notifica">
              <IoMdAddCircle size={20} />
            </Button>
          </div>
        </>
      ) : (
        <>
          <p>Non sei iscritto alle notifiche push.</p>
          <Button variant="personalIcon" onClick={subscribeToPush} aria-label="Iscriviti">
            <IoMdNotifications size={20} />
          </Button>
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
    <div className="flex flex-col space-y-4">
      <h3 className="text-lg font-semibold">Installa l&apos;App</h3>
      <Button variant="personalIcon">
        <IoMdAddCircle size={20} />
        Aggiungi alla schermata principale
      </Button>
      {isIOS && (
        <p className="flex items-center">
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

export default function SettingsButton() {
  return (
    <Dialog>
      <VisuallyHidden>
        <DialogTitle>Titolo</DialogTitle>
        <DialogDescription>Descrizione</DialogDescription>
      </VisuallyHidden>
      <DialogTrigger asChild>
        <Button variant={"personalIcon"} size={"icon"}>
          <IoMdSettings size={32} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <PushNotificationManager />
        <InstallPrompt />
      </DialogContent>
    </Dialog>
  );
}
