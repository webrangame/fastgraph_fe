'use client';

import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/slice/authSlice';
import Cookies from 'js-cookie';

export default function AuthDebugger() {
  const user = useSelector(selectCurrentUser);
  const accessToken = Cookies.get('access_token');
  const refreshToken = Cookies.get('refresh_token');

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}
        </div>
        <div>
          <strong>Access Token:</strong> {accessToken ? '✅ Present' : '❌ Missing'}
        </div>
        <div>
          <strong>Refresh Token:</strong> {refreshToken ? '✅ Present' : '❌ Missing'}
        </div>
        <div>
          <strong>User Full Name:</strong> {user?.fullName || 'Not available'}
        </div>
        <div>
          <strong>User Email:</strong> {user?.email || 'Not available'}
        </div>
      </div>
    </div>
  );
}
