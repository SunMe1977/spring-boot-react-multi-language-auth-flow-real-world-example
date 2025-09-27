// Placeholder for environment variables. You should ensure these are correctly loaded from your Vite environment.
// For example, if you have a `src/config.ts` or similar:
// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { ACCESS_TOKEN, API_BASE_URL } from '@constants'; // Import ACCESS_TOKEN and API_BASE_URL from constants file


interface RequestOptions extends RequestInit {
  url: string;
  followRedirect?: boolean;
}

const request = async (options: RequestOptions): Promise<any> => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  if (accessToken) {
    headers.append('Authorization', `Bearer ${accessToken}`);
  }

  const { url, followRedirect = false, ...rest } = options;
  const fetchOptions: RequestInit = {
    ...rest,
    headers,
    redirect: followRedirect ? 'follow' : 'manual',
  };

  try {
    const response = await fetch(url, fetchOptions);

    // If we are manually handling redirects (i.e., followRedirect is false)
    if (!followRedirect && response.status >= 300 && response.status < 400 && response.headers.has('Location')) {
      const redirectUrl = response.headers.get('Location');
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return new Promise(() => {}); // Stop further execution
      }
    }

    const responseText = await response.text();
    if (!response.ok) {
      try {
        const json = JSON.parse(responseText);
        return Promise.reject(json);
      } catch (parseError) {
        console.error('Frontend: Failed to parse error response as JSON:', parseError, 'Raw text:', responseText); // More detailed error
        return Promise.reject({ message: responseText || 'Unknown error occurred.' });
      }
    }

    // If response is OK, parse as JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Frontend: Failed to parse successful response as JSON:', parseError, 'Raw text:', responseText); // More detailed error
      if (response.status === 204 || responseText.trim() === '') {
          return {}; // Return an empty object for No Content
      }
      return Promise.reject({ message: 'Failed to parse successful response.' });
    }

  } catch (error) {
    console.error('Frontend: Network or fetch error caught:', error); // NEW: Catch and log network errors
    return Promise.reject(error);
  }
};


export function getCurrentUser(): Promise<any> {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) {
    console.warn('getCurrentUser: No access token found in localStorage.');
    return Promise.reject('No access token set.');
  }
  return request({
    url: `${API_BASE_URL}/user/me`,
    method: 'GET',
  });
}

export function login(loginRequest: Record<string, any>): Promise<any> {
  return request({
    url: `${API_BASE_URL}/auth/login`,
    method: 'POST',
    body: JSON.stringify(loginRequest),
    redirect: 'manual', // Explicitly set to manual
  });
}

export function signup(signupRequest: Record<string, any>): Promise<any> {
  return request({
    url: `${API_BASE_URL}/auth/signup`,
    method: 'POST',
    body: JSON.stringify(signupRequest),
  });
}

export function forgotPassword(email: string): Promise<any> {
  return request({
    url: `${API_BASE_URL}/auth/forgot-password`,
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string): Promise<any> {
  return request({
    url: `${API_BASE_URL}/auth/reset-password`,
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export function updateUserProfile(updateRequest: { name: string; email: string }): Promise<any> {
  return request({
    url: `${API_BASE_URL}/user/me`,
    method: 'PUT',
    body: JSON.stringify(updateRequest),
  });
}

export function requestEmailVerification(): Promise<any> {
  return request({
    url: `${API_BASE_URL}/user/verify-email/request`,
    method: 'POST',
  });
}

export function confirmEmailVerification(token: string): Promise<any> {
  return request({
    url: `${API_BASE_URL}/user/verify-email/confirm?token=${token}`,
    method: 'GET',
  });
}