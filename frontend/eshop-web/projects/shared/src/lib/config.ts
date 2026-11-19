// Gateway in docker-compose. When running from Visual Studio (https profile) use https://localhost:5054
export const API_BASE = 'http://localhost:6004';

export const OIDC = {
  authority: 'http://localhost:8180/realms/eshop',
  clientId: 'eshop-spa',
  // Asked for at login (optional scopes in eshop-realm.json); offline_access gives a refresh token
  scope: 'openid profile email offline_access Basket.ReadWrite Orders.Read Orders.Write Catalog.Write',
};
