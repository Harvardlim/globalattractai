import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Crown, Star, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_CONFIG = {
  owner: { label: 'Owner', icon: Shield, className: 'bg-emerald-600 text-white border-emerald-700' },
  superadmin: { label: 'SuperAdmin', icon: Shield, className: 'bg-purple-600 text-white border-purple-700' },
  admin: { label: 'Admin', icon: Shield, className: 'bg-red-600 text-white border-red-700' },
  vip_plus: { label: '订阅会员', icon: Crown, className: 'bg-amber-500 text-white border-amber-600' },
  subscriber: { label: '订阅会员', icon: Crown, className: 'bg-amber-500 text-white border-amber-600' },
  vip: { label: '订阅会员', icon: Star, className: 'bg-primary text-primary-foreground' },
  normal: { label: '', icon: null, className: '' },
} as const;

export function UserMenu() {
  const { profile, isAdmin, isSuperAdmin, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/profile');
  };

  const tier = profile?.member_tier || 'normal';
  const displayTier = isOwner ? 'owner' : isSuperAdmin ? 'superadmin' : isAdmin ? 'admin' : tier;
  const tierConfig = TIER_CONFIG[displayTier];

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleClick}>
      <User className="h-4 w-4" />
      <span className="max-w-[100px] truncate">
        {profile?.display_name || profile?.email || '用户'}
      </span>
      {displayTier !== 'normal' && tierConfig.icon && (
        <Badge className={cn("ml-1 px-1.5 py-0 text-[10px] gap-0.5", tierConfig.className)}>
          <tierConfig.icon className="h-3 w-3" />
          {tierConfig.label}
        </Badge>
      )}
    </Button>
  );
}
