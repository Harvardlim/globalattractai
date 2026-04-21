import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type FeaturePackage = 'marketing' | 'numerology' | 'professional_fengshui' | 'real_estate';

const PACKAGE_LABELS: Record<FeaturePackage, string> = {
  marketing: '营销',
  numerology: '数字学',
  professional_fengshui: '专业风水师',
  real_estate: '地产销售',
};

// Which features each package unlocks
const PACKAGE_FEATURES: Record<FeaturePackage, string[]> = {
  marketing: ['sales_chart'],
  numerology: ['numerology'],
  professional_fengshui: ['synastry', 'xiao_liu_ren'],
  real_estate: ['real_estate'],
};

export function useFeaturePackages(userId?: string) {
  const { user, isAdmin, isSuperAdmin, isOwner } = useAuth();
  const targetUserId = userId || user?.id;
  const [packages, setPackages] = useState<FeaturePackage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    if (!targetUserId) { setLoading(false); return; }
    const { data } = await supabase
      .from('user_feature_packages' as any)
      .select('package_key')
      .eq('user_id', targetUserId);
    if (data) setPackages((data as any[]).map(d => d.package_key as FeaturePackage));
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, [targetUserId]);

  const hasPackage = (pkg: FeaturePackage): boolean => {
    if (isOwner || isSuperAdmin) return true;
    return packages.includes(pkg);
  };

  const hasFeature = (featureKey: string): boolean => {
    if (isOwner || isSuperAdmin) return true;
    for (const [pkg, features] of Object.entries(PACKAGE_FEATURES)) {
      if (features.includes(featureKey) && packages.includes(pkg as FeaturePackage)) {
        return true;
      }
    }
    return false;
  };

  // Check if a feature requires a package (i.e. it's gated)
  const isPackageGated = (featureKey: string): boolean => {
    return Object.values(PACKAGE_FEATURES).some(features => features.includes(featureKey));
  };

  return { packages, loading, hasPackage, hasFeature, isPackageGated, refetch: fetchPackages };
}

export { PACKAGE_LABELS, PACKAGE_FEATURES };
