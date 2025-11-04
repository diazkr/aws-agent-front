/**
 * Keycloak configuration and utilities for Next.js frontend
 */
import Keycloak from 'keycloak-js';

// Keycloak configuration
console.log('🔍 NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('🔍 NEXT_PUBLIC_KEYCLOAK_URL:', process.env.NEXT_PUBLIC_KEYCLOAK_URL);
console.log('🔍 NEXT_PUBLIC_KEYCLOAK_REALM:', process.env.NEXT_PUBLIC_KEYCLOAK_REALM);
console.log('🔍 NEXT_PUBLIC_KEYCLOAK_CLIENT_ID:', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID);

export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'aws-cost-realm',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'aws-cost-app',
};

// Initialize Keycloak instance
let keycloakInstance: Keycloak | null = null;

export const getKeycloakInstance = (): Keycloak => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
};

// Keycloak initialization options
export const keycloakInitOptions = {
  onLoad: 'login-required' as const,
  checkLoginIframe: false,
};

// Helper function to get token
export const getToken = (): string | undefined => {
  const keycloak = getKeycloakInstance();
  return keycloak.token;
};

// Helper function to get user info
export const getUserInfo = () => {
  const keycloak = getKeycloakInstance();
  return {
    token: keycloak.token,
    refreshToken: keycloak.refreshToken,
    idToken: keycloak.idToken,
    authenticated: keycloak.authenticated,
    username: keycloak.tokenParsed?.preferred_username,
    email: keycloak.tokenParsed?.email,
    name: keycloak.tokenParsed?.name,
    roles: keycloak.tokenParsed?.realm_access?.roles || [],
  };
};

// Helper function to login
export const login = () => {
  const keycloak = getKeycloakInstance();
  keycloak.login();
};

// Helper function to logout
export const logout = () => {
  const keycloak = getKeycloakInstance();
  keycloak.logout({
    redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
  });
};

// Helper function to check if token needs refresh
export const updateToken = async (minValidity: number = 30): Promise<boolean> => {
  const keycloak = getKeycloakInstance();
  try {
    const refreshed = await keycloak.updateToken(minValidity);
    if (refreshed) {
      console.log('Token refreshed');
    }
    return refreshed;
  } catch (error) {
    console.error('Failed to refresh token', error);
    return false;
  }
};
