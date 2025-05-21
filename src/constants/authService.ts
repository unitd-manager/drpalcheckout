export const getAccessToken = () => {
  return localStorage.getItem("zoho_access_token");
};

export const setAccessToken = (token: any) => {
  localStorage.setItem("zoho_access_token", token);
};

export const getRefreshToken = () => {
  return localStorage.getItem("zoho_refresh_token");
};

export const setRefreshToken = (token: any) => {
  localStorage.setItem("zoho_refresh_token", token);
};

export const clearTokens = () => {
  localStorage.removeItem("zoho_access_token");
  localStorage.removeItem("zoho_refresh_token");
};
