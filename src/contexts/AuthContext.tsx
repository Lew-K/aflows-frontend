import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface User {
  businessId: string;
  businessName: string;
  ownerName: string;
  email: string;
  role: 'owner' | 'staff';
  staffId?: string;
  mustChangePassword?: boolean;
  subscriptionTier?: 'starter' | 'growth' | 'pro';
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: any) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'aflows_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const INACTIVITY_LIMIT = 3 * 60 * 60 * 1000; // 3 hours

  // ✅ Restore session on load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  // ✅ Multi-tab logout listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_KEY && e.newValue === null) {
        setUser(null);
        window.location.replace("/login?reason=session-expired");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = async () => {
    try {
      await fetch('https://api.aflows.uk/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
    } catch {
      // even if the request fails, clear local state
    }

    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Inactivity timer
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      lastActivity.current = Date.now();
    };

    const checkInterval = setInterval(() => {
      if (Date.now() - lastActivity.current > INACTIVITY_LIMIT) {
        logout();
      }
    }, 60000);

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll", "visibilitychange"];

    events.forEach(event =>
      window.addEventListener(event, updateActivity)
    );

    return () => {
      clearInterval(checkInterval);
      events.forEach(event =>
        window.removeEventListener(event, updateActivity)
      );
    };
  }, [user]);

  const login = (newUser: any) => {
    const normalized: User = {
      businessId: newUser.businessId,
      businessName: newUser.businessName,
      ownerName: newUser.ownerName,
      email: newUser.email,
      role: newUser.role || 'owner',
      staffId: newUser.staffId,
      mustChangePassword: newUser.mustChangePassword,
      subscriptionTier: newUser.subscriptionTier || newUser.subscription_tier,
      subscriptionStatus: newUser.subscriptionStatus || newUser.subscription_status,
      trialEndsAt: newUser.trialEndsAt || newUser.trial_ends_at,
      currentPeriodEnd: newUser.currentPeriodEnd || newUser.current_period_end,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    setUser(normalized);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

// interface User {
//   businessId: string;
//   businessName: string;
//   ownerName: string;
//   email: string;
//   role: 'owner' | 'staff';
//   staffId?: string;
//   mustChangePassword?: boolean;
//   subscriptionTier?: 'starter' | 'growth' | 'pro';
//   subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
//   trialEndsAt?: string | null;
//   currentPeriodEnd?: string | null; // ADD THIS
// }

// interface AuthContextType {
//   user: User | null;
//   accessToken: string | null;
//   refreshToken: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (accessToken: string, refreshToken: string, user: any) => void;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const ACCESS_TOKEN_KEY = 'access_token';
// const REFRESH_TOKEN_KEY = 'refresh_token';
// const USER_KEY = 'aflows_user';

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [refreshToken, setRefreshToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const inactivityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // const INACTIVITY_LIMIT = 10 * 1000; // 10 seconds for testing

  
//   const INACTIVITY_LIMIT = 3 * 60 * 60 * 1000; // 3 hours

//   // ✅ 1️⃣ Restore session on load
//   useEffect(() => {
//     const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
//     const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
//     const storedUser = localStorage.getItem(USER_KEY);

//     if (storedAccess && storedRefresh && storedUser) {
//       try {
//         setAccessToken(storedAccess);
//         setRefreshToken(storedRefresh);
//         setUser(JSON.parse(storedUser));
//       } catch {
//         localStorage.removeItem(ACCESS_TOKEN_KEY);
//         localStorage.removeItem(REFRESH_TOKEN_KEY);
//         localStorage.removeItem(USER_KEY);
//       }
//     }

//     setIsLoading(false);
//   }, []);

//   // ✅ 3️⃣ Multi-tab logout listener
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key === "access_token" && e.newValue === null) {
//         setAccessToken(null);
//         setRefreshToken(null);
//         setUser(null);
//         window.location.replace("/login?reason=session-expired");
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   const logout = () => {
//     localStorage.removeItem(ACCESS_TOKEN_KEY);
//     localStorage.removeItem(REFRESH_TOKEN_KEY);
//     localStorage.removeItem(USER_KEY);

//     setAccessToken(null);
//     setRefreshToken(null);
//     setUser(null);
//   };

//   // ✅ 2️⃣ Inactivity timer (separate hook)
//   const lastActivity = useRef(Date.now());

//   useEffect(() => {
//     if (!accessToken) return;
  
//     const updateActivity = () => {
//       lastActivity.current = Date.now();
//     };
  
//     const checkInterval = setInterval(() => {
//       if (Date.now() - lastActivity.current > INACTIVITY_LIMIT) {
//         logout();
//       }
//     }, 60000); // check every minute ( return to 60000 once done with test)
  
//     const events = ["mousemove", "keydown", "click", "touchstart", "scroll", "visibilitychange"];
  
//     events.forEach(event =>
//       window.addEventListener(event, updateActivity)
//     );
  
//     return () => {
//       clearInterval(checkInterval);
//       events.forEach(event =>
//         window.removeEventListener(event, updateActivity)
//       );
//     };
//   }, [accessToken]);

//   // ✅ 4️⃣ Silent token refresh — runs 1 minute before access token expires
// useEffect(() => {
//   if (!accessToken || !refreshToken) return;

//   try {
//     // Decode the JWT payload (middle part, base64 encoded)
//     const payload = JSON.parse(atob(accessToken.split('.')[1]));
//     const expiresAt = payload.exp * 1000; // JWT exp is in seconds, convert to ms
//     const refreshAt = expiresAt - 60 * 1000; // refresh 1 minute before expiry
//     const delay = refreshAt - Date.now();

//     if (delay <= 0) return; // token already expired or about to

//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch('https://api.aflows.uk/api/v1/auth/refresh', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ refresh_token: refreshToken }),
//         });

//         const data = await res.json();

//         if (data.success && data.access_token && data.refresh_token) {
//           localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
//           localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
//           setAccessToken(data.access_token);
//           setRefreshToken(data.refresh_token);
//         } else {
//           logout();
//         }
//       } catch {
//         logout();
//       }
//     }, delay);

//     return () => clearTimeout(timer);
//   } catch {
//     // Invalid token format — ignore
//   }
// }, [accessToken]);

  
//   const login = async (newAccessToken: string, newRefreshToken: string, newUser: any) => {
//     const normalized: User = {
//       businessId: newUser.businessId,
//       businessName: newUser.businessName,
//       ownerName: newUser.ownerName,
//       email: newUser.email,
//       role: newUser.role || 'owner',
//       staffId: newUser.staffId,
//       mustChangePassword: newUser.mustChangePassword,
//       subscriptionTier: newUser.subscriptionTier || newUser.subscription_tier,
//       subscriptionStatus: newUser.subscriptionStatus || newUser.subscription_status,
//       trialEndsAt: newUser.trialEndsAt || newUser.trial_ends_at,
//       currentPeriodEnd: newUser.currentPeriodEnd || newUser.current_period_end,
//     };
//     localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
//     localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
//     localStorage.setItem(USER_KEY, JSON.stringify(normalized));
//     setAccessToken(newAccessToken);
//     setRefreshToken(newRefreshToken);
//     setUser(normalized);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         accessToken,
//         refreshToken,
//         isAuthenticated: !!accessToken,
//         isLoading,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };
