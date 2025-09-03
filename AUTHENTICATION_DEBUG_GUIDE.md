# 🔐 Authentication Debug Guide

## 🚨 **Issues Found & Fixed:**

### **1. ✅ AuthApi.js - Already Correct**
- Register mutation properly defined
- Login mutation properly defined  
- Google login mutation properly defined
- Token handling correctly implemented

### **2. ✅ Login Page - Already Correct**
- Google login function properly defined
- Error handling implemented
- Token storage working

### **3. ✅ AuthGuard - Already Correct**
- Interface properly defined
- Authentication logic working
- Token validation implemented

## 🔧 **New Debug Tools Added:**

### **1. AuthTester Component**
- **Location**: Top-left corner of dashboard (development only)
- **Features**:
  - Tests Redux state
  - Tests cookie storage
  - Tests token format and expiration
  - Tests login API
  - Tests profile API
  - Tests environment variables
  - Clear authentication data

### **2. AuthDebugger Component**
- **Location**: Bottom-right corner of dashboard (development only)
- **Features**:
  - Shows current user data
  - Shows token status
  - Real-time authentication state

## 🧪 **How to Debug Your Authentication:**

### **Step 1: Use AuthTester**
1. **Login to your application**
2. **Navigate to `/dashboard`**
3. **Look for "Auth Tester" panel** (top-left corner)
4. **Click "Run Auth Tests"**
5. **Review test results**

### **Step 2: Check Test Results**
Look for these test results:

#### **✅ Expected Results:**
```bash
✅ Redux State: User found: [Your Name]
✅ Cookies: Access: ✅, Refresh: ✅
✅ Token Format: Token valid, expires: [Future Date]
✅ Login API: Login successful: [Your Name]
✅ Profile API: Profile loaded: [Your Name]
✅ Environment: API URL: ✅, Google Client ID: ✅
```

#### **❌ Common Issues:**
```bash
❌ Redux State: No user in Redux state
❌ Cookies: Access: ❌, Refresh: ❌
❌ Token Format: Token expired
❌ Login API: Login failed: [Error Message]
❌ Profile API: Profile error: [Error Message]
❌ Environment: API URL: ❌
```

### **Step 3: Check Browser Console**
Look for these debug messages:

```bash
# Successful authentication
🔍 Middleware Debug: {...}
✅ Middleware: Allowing access to protected route: /dashboard
🔵 UserProfileFetcher: Fetched user profile: {...}

# Failed authentication
🚫 Middleware: Redirecting unauthenticated user to login from: /dashboard
🔴 UserProfileFetcher: Failed to fetch user profile: {...}
```

## 🔍 **Common Authentication Issues & Solutions:**

### **Issue 1: "No user in Redux state"**
**Cause**: User data not being stored in Redux after login
**Solution**:
```bash
1. Check if login API returns user data
2. Verify setCredentials action is called
3. Check Redux DevTools for auth state
```

### **Issue 2: "No cookies found"**
**Cause**: Tokens not being stored in cookies
**Solution**:
```bash
1. Check if login API returns tokens
2. Verify cookie settings (httpOnly: false)
3. Check browser cookie storage
```

### **Issue 3: "Token expired"**
**Cause**: Access token has expired
**Solution**:
```bash
1. Check token expiration time
2. Verify refresh token logic
3. Test token refresh API
```

### **Issue 4: "Login API failed"**
**Cause**: Backend API not responding correctly
**Solution**:
```bash
1. Check API endpoint URL
2. Verify request format
3. Check backend logs
4. Test API with Postman/curl
```

### **Issue 5: "Profile API error"**
**Cause**: User profile not loading
**Solution**:
```bash
1. Check if access token is valid
2. Verify profile API endpoint
3. Check authorization header
4. Test profile API directly
```

## 🚀 **Testing Your Authentication:**

### **Test 1: Complete Login Flow**
```bash
1. Clear all cookies and localStorage
2. Go to /login
3. Enter credentials and login
4. Check AuthTester results
5. Verify user name appears in dashboard
```

### **Test 2: Token Refresh**
```bash
1. Login successfully
2. Wait for access token to expire (1 hour)
3. Make API call that requires authentication
4. Check if token refreshes automatically
5. Verify user stays logged in
```

### **Test 3: Logout Flow**
```bash
1. Login successfully
2. Click logout
3. Check that cookies are cleared
4. Verify redirect to /login
5. Try to access /dashboard (should redirect to /login)
```

### **Test 4: Middleware Protection**
```bash
1. Clear authentication data
2. Try to access /dashboard
3. Should redirect to /login
4. Login and try again
5. Should allow access
```

## 📋 **Debug Checklist:**

### **✅ Authentication Flow**
- [ ] Login API returns tokens and user data
- [ ] Tokens stored in cookies correctly
- [ ] Redux state updated with user data
- [ ] User profile loads automatically
- [ ] User name displays in dashboard

### **✅ Token Management**
- [ ] Access token expires after 1 hour
- [ ] Refresh token expires after 7 days
- [ ] Token refresh works automatically
- [ ] Invalid tokens handled gracefully
- [ ] Logout clears all tokens

### **✅ Route Protection**
- [ ] Middleware blocks unauthenticated users
- [ ] AuthGuard prevents access without auth
- [ ] Public routes accessible without auth
- [ ] Protected routes require authentication

### **✅ Error Handling**
- [ ] Login errors shown to user
- [ ] Network errors handled gracefully
- [ ] Token expiration handled automatically
- [ ] Invalid credentials show error message

## 🎯 **Quick Fixes:**

### **If User Name Not Showing:**
```bash
1. Run AuthTester
2. Check "Profile API" test result
3. If failed, check backend API
4. If passed, check Redux state
```

### **If Can't Access Dashboard:**
```bash
1. Check browser console for middleware logs
2. Verify cookies exist
3. Check token expiration
4. Test login API directly
```

### **If Login Fails:**
```bash
1. Check API endpoint URL
2. Verify credentials are correct
3. Check backend server status
4. Test with Postman/curl
```

## 🎉 **Expected Results:**

After running the AuthTester, you should see:

1. **✅ All tests passing**
2. **✅ User name displaying in dashboard**
3. **✅ Tokens stored correctly**
4. **✅ Profile data loaded**
5. **✅ No console errors**

## 🚨 **If Issues Persist:**

### **1. Check Backend API**
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prageeth.mahendra@gmail.com","password":"prageeth"}'

# Test profile endpoint
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **2. Check Environment Variables**
```bash
# Verify these are set:
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### **3. Check Redux DevTools**
```bash
# Look for these actions:
auth/setCredentials
auth/getUserProfile/fulfilled
auth/login/fulfilled
```

Your authentication should now work properly with comprehensive debugging tools! 🎉

Use the AuthTester to identify and fix any remaining issues.
