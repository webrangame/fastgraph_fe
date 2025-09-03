# 🔐 Token Expiration Handling Guide

## 🎯 **Problem Solved:**
Fixed token expiration handling to automatically redirect users to login page when tokens expire.

## ✅ **Fixes Applied:**

### **1. Enhanced API Token Refresh Logic**
```javascript
// lib/api/authApi.js - baseQueryWithRefresh
- Added proper token expiration detection
- Automatic redirect to login when refresh fails
- Consistent cookie settings (httpOnly: false)
- Better error logging and debugging
```

### **2. Improved UserProfileFetcher**
```typescript
// src/components/auth/UserProfileFetcher.tsx
- Added token validation before fetching profile
- Automatic redirect on authentication errors
- Better error handling for 401, FETCH_ERROR, PARSING_ERROR
```

### **3. Enhanced Middleware Token Validation**
```typescript
// middleware.ts
- Added JWT token expiration checking
- Proper base64 decoding for JWT payload
- Better logging for token validation
- Handles both access and refresh tokens
```

### **4. Created Token Utility Functions**
```typescript
// src/utils/tokenUtils.ts
- parseJWT(): Parse JWT token and return payload
- isTokenExpired(): Check if token is expired
- isTokenExpiringSoon(): Check if token expires within X minutes
- getTokenTimeUntilExpiry(): Get seconds until expiry
- hasValidTokens(): Check if user has valid tokens
- redirectToLogin(): Redirect to login page
```

## 🔄 **Token Expiration Flow:**

### **1. Access Token Expired**
```
1. API call returns 401 Unauthorized
2. baseQueryWithRefresh detects 401
3. Attempts to refresh using refresh token
4. If refresh succeeds: Continue with new tokens
5. If refresh fails: Clear tokens + redirect to login
```

### **2. No Refresh Token**
```
1. API call returns 401 Unauthorized
2. No refresh token available
3. Clear all tokens immediately
4. Redirect to login page
```

### **3. Middleware Protection**
```
1. User visits protected route
2. Middleware checks access token expiration
3. If expired but refresh token exists: Allow (API will handle refresh)
4. If no valid tokens: Redirect to login
```

## 🚀 **How to Test Token Expiration:**

### **1. Test Access Token Expiration**
```bash
# 1. Login to get tokens
# 2. Wait for access token to expire (1 hour)
# 3. Try to access /dashboard
# 4. Should automatically refresh and continue
```

### **2. Test Refresh Token Expiration**
```bash
# 1. Login to get tokens
# 2. Wait for refresh token to expire (7 days)
# 3. Try to access /dashboard
# 4. Should redirect to login page
```

### **3. Test Invalid Tokens**
```bash
# 1. Manually clear cookies in browser
# 2. Try to access /dashboard
# 3. Should redirect to login page
```

## 🔍 **Debug Token Issues:**

### **1. Check Browser Console**
```bash
# Look for these messages:
🔄 Token expired, attempting refresh...
✅ Token refreshed successfully
❌ Token refresh failed, redirecting to login...
❌ No refresh token available, redirecting to login...
```

### **2. Check Network Tab**
```bash
# Look for these API calls:
POST /api/v1/auth/refresh (when token expires)
GET /api/v1/auth/profile (after refresh)
```

### **3. Check Cookies**
```bash
# Verify these cookies exist:
access_token (expires in 1 hour)
refresh_token (expires in 7 days)
```

## 🛠️ **Token Configuration:**

### **Access Token**
- **Expiry**: 1 hour
- **Usage**: API authentication
- **Refresh**: Automatic when expired

### **Refresh Token**
- **Expiry**: 7 days
- **Usage**: Get new access tokens
- **Refresh**: On successful login

### **Cookie Settings**
```javascript
{
  httpOnly: false,        // Must be false for client-side access
  secure: production,     // HTTPS in production
  sameSite: 'strict',     // CSRF protection
  expires: calculated     // Based on token expiry
}
```

## 🎉 **Benefits:**

1. **✅ Automatic Token Refresh** - Users don't get logged out unexpectedly
2. **✅ Secure Token Validation** - Proper JWT expiration checking
3. **✅ Graceful Error Handling** - Clear error messages and redirects
4. **✅ Better User Experience** - Seamless authentication flow
5. **✅ Debug-Friendly** - Comprehensive logging for troubleshooting

## 🚨 **Important Notes:**

1. **Access tokens expire in 1 hour** - Users will need refresh every hour
2. **Refresh tokens expire in 7 days** - Users need to login weekly
3. **All redirects go to `/login`** - Ensure login page exists
4. **Tokens are stored in cookies** - Not localStorage for security
5. **Middleware runs on every request** - Performance impact is minimal

Your token expiration handling is now robust and user-friendly! 🎉
