import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

/**
 * On native platforms, listens for deep link / universal link opens
 * and routes auth callback URLs (e.g. password recovery) into the app.
 */
export function useDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('appUrlOpen', async ({ url }) => {
      try {
        const parsed = new URL(url);

        // Handle auth callback: extract tokens from hash fragment
        // e.g. https://globalattract.lovable.app/reset-password#access_token=...&type=recovery
        const hash = parsed.hash;
        if (hash && (hash.includes('type=recovery') || hash.includes('type=invite') || hash.includes('type=signup'))) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set the session from the tokens in the deep link
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }

          // Navigate to the reset-password page so the UI can handle the flow
          navigate('/reset-password' + (hash ? '#' + hash.substring(1) : ''));
          return;
        }

        // Generic path routing: navigate to the path from the deep link
        const path = parsed.pathname;
        if (path && path !== '/') {
          navigate(path);
        }
      } catch (e) {
        console.error('Deep link handling error:', e);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate]);
}
