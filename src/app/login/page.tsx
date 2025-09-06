'use client';

import React, { useState, useEffect } from 'react';
import { useLoginMutation, useGoogleLoginMutation, useForgotPasswordMutation } from '../../../lib/api/authApi';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/ThemeProvider';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('prageeth.mahendra@gmail.com');
  const [password, setPassword] = useState('prageeth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [login, { isLoading, isSuccess, isError, error }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [forgotPassword, { isLoading: isForgotPasswordLoading }] = useForgotPasswordMutation();
  const router = useRouter();
  const { theme } = useTheme();

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword({ email: forgotPasswordEmail }).unwrap();
      toast.success('Password reset link sent to your email!');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.status === 404) {
        errorMessage = 'No account found with this email address.';
      } else if (err?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      toast.error(errorMessage);
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

      {/* Dark themed login card */}
      <div className="p-8 w-full max-w-md relative z-10 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Login</h2>
        
        {/* Error Message Display */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 text-red-300 rounded-lg backdrop-blur-sm">
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
                if (loginError) setLoginError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-1">
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
                if (loginError) setLoginError(null); // Clear error when user starts typing
              }}
              required
              disabled={isSubmitting || isLoading}
              placeholder="Enter your password"
            />
          </div>
          
          {/* Forgot Password Link */}
          <div className="mb-5 text-right">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotPasswordEmail(email); // Pre-fill with current email
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              disabled={isSubmitting || isLoading}
            >
              Forgot your password?
            </button>
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
              {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
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
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-gray-700/50"
                disabled={isForgotPasswordLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-300 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword}>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="forgot-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  className="w-full py-3 px-4 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isForgotPasswordLoading}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                  }}
                  className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                  disabled={isForgotPasswordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 ${
                    isForgotPasswordLoading
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                  disabled={isForgotPasswordLoading}
                >
                  {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
