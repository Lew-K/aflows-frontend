import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  businessId: string;
  businessName: string;
  ownerName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accesstoken: string | null;
  refreshtoken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'aflows_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);    
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedAccess && storedRefresh && storedUser) {
      try {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Cleanup corrupted data
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (newAccessToken: string, newRefreshToken: string, newUser: User) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);
  };
  
   const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };
  
   return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
