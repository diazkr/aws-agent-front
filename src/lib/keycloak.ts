import Keycloak from 'keycloak-js';

export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'aws-cost-realm',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'aws-cost-app',
};

let keycloakInstance: Keycloak | null = null;

export const getKeycloakInstance = (): Keycloak => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
};

export const keycloakInitOptions = {
  onLoad: 'login-required' as const,
  checkLoginIframe: false,
};

export const getToken = (): string | undefined => {
  const keycloak = getKeycloakInstance();
  return keycloak.token;
};

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

export const login = () => {
  const keycloak = getKeycloakInstance();
  keycloak.login();
};

export const logout = () => {
  const keycloak = getKeycloakInstance();
  keycloak.logout({
    redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
  });
};

export const updateToken = async (minValidity: number = 30): Promise<boolean> => {
  const keycloak = getKeycloakInstance();
  try {
    const refreshed = await keycloak.updateToken(minValidity);
    return refreshed;
  } catch {
    return false;
  }
};
