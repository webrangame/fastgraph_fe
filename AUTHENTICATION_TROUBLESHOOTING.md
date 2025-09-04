# 🔐 Authentication Troubleshooting Guide

## 🎯 **Issue: Can access `/dashboard` but can't see user first name**

### **Root Cause Analysis:**

The issue was that while the middleware was correctly checking for authentication tokens, the user profile data wasn't being fetched and stored in Redux state when the dashboard loaded.

## ✅ **Fixes Applied:**

### **1. Added AuthGuard to Dashboard Layout**
```tsx
// src/app/dashboard/layout.tsx
import AuthGuard from '@/components/auth/AuthGuard';

return (
  <AuthGuard>
    {/* Dashboard content */}
  </AuthGuard>
);
```

### **2. Created UserProfileFetcher Component**
```tsx
// src/components/auth/UserProfileFetcher.tsx
- Automatically fetches user profile when dashboard loads
- Only fetches if tokens exist but user data is missing
- Updates Redux state with user information
```

### **3. Added AuthDebugger Component**
```tsx
// src/components/auth/AuthDebugger.tsx
- Shows real-time authentication status in development
- Displays user data, tokens, and debug information
- Only visible in development mode
```

### **4. Fixed Auth Slice Syntax**
```js
// redux/slice/authSlice.js
- Fixed missing closing parentheses and brackets
- Properly handles getUserProfile API responses
- Correctly updates user state
```

## 🔍 **How to Debug Authentication Issues:**

### **1. Check Browser Console**
```bash
# Look for these debug messages:
🔵 UserProfileFetcher: Fetched user profile: {...}
🔴 UserProfileFetcher: Failed to fetch user profile: {...}
```

### **2. Use AuthDebugger (Development Only)**
- Look for the debug panel in bottom-right corner
- Check if user data is present
- Verify tokens are available

### **3. Check Network Tab**
```bash
# Look for these API calls:
GET /api/v1/auth/profile
POST /api/v1/auth/refresh
```

### **4. Check Redux DevTools**
```bash
# Look for these actions:
auth/getUserProfile/fulfilled
auth/setCredentials
```

## 🚀 **Authentication Flow:**

### **1. User Visits Dashboard**
```
1. Middleware checks for tokens ✅
2. AuthGuard validates authentication ✅
3. UserProfileFetcher checks if user data exists
4. If missing, fetches from /api/v1/auth/profile
5. Updates Redux state with user data
6. Dashboard displays user information
```

### **2. Token Management**
```
- Access Token: 1 hour expiry
- Refresh Token: 7 days expiry
- Automatic refresh on 401 responses
- Secure cookie storage
```

## 🛠️ **Common Issues & Solutions:**

### **Issue 1: User data not showing**
```bash
# Check if getUserProfile API is working:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/auth/profile
```

### **Issue 2: Tokens not persisting**
```bash
# Check cookie settings:
- httpOnly: false (for access_token)
- secure: true (in production)
- sameSite: 'strict'
```

### **Issue 3: Redux state not updating**
```bash
# Check if auth slice is properly configured:
- getUserProfile.matchFulfilled matcher
- setCredentials action
- selectCurrentUser selector
```

## 📋 **Testing Checklist:**

### **✅ Authentication Flow**
- [ ] Can access `/dashboard` with valid tokens
- [ ] Redirected to `/login` without tokens
- [ ] User profile data loads automatically
- [ ] User first name displays correctly
- [ ] Logout clears all data

### **✅ Token Management**
- [ ] Access token refreshes automatically
- [ ] Refresh token persists across sessions
- [ ] Tokens cleared on logout
- [ ] 401 responses trigger refresh

### **✅ User Data Display**
- [ ] User avatar shows initials
- [ ] User full name displays
- [ ] User email available (if needed)
- [ ] Profile data updates correctly

## 🔧 **Manual Testing Commands:**

### **1. Check Authentication Status**
```javascript
// In browser console:
console.log('User:', window.__REDUX_STORE__.getState().auth.user);
console.log('Tokens:', document.cookie);
```

### **2. Test API Endpoints**
```bash
# Test profile endpoint:
curl -X GET http://localhost:3000/api/v1/auth/profile \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Test refresh endpoint:
curl -X POST http://localhost:3000/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

### **3. Clear Authentication State**
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

## 🎉 **Expected Results:**

After applying these fixes:

1. **✅ Dashboard Access**: Users can access `/dashboard` with valid tokens
2. **✅ User Data Display**: User first name and avatar show correctly
3. **✅ Automatic Profile Fetching**: User profile loads automatically
4. **✅ Debug Information**: Development debugger shows authentication status
5. **✅ Proper Error Handling**: Clear error messages for authentication issues

## 🚨 **If Issues Persist:**

### **1. Check Backend API**
```bash
# Verify these endpoints work:
- POST /api/v1/auth/login
- GET /api/v1/auth/profile
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
```

### **2. Check CORS Settings**
```bash
# Ensure frontend domain is allowed:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

### **3. Check Cookie Settings**
```bash
# Verify cookie configuration:
- Domain: correct domain
- Path: /
- Secure: true (production)
- SameSite: strict
```

The authentication system should now work correctly with user data displaying properly in the dashboard! 🎉
