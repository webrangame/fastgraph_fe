'use client';

import React, { useState, useEffect } from 'react';
import { useRegisterMutation, useGoogleLoginMutation } from '../../../lib/api/authApi';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/ThemeProvider';
import toast from 'react-hot-toast';
import Link from 'next/link';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [register, { isLoading, isSuccess, isError, error }] = useRegisterMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const router = useRouter();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 Registration form submitted');
    
    // Prevent any further event propagation
    if (e.nativeEvent) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }
    
    setIsSubmitting(true);
    setRegisterError(null); // Clear previous errors
    
    // Validation
    if (!name.trim()) {
      setRegisterError('Name is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!email.trim()) {
      setRegisterError('Email is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!password) {
      setRegisterError('Password is required');
      setIsSubmitting(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRegisterError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('🔵 Attempting registration with:', { name, email, password: '***' });
      const result = await register({ name: name.trim(), email: email.trim(), password }).unwrap();
      console.log('✅ Registration successful, redirecting...', result);
      toast.success('Registration successful! Welcome to FastGraph!');
      // Redirect to dashboard after successful registration
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      
      // Extract specific error message from the API response
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 400) {
        errorMessage = 'Please check your information and try again.';
      } else if (err?.status === 409) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (err?.status === 429) {
        errorMessage = 'Too many registration attempts. Please try again later.';
      }
      
      console.log('🔴 Setting error message:', errorMessage);
      setRegisterError(errorMessage);
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
              toast.success('Google registration successful! Welcome to FastGraph!');
              // Redirect to dashboard after successful Google login
              router.replace('/dashboard');
            } catch (err) {
              console.error('Google registration failed:', err);
              toast.error('Google registration failed. Please try again.');
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
      console.error('Failed to initialize Google registration:', err);
      toast.error('Failed to initialize Google registration. Please try again.');
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
    console.log('🔵 RegisterPage component mounted');
  }, []);

  // Show success toast when registration is successful
  useEffect(() => {
    if (isSuccess) {
      toast.success('Registration successful!');
    }
  }, [isSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Dark background with gradients */}
      <div className="absolute inset-0">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-indigo-900/25" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/10 to-purple-800/20" />
        
        {/* Enhanced dark pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
                             radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.12) 0%, transparent 40%),
                             radial-gradient(circle at 50% 20%, rgba(79, 70, 229, 0.08) 0%, transparent 50%),
                             radial-gradient(circle at 30% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)`
          }}
        />
        
        {/* Subtle noise texture for depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Dark themed registration card */}
      <div className="p-8 w-full max-w-md relative z-10 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Create Account</h2>
        
        {/* Error Message Display */}
        {registerError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 text-red-300 rounded-lg backdrop-blur-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{registerError}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full py-3 px-4 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (registerError) setRegisterError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full py-3 px-4 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (registerError) setRegisterError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full py-3 px-4 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (registerError) setRegisterError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
              placeholder="Enter your password (min 6 characters)"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full py-3 px-4 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (registerError) setRegisterError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`w-full font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 ${
                isSubmitting || isLoading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm'
              }`}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/90 text-gray-400">Or continue with</span>
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

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
