import { authApi } from './api/authApi';

export const apiCall = async (url, options = {}, dispatch, getState, isPublic = false) => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Add Accept header
  };

  let auth = {};
  if (!isPublic && getState && typeof getState === 'function') {
    auth = getState().auth || {};
    if (auth.accessToken) {
      headers.Authorization = `Bearer ${auth.accessToken}`;
    }
  }

  let response = await fetch(url, { ...options, headers });
  console.log('API Response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers),
    url: response.url,
  }, 9999);

  if (!isPublic && response.status === 401 && auth.accessToken && dispatch && typeof dispatch === 'function') {
    try {
      // Use the refreshToken endpoint from authApi
      const refreshResult = await dispatch(authApi.endpoints.refreshToken.initiate(auth.refreshToken)).unwrap();
      if (refreshResult.accessToken) {
        headers.Authorization = `Bearer ${refreshResult.accessToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        throw new Error('Session expired. Please log in again.');
      }
    } catch (error) {
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('API Data:', data, 8888);
  return data;
};