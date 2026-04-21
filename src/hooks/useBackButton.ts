import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * On native platforms, intercepts the hardware/swipe back gesture
 * and navigates to the previous page instead of closing the app.
 * Only exits the app if there's no history to go back to.
 */
export function useBackButton() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1);
      } else {
        App.exitApp();
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate]);
}
