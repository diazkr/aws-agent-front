'use client';

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
  hasRole: (role: string) => boolean;
  isAuthorized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  keycloak: null,
  authenticated: false,
  loading: true,
  userInfo: null,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  isAuthorized: false,
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
  const [isAuthorized, setIsAuthorized] = useState(false);

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

          const hasRole = info.roles?.includes('cost-user') || false;
          setIsAuthorized(hasRole);
        }

        setLoading(false);

        keycloakInstance.onTokenExpired = () => {
          keycloakInstance
            .updateToken(30)
            .catch(() => {
              keycloakInstance.logout();
            });
        };

        keycloakInstance.onAuthSuccess = () => {
          setAuthenticated(true);
          const info = getUserInfo();

          setUserInfo({
            username: info.username,
            email: info.email,
            name: info.name,
            roles: info.roles,
          });

          const hasRole = info.roles?.includes('cost-user') || false;
          setIsAuthorized(hasRole);
        };

        keycloakInstance.onAuthError = () => {
          setAuthenticated(false);
          setUserInfo(null);
          setIsAuthorized(false);
        };

        keycloakInstance.onAuthLogout = () => {
          setAuthenticated(false);
          setUserInfo(null);
          setIsAuthorized(false);
        };

      } catch {
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

  const hasRole = (role: string): boolean => {
    return userInfo?.roles?.includes(role) || false;
  };

  const value: AuthContextType = {
    keycloak,
    authenticated,
    loading,
    userInfo,
    login,
    logout,
    token: keycloak?.token,
    hasRole,
    isAuthorized,
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

  if (authenticated && !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have the required permissions to access this application.
          </p>
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Required role:</span> <span className="font-mono text-red-600">cost-user</span>
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Your roles:</span>
              <span className="font-mono ml-1">
                {userInfo?.roles && userInfo.roles.length > 0
                  ? userInfo.roles.join(', ')
                  : 'None'}
              </span>
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Please contact your administrator to request the &apos;cost-user&apos; role.
          </p>
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
