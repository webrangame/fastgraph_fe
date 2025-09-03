'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLoginMutation, useGetUserProfileQuery } from '../../../lib/api/authApi';
import { selectCurrentUser } from '../../../redux/slice/authSlice';
import Cookies from 'js-cookie';

export default function AuthTester() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const { data: profileData, error: profileError, isLoading: isProfileLoading } = useGetUserProfileQuery(undefined, {
    skip: !user && !Cookies.get('access_token')
  });

  const addTestResult = (test: string, status: 'pass' | 'fail' | 'info', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAuthTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Test 1: Check Redux state
    addTestResult(
      'Redux State',
      user ? 'pass' : 'fail',
      user ? `User found: ${user.fullName || user.email || 'Unknown'}` : 'No user in Redux state'
    );

    // Test 2: Check cookies
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    addTestResult(
      'Cookies',
      (accessToken || refreshToken) ? 'pass' : 'fail',
      `Access: ${accessToken ? '✅' : '❌'}, Refresh: ${refreshToken ? '✅' : '❌'}`
    );

    // Test 3: Check token format
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const isExpired = payload.exp < Date.now() / 1000;
        addTestResult(
          'Token Format',
          !isExpired ? 'pass' : 'fail',
          `Token ${isExpired ? 'expired' : 'valid'}, expires: ${new Date(payload.exp * 1000).toLocaleString()}`
        );
      } catch (error) {
        addTestResult('Token Format', 'fail', 'Invalid JWT format');
      }
    }

    // Test 4: Test login API
    try {
      addTestResult('Login API', 'info', 'Testing login API...');
      const result = await login({ 
        email: 'prageeth.mahendra@gmail.com', 
        password: 'prageeth' 
      }).unwrap();
      
      if (result.accessToken && result.user) {
        addTestResult('Login API', 'pass', `Login successful: ${result.user.fullName || result.user.email}`);
      } else {
        addTestResult('Login API', 'fail', 'Login response missing tokens or user data');
      }
    } catch (error: any) {
      addTestResult('Login API', 'fail', `Login failed: ${error.message || error.data?.message || 'Unknown error'}`);
    }

    // Test 5: Check profile API
    if (profileData) {
      addTestResult('Profile API', 'pass', `Profile loaded: ${profileData.fullName || profileData.email}`);
    } else if (profileError) {
      let errorMessage = 'Unknown error';
      
      if ('data' in profileError) {
        // FetchBaseQueryError
        errorMessage = (profileError.data as any)?.message || `Status: ${profileError.status}`;
      } else if ('message' in profileError && profileError.message) {
        // SerializedError
        errorMessage = profileError.message;
      } else if ('error' in profileError) {
        // Other error types
        errorMessage = String(profileError.error);
      }
      
      addTestResult('Profile API', 'fail', `Profile error: ${errorMessage}`);
    } else if (isProfileLoading) {
      addTestResult('Profile API', 'info', 'Profile loading...');
    } else {
      addTestResult('Profile API', 'info', 'Profile not attempted (no tokens)');
    }

    // Test 6: Check environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    addTestResult(
      'Environment',
      apiUrl ? 'pass' : 'fail',
      `API URL: ${apiUrl ? '✅' : '❌'}, Google Client ID: ${googleClientId ? '✅' : '❌'}`
    );

    setIsRunning(false);
  };

  const clearAuth = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    dispatch({ type: 'auth/logout' });
    setTestResults([]);
    addTestResult('Clear Auth', 'info', 'Authentication data cleared');
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-lg mb-3">🔧 Auth Tester</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runAuthTests}
          disabled={isRunning}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isRunning ? 'Running Tests...' : 'Run Auth Tests'}
        </button>
        
        <button
          onClick={clearAuth}
          className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
        >
          Clear Auth Data
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className="text-xs mb-1 p-2 rounded" style={{
            backgroundColor: result.status === 'pass' ? '#d4edda' : 
                           result.status === 'fail' ? '#f8d7da' : '#d1ecf1'
          }}>
            <div className="font-semibold">
              {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : 'ℹ️'} {result.test}
            </div>
            <div className="text-gray-600">{result.message}</div>
            <div className="text-gray-400 text-xs">{result.timestamp}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <div>User: {user ? `${user.fullName || user.email}` : 'None'}</div>
        <div>Tokens: {Cookies.get('access_token') ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}
