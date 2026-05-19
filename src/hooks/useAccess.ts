import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

type Feature =
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
  | 'team_members'
  | 'branding_edit'
  | 'analytics_advanced'
  | 'analytics_custom_range'
  | 'analytics_segmentation';

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
    if (role === 'staff') {
      const staffAllowed: Feature[] = [
        'sales',
        'operations',
        'contact',
        'settings_basic',
      ];
      return staffAllowed.includes(feature);
    }

    switch (feature) {
      // All tiers
      case 'sales':
      case 'operations':
      case 'contact':
      case 'settings_basic':
        return true;

      // Growth and Pro
      case 'inventory':
      case 'uploads':
      case 'settings_business':
      case 'branding_edit':
      case 'analytics_advanced':
        return tier === 'growth' || tier === 'pro';

      // Pro only
      case 'customers':
      case 'reports':
      case 'settings_full':
      case 'team_members':
      case 'analytics_custom_range':
      case 'analytics_segmentation':
        return tier === 'pro';

      default:
        return false;
    }
  };

  return { can, role, tier, isOnTrial };
};
