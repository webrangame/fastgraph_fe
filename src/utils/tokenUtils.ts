/**
 * Token utility functions for authentication
 */

export interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: any;
}

/**
 * Parse JWT token and return payload
 */
export function parseJWT(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTime;
}

/**
 * Check if token will expire within the next 5 minutes
 */
export function isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
  const payload = parseJWT(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const thresholdTime = currentTime + (minutesThreshold * 60);
  return payload.exp <= thresholdTime;
}

/**
 * Get time until token expires in seconds
 */
export function getTokenTimeUntilExpiry(token: string): number {
  const payload = parseJWT(token);
  if (!payload) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - currentTime);
}

/**
 * Check if user has valid authentication tokens
 */
export function hasValidTokens(): boolean {
  if (typeof window === 'undefined') return false;
  
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];
    
  const refreshToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('refresh_token='))
    ?.split('=')[1];

  // If we have an access token, check if it's valid
  if (accessToken) {
    return !isTokenExpired(accessToken);
  }
  
  // If we only have refresh token, consider it valid (API will handle refresh)
  return !!refreshToken;
}

/**
 * Redirect to login page
 */
export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    console.log('🚫 Redirecting to login page...');
    window.location.href = '/login';
  }
}
