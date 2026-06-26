import { useAuth } from '@/contexts/AuthContext';

import { hasPageAccess, SubscriptionTier } from '@/lib/subscriptionAccess';

type Feature =
  | 'sales' | 'inventory' | 'customers' | 'operations' | 'reports'
  | 'uploads' | 'settings_basic' | 'settings_business' | 'settings_full'
  | 'contact' | 'team_members' | 'team_management' | 'branding_edit'
  | 'analytics_advanced' | 'analytics_custom_range' | 'analytics_segmentation';

export const useAccess = () => {
  const { user } = useAuth();
  const role = user?.role || 'owner';
  const isStaff = !!user?.staffId; // true for manager, cashier, staff — any non-owner role

  const isOnTrial =
    user?.subscriptionStatus === 'trialing' &&
    user?.trialEndsAt != null &&
    new Date(user.trialEndsAt) > new Date();

  const tier = (isOnTrial ? 'pro' : (user?.subscriptionTier || 'starter')) as SubscriptionTier;

  const isExpired =
    !isOnTrial &&
    user?.subscriptionStatus !== 'active' &&
    user?.subscriptionStatus !== undefined;

    const can = (feature: Feature): boolean => {
      // 1. Handle expired accounts cleanly
      if (isExpired) {
        return feature === 'settings_basic' || feature === 'contact';
      }
    
      // 2. Handle staff restrictions — capped by role, never exceeding what tier allows
      if (isStaff) {
        const staffFeatures: Record<string, Feature[]> = {
          manager: ['sales', 'operations', 'inventory', 'customers', 'reports', 'analytics_advanced', 'contact'],
          cashier: ['sales', 'operations', 'contact'],
          staff:   ['sales', 'operations', 'contact'], // legacy accounts, until reassigned
        };
        const allowed = staffFeatures[role] || [];
        // Still capped by what the business's tier permits overall
        return allowed.includes(feature) && tierAllowsFeature(feature);
      }

    // const can = (feature: Feature): boolean => {
    //   // 1. Handle expired accounts cleanly
    //   if (isExpired) {
    //     return feature === 'settings_basic' || feature === 'contact';
    //   }
    
    //   // 2. Handle staff role restrictions
    //   if (role === 'staff') {
    //     return ['sales', 'operations', 'contact', 'settings_basic'].includes(feature);
    //   }
    
      // 3. Map your page feature triggers directly to your subscription matrix definitions
      switch (feature) {
        case 'sales':
        case 'operations':
        case 'contact':
          return true; // always available
          
        case 'inventory':
          return hasPageAccess(tier, 'inventory');
          
        case 'customers':
          return tier === 'growth' || tier === 'pro'; // Growth gets customers
          
        case 'operations':
        case 'reports':

        case 'analytics_advanced':
          return tier === 'growth' || tier === 'pro';
        case 'analytics_custom_range':
        case 'analytics_segmentation':
          return tier === 'pro';

        case 'reports':
          return tier === 'growth' || tier === 'pro';
        
        // case 'analytics_advanced':
        // case 'analytics_custom_range':
        // case 'analytics_segmentation':
        //   return hasPageAccess(tier, 'analytics');
    
        case 'team_members':
        case 'team_management':
          return hasPageAccess(tier, 'team');
    
        case 'settings_basic':
        case 'settings_business':
        case 'settings_full':
          return hasPageAccess(tier, 'settings');
    
        case 'branding_edit':
          return tier === 'growth' || tier === 'pro'; // 🟢 Fixed: Explicitly locks Starter out of logo uploads
    
        case 'uploads':
          return tier === 'pro'; 
    
        // 👇 ADD THIS CASE TO MAP EXPORTS TO YOUR MATRIX
        case 'exports' as any: 
          return hasPageAccess(tier, 'exports'); // 🟢 Fixed: Starter returns false, Growth/Pro returns true
    
        default:
          return false;
      }
    };
  return { can, role, isStaff, tier, isOnTrial, isExpired };
};

//   const can = (feature: Feature): boolean => {
//     if (isExpired) return feature === 'settings_basic' || feature === 'contact';

//     if (role === 'staff') {
//       return ['sales', 'operations', 'contact', 'settings_basic'].includes(feature);
//     }

//     switch (feature) {
//       case 'sales':
//       case 'operations':
//       case 'contact':
//       case 'settings_basic':
//       case 'team_members': 
//         return true;

//       // Growth and Pro
//       case 'inventory':
//       case 'customers':
//       case 'reports':
//       case 'settings_business':
//       case 'branding_edit':
//       case 'analytics_advanced':
//         return tier === 'growth' || tier === 'pro';

//       // Pro only
//       case 'uploads':
//       case 'team_management':
//       case 'settings_full':
//       case 'analytics_custom_range':
//       case 'analytics_segmentation':
//         return tier === 'pro';

//       default:
//         return false;
//     }
//   };

//   return { can, role, tier, isOnTrial, isExpired };
// };



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
