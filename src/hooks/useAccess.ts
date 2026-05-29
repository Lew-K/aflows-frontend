import { useAuth } from '@/contexts/AuthContext';

type Feature =
  | 'sales' | 'inventory' | 'customers' | 'operations' | 'reports'
  | 'uploads' | 'settings_basic' | 'settings_business' | 'settings_full'
  | 'contact' | 'team_members' | 'team_management' | 'branding_edit'
  | 'analytics_advanced' | 'analytics_custom_range' | 'analytics_segmentation';

export const useAccess = () => {
  const { user } = useAuth();
  const role = user?.role || 'owner';

  const isOnTrial =
    user?.subscriptionStatus === 'trialing' &&
    user?.trialEndsAt != null &&
    new Date(user.trialEndsAt) > new Date();

  const tier = isOnTrial ? 'pro' : (user?.subscriptionTier || 'starter');

  const isExpired =
    !isOnTrial &&
    user?.subscriptionStatus !== 'active' &&
    user?.subscriptionStatus !== undefined;

  const can = (feature: Feature): boolean => {
    if (isExpired) return feature === 'settings_basic' || feature === 'contact';

    if (role === 'staff') {
      return ['sales', 'operations', 'contact', 'settings_basic'].includes(feature);
    }

    switch (feature) {
      case 'sales':
      case 'operations':
      case 'contact':
      case 'settings_basic':
      case 'team_members': 
        return true;

      // Growth and Pro
      case 'inventory':
      case 'customers':
      case 'reports':
      case 'settings_business':
      case 'branding_edit':
      case 'analytics_advanced':
        return tier === 'growth' || tier === 'pro';

      // Pro only
      case 'uploads':
      case 'team_management':
      case 'settings_full':
      case 'analytics_custom_range':
      case 'analytics_segmentation':
        return tier === 'pro';

      default:
        return false;
    }
  };

  return { can, role, tier, isOnTrial, isExpired };
};



// import { useAuth } from '@/contexts/AuthContext';

// type Feature =
//   | 'sales'
//   | 'inventory'
//   | 'customers'
//   | 'operations'
//   | 'reports'
//   | 'uploads'
//   | 'settings_basic'
//   | 'settings_business'
//   | 'settings_full'
//   | 'contact'
//   | 'team_members'
//   | 'team_management'
//   | 'branding_edit'
//   | 'analytics_advanced'
//   | 'analytics_custom_range'
//   | 'analytics_segmentation';

// export const useAccess = () => {
//   const { user } = useAuth();

//   const role = user?.role || 'owner';

//   const isOnTrial =
//     user?.subscriptionStatus === 'trialing' &&
//     user?.trialEndsAt != null &&
//     new Date(user.trialEndsAt) > new Date();

//   const tier = isOnTrial
//     ? 'pro'
//     : (user?.subscriptionTier || 'starter');

//   const can = (feature: Feature): boolean => {
//     if (role === 'staff') {
//       const staffAllowed: Feature[] = [
//         'sales',
//         'operations',
//         'contact',
//         'settings_basic',
//       ];
//       return staffAllowed.includes(feature);
//     }

//     switch (feature) {
//       // All tiers
//       case 'sales':
//       case 'operations':
//       case 'contact':
//       case 'settings_basic':
//         return true;

//       // Growth and Pro
//       case 'inventory':
//       case 'settings_business':
//       case 'branding_edit':
//       case 'analytics_advanced':
//         return tier === 'growth' || tier === 'pro';

//       // Pro only
//       case 'uploads':
//       case 'customers':
//       case 'reports':
//       case 'settings_full':
//       case 'team_members':
//       case 'team_management':
//       case 'analytics_custom_range':
//       case 'analytics_segmentation':
//         return tier === 'pro';

//       default:
//         return false;
//     }
//   };

//   return { can, role, tier, isOnTrial };
// };
