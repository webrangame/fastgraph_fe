'use client';

import React, { useState, useEffect } from 'react';
import { useLoginMutation, useGoogleLoginMutation } from '../../../lib/api/authApi';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import Cookies from 'js-cookie';

const LoginPage = () => {
  const [email, setEmail] = useState('itranga@gmail.com');
  const [password, setPassword] = useState('it@371Ananda');
  const [login, { isLoading, isSuccess, isError, error }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);

  // Redirect if user is already authenticated
  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    
    if (user || accessToken || refreshToken) {
      router.replace('/dashboard');
    }
  }, [user, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      // Redirect to dashboard after successful login
      router.replace('/dashboard');
    } catch (err) {
      console.error('Failed to login:', err);
    }
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
              // Redirect to dashboard after successful Google login
              router.replace('/dashboard');
            } catch (err) {
              console.error('Google login failed:', err);
            }
          },
        });
        
        // Trigger the Google sign-in prompt
        window.google.accounts.id.prompt();
      } else {
        console.error('Google OAuth not loaded');
      }
    } catch (err) {
      console.error('Failed to initialize Google login:', err);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          {isError && (
            <p className="text-red-500 text-xs italic mt-4">
              Login failed. Please check your credentials.
            </p>
          )}
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
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
