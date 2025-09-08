'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const TestGooglePage = () => {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    // Check if Google OAuth is loaded
    const checkGoogle = () => {
      if (window.google) {
        setGoogleLoaded(true);
        console.log('✅ Google OAuth is loaded');
      } else {
        console.log('❌ Google OAuth not loaded yet');
        setTimeout(checkGoogle, 1000);
      }
    };

    checkGoogle();
    setClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'Not configured');
  }, []);

  const testGoogleLogin = () => {
    if (!window.google) {
      toast.error('Google OAuth not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response: any) => {
        console.log('Google OAuth Response:', response);
        toast.success('Google OAuth test successful!');
        console.log('Credential:', response.credential);
      },
      error_callback: (error: any) => {
        console.error('Google OAuth Error:', error);
        toast.error('Google OAuth test failed');
      }
    });

    window.google.accounts.id.prompt();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google OAuth Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <p><strong>Google OAuth Loaded:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${googleLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {googleLoaded ? 'Yes' : 'No'}
              </span>
            </p>
            <p><strong>Client ID:</strong> 
              <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {clientId}
              </span>
            </p>
            <p><strong>Client ID Valid:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${clientId.includes('apps.googleusercontent.com') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {clientId.includes('apps.googleusercontent.com') ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Google Login</h2>
          <button
            onClick={testGoogleLogin}
            disabled={!googleLoaded}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Google OAuth
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check if Google OAuth is loaded (should be green)</li>
            <li>Verify your Client ID is correct (should end with .apps.googleusercontent.com)</li>
            <li>Click "Test Google OAuth" button</li>
            <li>Check browser console for detailed logs</li>
            <li>If successful, you should see a Google sign-in popup</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestGooglePage;
