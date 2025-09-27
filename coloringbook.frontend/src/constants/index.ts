export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
export const ACCESS_TOKEN = 'accessToken';
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/google`;
export const FACEBOOK_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/facebook`;
export const GITHUB_AUTH_URL = `${API_BASE_URL}/oauth2/authorization/github`;