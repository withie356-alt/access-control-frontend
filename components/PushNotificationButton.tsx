import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const PushNotificationButton: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            setIsSubscribed(true);
            setSubscription(subscription);
          }
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setError('Push notifications are not supported by this browser.');
        return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY, // Make sure you have this in your .env file
      });

      console.log('User is subscribed:', subscription);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('push_subscriptions').upsert({ 
            id: user.id, 
            subscription: subscription,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }

      setIsSubscribed(true);
      setSubscription(subscription);
      setError(null);
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
      setError('Failed to subscribe for notifications. Please try again.');
    }
  };

  const unsubscribeUser = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        console.log('User is unsubscribed.');

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('push_subscriptions').delete().match({ id: user.id });
        }

        setIsSubscribed(false);
        setSubscription(null);
      } catch (error) {
        console.error('Failed to unsubscribe the user: ', error);
        setError('Failed to unsubscribe. Please try again.');
      }
    }
  };

  const handleToggleSubscription = () => {
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  };

  return (
    <div>
      <button onClick={handleToggleSubscription} disabled={!('serviceWorker' in navigator && 'PushManager' in window)}>
        {isSubscribed ? 'Disable Push Notifications' : 'Enable Push Notifications'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PushNotificationButton;
