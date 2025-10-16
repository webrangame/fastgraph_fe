'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    setToken(tokenParam);
    verifyEmail(tokenParam);
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email...');
      
      // Add a small delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🔵 Starting email verification for token:', verificationToken);

      const response = await fetch('/api/v1/auth/verify-email-frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationToken
        }),
      });

      console.log('🔵 API response status:', response.status);

      const data = await response.json();
      console.log('🔵 API response data:', data);

      if (response.ok && data.verified) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        console.log('✅ Email verification successful');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Email verification failed. Please try again.');
        console.log('❌ Email verification failed:', data.message);
      }
    } catch (error) {
      console.error('❌ Email verification error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleRetry = () => {
    if (token) {
      verifyEmail(token);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Dark background with gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-indigo-900/25" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/10 to-purple-800/20" />
      </div>

      {/* Verification card */}
      <div className="p-8 w-full max-w-md relative z-10 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
        
        {/* Loading State */}
        {status === 'loading' && (
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            
            {/* Progress indicator */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            
            <p className="text-sm text-gray-400">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Go to Login
              </button>
              <p className="text-sm text-gray-400">
                You will be automatically redirected in a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Try Again
              </button>
              
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 px-6 rounded-lg transition-all duration-200 border border-gray-600"
              >
                Go to Login
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-200 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-300 mb-2">
                If you're having trouble verifying your email:
              </p>
              <ul className="text-sm text-gray-300 space-y-1 text-left">
                <li>• Check if the verification link is still valid</li>
                <li>• Try requesting a new verification email</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            <Link 
              href="/register" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              Register
            </Link>
            {' • '}
            <Link 
              href="/login" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              Login
            </Link>
            {' • '}
            <Link 
              href="/" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
