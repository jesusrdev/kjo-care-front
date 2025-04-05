export const environment = {
  production: true,
  apiUrl: import.meta.env.NG_APP_API_URL,
  keycloak: {
    url: import.meta.env.NG_APP_KEYCLOAK_URL,
    realm: import.meta.env.NG_APP_KEYCLOAK_REALM,
    clientId: import.meta.env.NG_APP_KEYCLOAK_CLIENT_ID
  }
};
