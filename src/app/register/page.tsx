'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRegisterMutation, useGoogleLoginMutation } from '../../../lib/api/authApi';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/ThemeProvider';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Form validation schemas
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // React Hook Form setup
  const registerForm = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  });

  const [register, { isLoading, isSuccess, isError, error }] = useRegisterMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const router = useRouter();
  const { theme } = useTheme();

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setRegisterError(null); // Clear previous errors
    
    try {
      console.log('🔵 Attempting registration with:', { name: data.name, email: data.email, password: '***' });
      const result = await register({ 
        fullName: data.name.trim(), 
        email: data.email.trim(), 
        password: data.password 
      }).unwrap();
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
    }
  };

  const handleGoogleLogin = () => {
    try {
      console.log('🔵 Starting Google OAuth for registration');
      
      // Use Google's One Tap or redirect flow
      if (window.google && window.google.accounts) {
        // Try One Tap first (more reliable)
        window.google.accounts.id.prompt();
      } else {
        // Direct redirect if Google API not loaded
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
          `scope=${encodeURIComponent('email profile')}&` +
          `response_type=code&` +
          `access_type=offline&` +
          `prompt=select_account`;
      }

    } catch (error) {
      console.error('❌ Google auth failed:', error);
      toast.error('Failed to start Google authentication. Please try again.');
    }
  };

  // Load Google OAuth script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ Google OAuth script loaded for registration');
      // Initialize Google OAuth when script loads
      if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              console.log('🔵 Google OAuth callback received for registration');
              console.log('🔵 Response credential length:', response.credential?.length);
              console.log('🔵 Response credential (first 100 chars):', response.credential?.substring(0, 100));
              
              if (!response.credential) {
                console.error('❌ No credential received from Google');
                toast.error('No authentication token received from Google. Please try again.');
                return;
              }

              console.log('🔵 Sending credential to backend for registration...');
              
              // Try different token formats that backends commonly expect
              try {
                // Format 1: access_token (current)
                console.log('🔵 Trying access_token format...');
                const result = await googleLogin({ access_token: response.credential }).unwrap();
                console.log('✅ Google registration successful with access_token:', result);
                toast.success('Google registration successful! Welcome to FastGraph!');
                router.replace('/dashboard');
                return;
              } catch (accessTokenError) {
                console.log('❌ access_token format failed:', accessTokenError);
                
                // Format 2: id_token (common alternative)
                try {
                  console.log('🔵 Trying id_token format...');
                  const result = await googleLogin({ id_token: response.credential }).unwrap();
                  console.log('✅ Google registration successful with id_token:', result);
                  toast.success('Google registration successful! Welcome to FastGraph!');
                  router.replace('/dashboard');
                  return;
                } catch (idTokenError) {
                  console.log('❌ id_token format failed:', idTokenError);
                  
                  // Format 3: token (generic)
                  try {
                    console.log('🔵 Trying token format...');
                    const result = await googleLogin({ token: response.credential }).unwrap();
                    console.log('✅ Google registration successful with token:', result);
                    toast.success('Google registration successful! Welcome to FastGraph!');
                    router.replace('/dashboard');
                    return;
                  } catch (tokenError) {
                    console.log('❌ token format failed:', tokenError);
                    
                    // Format 4: credential (direct)
                    try {
                      console.log('🔵 Trying credential format...');
                      const result = await googleLogin({ credential: response.credential }).unwrap();
                      console.log('✅ Google registration successful with credential:', result);
                      toast.success('Google registration successful! Welcome to FastGraph!');
                      router.replace('/dashboard');
                      return;
                    } catch (credentialError) {
                      console.log('❌ credential format failed:', credentialError);
                      
                      // Format 5: google_token
                      try {
                        console.log('🔵 Trying google_token format...');
                        const result = await googleLogin({ google_token: response.credential }).unwrap();
                        console.log('✅ Google registration successful with google_token:', result);
                        toast.success('Google registration successful! Welcome to FastGraph!');
                        router.replace('/dashboard');
                        return;
                      } catch (googleTokenError) {
                        console.log('❌ google_token format failed:', googleTokenError);
                        
                        // Format 6: jwt
                        try {
                          console.log('🔵 Trying jwt format...');
                          const result = await googleLogin({ jwt: response.credential }).unwrap();
                          console.log('✅ Google registration successful with jwt:', result);
                          toast.success('Google registration successful! Welcome to FastGraph!');
                          router.replace('/dashboard');
                          return;
                        } catch (jwtError) {
                          console.log('❌ jwt format failed:', jwtError);
                          
                          // Format 7: google_id_token
                          try {
                            console.log('🔵 Trying google_id_token format...');
                            const result = await googleLogin({ google_id_token: response.credential }).unwrap();
                            console.log('✅ Google registration successful with google_id_token:', result);
                            toast.success('Google registration successful! Welcome to FastGraph!');
                            router.replace('/dashboard');
                            return;
                          } catch (googleIdTokenError) {
                            console.log('❌ google_id_token format failed:', googleIdTokenError);
                            throw accessTokenError; // Throw the original error
                          }
                        }
                      }
                    }
                  }
                }
              }
            } catch (err: any) {
              console.error('❌ Google registration API call failed:', err);
              
              let errorMessage = 'Google registration failed. Please try again.';
              if (err?.data?.message) {
                errorMessage = err.data.message;
              } else if (err?.data?.error) {
                errorMessage = err.data.error;
              } else if (err?.status === 401) {
                errorMessage = 'Google authentication failed. Please check your backend configuration.';
              } else if (err?.status === 400) {
                errorMessage = 'Invalid Google authentication token. Please try again.';
              } else if (err?.status === 0) {
                errorMessage = 'Network error. Please check your connection and try again.';
              }
              
              toast.error(errorMessage);
            }
          }
        });
      }
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
        
        <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} noValidate>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className={`w-full py-3 px-4 bg-gray-700/50 border rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400 ${
                registerForm.formState.errors.name 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-600/50'
              }`}
              {...registerForm.register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                onChange: () => {
                  if (registerError) setRegisterError(null); // Clear error when user starts typing
                }
              })}
              disabled={isLoading}
              placeholder="Enter your full name"
            />
            {registerForm.formState.errors.name && (
              <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`w-full py-3 px-4 bg-gray-700/50 border rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400 ${
                registerForm.formState.errors.email 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-600/50'
              }`}
              {...registerForm.register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                },
                onChange: () => {
                  if (registerError) setRegisterError(null); // Clear error when user starts typing
                }
              })}
              disabled={isLoading}
              placeholder="Enter your email"
            />
            {registerForm.formState.errors.email && (
              <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full py-3 px-4 pr-12 bg-gray-700/50 border rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400 ${
                  registerForm.formState.errors.password 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-600/50'
                }`}
                {...registerForm.register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  onChange: () => {
                    if (registerError) setRegisterError(null); // Clear error when user starts typing
                  }
                })}
                disabled={isLoading}
                placeholder="Enter your password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {registerForm.formState.errors.password && (
              <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`w-full py-3 px-4 pr-12 bg-gray-700/50 border rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400 ${
                  registerForm.formState.errors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-600/50'
                }`}
                {...registerForm.register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => {
                    const password = registerForm.getValues('password');
                    return value === password || 'Passwords do not match';
                  },
                  onChange: () => {
                    if (registerError) setRegisterError(null); // Clear error when user starts typing
                  }
                })}
                disabled={isLoading}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-200"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {registerForm.formState.errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`w-full font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
              disabled={isLoading || isGoogleLoading}
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
