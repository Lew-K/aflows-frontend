export type SubscriptionTier = "starter" | "growth" | "pro";

export interface AccessControl {
  enabled: boolean;
  mode?: "basic" | "advanced" | "full";
  limit?: number;
}

/* ------------------------------------------------ */
/* PAGE ACCESS                                      */
/* ------------------------------------------------ */

export interface SubscriptionAccess {
  dashboard: AccessControl;
  sales: AccessControl;
  inventory: AccessControl;
  customers: AccessControl;
  expenses: AccessControl;
  analytics: AccessControl;
  settings: AccessControl;
  receipts: AccessControl;
  exports: AccessControl;
  team: AccessControl;
}

/* ------------------------------------------------ */
/* SUBSCRIPTION MATRIX                              */
/* ------------------------------------------------ */

export const subscriptionAccess: Record<
  SubscriptionTier,
  SubscriptionAccess
> = {
  starter: {
    dashboard: {
      enabled: true,
      mode: "basic",
    },

    sales: {
      enabled: true,
    },

    inventory: {
      enabled: false,
    },

    customers: {
      enabled: false,
    },

    expenses: {
      enabled: false,
    },

    analytics: {
      enabled: true,
      mode: "basic",
    },

    settings: {
      enabled: true,
      mode: "basic",
    },

    receipts: {
      enabled: true,
    },

    exports: {
      enabled: false,
    },

    team: {
      enabled: false,
      limit: 0,
    },
  },

  growth: {
    dashboard: {
      enabled: true,
      mode: "advanced",
    },

    sales: {
      enabled: true,
    },

    inventory: {
      enabled: true,
    },

    customers: {
      enabled: true,
    },

    expenses: {
      enabled: true,
    },

    analytics: {
      enabled: true,
      mode: "advanced",
    },

    settings: {
      enabled: true,
      mode: "advanced",
    },

    receipts: {
      enabled: true,
    },

    exports: {
      enabled: true,
      mode: "basic",
    },

    team: {
      enabled: true,
      limit: 2,
    },
  },

  pro: {
    dashboard: {
      enabled: true,
      mode: "full",
    },

    sales: {
      enabled: true,
    },

    inventory: {
      enabled: true,
    },

    customers: {
      enabled: true,
    },

    expenses: {
      enabled: true,
    },

    analytics: {
      enabled: true,
      mode: "full",
    },

    settings: {
      enabled: true,
      mode: "full",
    },

    receipts: {
      enabled: true,
    },

    exports: {
      enabled: true,
      mode: "full",
    },

    team: {
      enabled: true,
      limit: Infinity,
    },
  },
};

/* ------------------------------------------------ */
/* HELPERS                                          */
/* ------------------------------------------------ */

export const getSubscriptionAccess = (
  tier: SubscriptionTier
): SubscriptionAccess => {
  return subscriptionAccess[tier];
};

export const hasPageAccess = (
  tier: SubscriptionTier,
  page: keyof SubscriptionAccess
): boolean => {
  return subscriptionAccess[tier][page].enabled;
};

export const getAccessMode = (
  tier: SubscriptionTier,
  page: keyof SubscriptionAccess
): string | undefined => {
  return subscriptionAccess[tier][page].mode;
};

export const getTeamLimit = (
  tier: SubscriptionTier
): number => {
  return subscriptionAccess[tier].team.limit || 0;
};
