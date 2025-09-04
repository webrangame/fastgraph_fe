'use client';

import React, { useState, useEffect } from 'react';
import { useLoginMutation, useGoogleLoginMutation } from '../../../lib/api/authApi';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('prageeth.mahendra@gmail.com');
  const [password, setPassword] = useState('prageeth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [login, { isLoading, isSuccess, isError, error }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 Form submitted, preventing default behavior');
    console.log('🔵 Event type:', e.type);
    console.log('🔵 Event target:', e.target);
    
    // Prevent any further event propagation
    if (e.nativeEvent) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }
    
    setIsSubmitting(true);
    setLoginError(null); // Clear previous errors
    
    try {
      console.log('🔵 Attempting login with:', { email, password: '***' });
      const result = await login({ email, password }).unwrap();
      console.log('✅ Login successful, redirecting...', result);
      // Redirect to dashboard after successful login
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      
      // Extract specific error message from the API response
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err?.status === 400) {
        errorMessage = 'Please check your email and password format.';
      } else if (err?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }
      
      console.log('🔴 Setting error message:', errorMessage);
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
    
    // Return false to prevent any further form submission
    return false;
  };

  const handleGoogleLogin = async () => {
    try {
      // Initialize Google OAuth when button is clicked
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: any) => {
            try {
              // The response.credential contains the JWT token from Google
              // We need to send this as access_token to match your backend API
              await googleLogin({ access_token: response.credential }).unwrap();
              toast.success('Google login successful! Redirecting to dashboard...');
              // Redirect to dashboard after successful Google login
              router.replace('/dashboard');
            } catch (err) {
              console.error('Google login failed:', err);
              toast.error('Google login failed. Please try again.');
            }
          },
        });
        
        // Trigger the Google sign-in prompt
        window.google.accounts.id.prompt();
      } else {
        console.error('Google OAuth not loaded');
        toast.error('Google OAuth not available. Please try again.');
      }
    } catch (err) {
      console.error('Failed to initialize Google login:', err);
      toast.error('Failed to initialize Google login. Please try again.');
    }
  };

  // Load Google OAuth script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google OAuth script loaded');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Debug: Log component mount
  useEffect(() => {
    console.log('🔵 LoginPage component mounted');
  }, []);

  // Show success toast when login is successful
  useEffect(() => {
    if (isSuccess) {
      toast.success('Login successful!');
    }
  }, [isSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        {/* Error Message Display */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{loginError}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (loginError) setLoginError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (loginError) setLoginError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${
                isSubmitting || isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-700 text-white'
              }`}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-6">
            <GoogleLoginButton
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
              disabled={isSubmitting || isLoading || isGoogleLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
