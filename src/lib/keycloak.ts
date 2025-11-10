import Keycloak from 'keycloak-js';

export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'master',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'aws-cost-app',
};

console.log('🔧 KEYCLOAK CONFIG DEBUG:');
console.log('Environment variables:');
console.log('- NEXT_PUBLIC_KEYCLOAK_URL:', process.env.NEXT_PUBLIC_KEYCLOAK_URL);
console.log('- NEXT_PUBLIC_KEYCLOAK_REALM:', process.env.NEXT_PUBLIC_KEYCLOAK_REALM);
console.log('- NEXT_PUBLIC_KEYCLOAK_CLIENT_ID:', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID);
console.log('Final config:');
console.log('- URL:', keycloakConfig.url);
console.log('- REALM:', keycloakConfig.realm);
console.log('- CLIENT_ID:', keycloakConfig.clientId);
console.log('Full auth URL will be:', `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`);

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

  const clientRoles = keycloak.tokenParsed?.resource_access?.['aws-cost-app']?.roles || [];
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  const allRoles = [...clientRoles, ...realmRoles];

  return {
    token: keycloak.token,
    refreshToken: keycloak.refreshToken,
    idToken: keycloak.idToken,
    authenticated: keycloak.authenticated,
    username: keycloak.tokenParsed?.preferred_username,
    email: keycloak.tokenParsed?.email,
    name: keycloak.tokenParsed?.name,
    roles: allRoles,
  };
};

export const hasRequiredRole = (requiredRole: string = 'cost-user'): boolean => {
  const keycloak = getKeycloakInstance();
  const clientRoles = keycloak.tokenParsed?.resource_access?.['aws-cost-app']?.roles || [];
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  const allRoles = [...clientRoles, ...realmRoles];
  return allRoles.includes(requiredRole);
};

export const getUserRoles = (): string[] => {
  const keycloak = getKeycloakInstance();
  const clientRoles = keycloak.tokenParsed?.resource_access?.['aws-cost-app']?.roles || [];
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles || [];
  return [...clientRoles, ...realmRoles];
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
