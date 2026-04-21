import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FeatureControl {
  id: string;
  feature_key: string;
  feature_name: string;
  is_globally_disabled: boolean;
  disabled_platforms: string[];
  disabled_message: string;
  admin_bypass: boolean;
}

export function useFeatureControls() {
  const { profile, isAdmin, isSuperAdmin } = useAuth();
  const [controls, setControls] = useState<FeatureControl[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchControls = async () => {
    const { data } = await supabase
      .from('feature_controls')
      .select('*')
      .order('feature_name');
    if (data) setControls(data as unknown as FeatureControl[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const isFeatureDisabled = (featureKey: string): { disabled: boolean; message: string; hidden: boolean } => {
    if (isSuperAdmin) return { disabled: false, message: '', hidden: false };

    const control = controls.find(c => c.feature_key === featureKey);
    if (!control) return { disabled: false, message: '', hidden: false };

    // Admin bypass: if admin_bypass is true and user is admin, skip checks
    if (control.admin_bypass && isAdmin) {
      return { disabled: false, message: '', hidden: false };
    }

    // Check global disable first
    if (control.is_globally_disabled) {
      const hasMessage = control.disabled_message && control.disabled_message.trim() !== '';
      if (hasMessage) {
        return { disabled: true, message: control.disabled_message, hidden: false };
      }
      return { disabled: true, message: '', hidden: true };
    }

    const userPlatform = profile?.source || 'public';
    const isDisabledForUser = control.disabled_platforms.includes(userPlatform);

    if (!isDisabledForUser) return { disabled: false, message: '', hidden: false };

    // Feature is disabled for this platform
    const hasMessage = control.disabled_message && control.disabled_message.trim() !== '';
    if (hasMessage) {
      return { disabled: true, message: control.disabled_message, hidden: false };
    }
    return { disabled: true, message: '', hidden: true };
  };

  return { controls, loading, isFeatureDisabled, refetch: fetchControls };
}
