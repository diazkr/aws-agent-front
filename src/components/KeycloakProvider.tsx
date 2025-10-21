'use client';

/**
 * Keycloak Authentication Provider for Next.js
 * Manages authentication state and provides auth methods to the app
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';
import { getKeycloakInstance, keycloakInitOptions, getUserInfo } from '@/lib/keycloak';

interface AuthContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  loading: boolean;
  userInfo: {
    username?: string;
    email?: string;
    name?: string;
    roles?: string[];
  } | null;
  login: () => void;
  logout: () => void;
  token?: string;
}

const AuthContext = createContext<AuthContextType>({
  keycloak: null,
  authenticated: false,
  loading: true,
  userInfo: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within KeycloakProvider');
  }
  return context;
};

interface KeycloakProviderProps {
  children: React.ReactNode;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<AuthContextType['userInfo']>(null);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const keycloakInstance = getKeycloakInstance();
        const auth = await keycloakInstance.init(keycloakInitOptions);

        setKeycloak(keycloakInstance);
        setAuthenticated(auth);

        if (auth) {
          const info = getUserInfo();
          setUserInfo({
            username: info.username,
            email: info.email,
            name: info.name,
            roles: info.roles,
          });
        }

        setLoading(false);

        // Setup token refresh
        keycloakInstance.onTokenExpired = () => {
          keycloakInstance
            .updateToken(30)
            .then((refreshed) => {
              if (refreshed) {
                console.log('Token refreshed');
              }
            })
            .catch(() => {
              console.error('Failed to refresh token');
              keycloakInstance.logout();
            });
        };

        // Listen for auth events
        keycloakInstance.onAuthSuccess = () => {
          setAuthenticated(true);
          const info = getUserInfo();
          setUserInfo({
            username: info.username,
            email: info.email,
            name: info.name,
            roles: info.roles,
          });
        };

        keycloakInstance.onAuthError = () => {
          setAuthenticated(false);
          setUserInfo(null);
        };

        keycloakInstance.onAuthLogout = () => {
          setAuthenticated(false);
          setUserInfo(null);
        };

      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        setLoading(false);
      }
    };

    initKeycloak();
  }, []);

  const login = () => {
    keycloak?.login();
  };

  const logout = () => {
    keycloak?.logout({
      redirectUri: window.location.origin,
    });
  };

  const value: AuthContextType = {
    keycloak,
    authenticated,
    loading,
    userInfo,
    login,
    logout,
    token: keycloak?.token,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
