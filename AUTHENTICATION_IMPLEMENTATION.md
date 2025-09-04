# Authentication Implementation

This document describes the authentication system implemented in the FastGraph Frontend application.

## Overview

The application now has a comprehensive authentication system that protects all dashboard routes and redirects unauthenticated users to the login page.

## Components

### 1. AuthGuard Component (`src/components/auth/AuthGuard.tsx`)

The `AuthGuard` component is a wrapper that protects routes by checking authentication status. It:

- Checks both Redux state and cookies for authentication tokens
- Redirects unauthenticated users to `/login`
- Shows a loading spinner while checking authentication
- Handles Redux hydration state properly
- Performs periodic token validation (every 5 minutes)

### 2. Protected Routes

All dashboard routes (`/dashboard/*`) are now protected by the `AuthGuard` component, which is applied in the dashboard layout (`src/app/dashboard/layout.tsx`).

### 3. Authentication Flow

#### Login Flow:
1. User visits `/login`
2. If already authenticated, redirected to `/dashboard`
3. User enters credentials or uses Google OAuth
4. On successful authentication, redirected to `/dashboard`
5. Authentication tokens stored in Redux state and cookies

#### Dashboard Access:
1. User visits any dashboard route
2. `AuthGuard` checks authentication status
3. If authenticated, route renders normally
4. If not authenticated, redirected to `/login`

#### Logout Flow:
1. User clicks logout in sidebar
2. Logout API call made
3. Redux state cleared
4. Cookies removed
5. User redirected to `/login`

## Features

### Token Management
- **Access Token**: Short-lived token (1 hour) for API requests
- **Refresh Token**: Long-lived token (7 days) for token renewal
- **Automatic Refresh**: Built-in token refresh logic in the auth API
- **Cookie Storage**: Tokens stored in secure cookies

### Security Features
- **Route Protection**: All dashboard routes require authentication
- **Token Validation**: Periodic checks for token validity
- **Automatic Redirects**: Seamless user experience with proper redirects
- **Hydration Handling**: Proper handling of Redux state hydration

### User Experience
- **Loading States**: Smooth loading transitions during authentication checks
- **Persistent Sessions**: Users stay logged in across browser sessions
- **Responsive Design**: Authentication works on all device sizes

## Implementation Details

### Redux Integration
The authentication state is managed through Redux with the following slice:
- `authSlice.js`: Manages user data, tokens, and authentication status
- `authApi.js`: Handles API calls for login, logout, and token refresh

### Cookie Management
- Uses `js-cookie` library for secure cookie handling
- Tokens stored with appropriate security flags
- Automatic cleanup on logout

### Navigation
- Uses `router.replace()` instead of `router.push()` to prevent back button issues
- Proper handling of authentication state changes
- Seamless redirects between protected and public routes

## Usage

### Adding New Protected Routes
To protect a new route, simply place it under the dashboard directory structure. The `AuthGuard` will automatically protect it.

### Customizing Authentication Logic
Modify the `AuthGuard` component to add custom authentication logic, such as:
- Role-based access control
- Permission checks
- Custom redirect logic

### Testing Authentication
1. Start the development server: `npm run dev`
2. Visit any dashboard route without logging in
3. Should be redirected to `/login`
4. Login with valid credentials
5. Should be redirected to `/dashboard`
6. Dashboard routes should now be accessible

## Security Considerations

- Tokens are stored in secure cookies with appropriate flags
- Automatic token refresh prevents session expiration
- Periodic validation ensures token integrity
- Proper cleanup on logout prevents token persistence
- HTTPS enforcement in production environments

## Troubleshooting

### Common Issues

1. **Infinite Redirect Loop**: Check if authentication state is properly managed
2. **Token Not Persisting**: Verify cookie settings and Redux persistence
3. **Authentication State Mismatch**: Ensure proper hydration handling

### Debug Mode
Enable debug logging by checking browser console for authentication-related messages.

## Future Enhancements

- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Session management dashboard
- Audit logging for authentication events
- Advanced token security features
