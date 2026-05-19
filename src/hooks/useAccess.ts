import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

type Feature =
  | 'dashboard_full'
  | 'dashboard_advanced'
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'operations'
  | 'reports'
  | 'uploads'
  | 'settings_basic'
  | 'settings_business'
  | 'settings_full'
  | 'contact'
  | 'team_members';

export const useAccess = () => {
  const { user } = useAuth();
  const { business } = useData();

  const role = user?.role || 'owner';

  const isOnTrial =
    business?.subscription_status === 'trialing' &&
    business?.trial_ends_at != null &&
    new Date(business.trial_ends_at) > new Date();

  const tier = isOnTrial
    ? 'pro'
    : (business?.subscription_tier || 'starter');

  const can = (feature: Feature): boolean => {
    // Staff access — limited regardless of tier
    if (role === 'staff') {
      const staffAllowed: Feature[] = [
        'sales',
        'operations',
        'contact',
        'dashboard_advanced',
      ];
      return staffAllowed.includes(feature);
    }

    // Owner access — based on tier
    switch (feature) {
      case 'sales':
      case 'operations':
      case 'contact':
      case 'settings_basic':
      case 'dashboard_advanced':
        return true; // all tiers

      case 'inventory':
      case 'customers':
      case 'uploads':
      case 'settings_business':
      case 'dashboard_full':
        return tier === 'growth' || tier === 'pro';

      case 'reports':
      case 'settings_full':
      case 'team_members':
        return tier === 'pro';

      default:
        return false;
    }
  };

  return { can, role, tier, isOnTrial };
};
