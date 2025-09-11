'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLoginMutation, useGoogleLoginMutation, useForgotPasswordMutation } from '../../../lib/api/authApi';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/ThemeProvider';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Form validation schemas
interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordFormData {
  email: string;
}

const LoginPage = () => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // React Hook Form setup
  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: 'prageeth.mahendra@gmail.com',
      password: 'prageeth'
    },
    mode: 'onChange'
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: ''
    },
    mode: 'onChange'
  });

  const [login, { isLoading, isSuccess, isError, error }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [forgotPassword, { isLoading: isForgotPasswordLoading }] = useForgotPasswordMutation();
  const router = useRouter();
  const { theme } = useTheme();

  const handleLoginSubmit = async (data: LoginFormData) => {
    setLoginError(null); // Clear previous errors
    
    try {
      console.log('🔵 Attempting login with:', { email: data.email, password: '***' });
      const result = await login({ email: data.email, password: data.password }).unwrap();
      console.log('✅ Login successful, redirecting...', result);
      toast.success('Login successful! Redirecting to dashboard...');
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
    }
  };


  const handleForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setForgotPasswordMessage(null); // Clear previous messages
    
    try {
      const response = await forgotPassword({ email: data.email }).unwrap();
      console.log('✅ Forgot password response:', response);
      
      // Extract success message from backend response
      let successMessage = 'Password reset link sent to your email!';
      if (response?.message) {
        successMessage = response.message;
      } else if (response?.data?.message) {
        successMessage = response.data.message;
      }
      
      setForgotPasswordMessage({ type: 'success', text: successMessage });
      toast.success(successMessage);
      
      // Auto-close modal after 3 seconds on success
      setTimeout(() => {
        setShowForgotPassword(false);
        forgotPasswordForm.reset();
        setForgotPasswordMessage(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('❌ Forgot password failed:', err);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 404) {
        errorMessage = 'No account found with this email address.';
      } else if (err?.status === 400) {
        errorMessage = 'Please enter a valid email address.';
      } else if (err?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (err?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setForgotPasswordMessage({ type: 'error', text: errorMessage });
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
      console.log('✅ Google OAuth script loaded successfully');
      // Wait a bit for the DOM to be ready
      setTimeout(() => {
        if (window.google) {
          console.log('✅ Google OAuth API is available');
          // Initialize and render the Google button
          initializeAndRenderGoogleButton();
        }
      }, 100);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google OAuth script');
      toast.error('Failed to load Google authentication. Please refresh the page.');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeAndRenderGoogleButton = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error('❌ Google Client ID missing');
      return;
    }

    // Initialize Google OAuth with callback
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            console.log('🔵 Google OAuth callback received');
            console.log('🔵 Response credential length:', response.credential?.length);
            console.log('🔵 Response credential (first 100 chars):', response.credential?.substring(0, 100));
            
            if (!response.credential) {
              console.error('❌ No credential received from Google');
              toast.error('No authentication token received from Google. Please try again.');
              return;
            }

            console.log('🔵 Sending credential to backend...');
            
            // Try different token formats that backends commonly expect
            try {
              // Format 1: access_token (current)
              console.log('🔵 Trying access_token format...');
              const result = await googleLogin({ access_token: response.credential }).unwrap();
              console.log('✅ Google login successful with access_token:', result);
              toast.success('Google login successful! Redirecting to dashboard...');
              router.replace('/dashboard');
              return;
            } catch (accessTokenError) {
              console.log('❌ access_token format failed:', accessTokenError);
              
              // Format 2: id_token (common alternative)
              try {
                console.log('🔵 Trying id_token format...');
                const result = await googleLogin({ id_token: response.credential }).unwrap();
                console.log('✅ Google login successful with id_token:', result);
                toast.success('Google login successful! Redirecting to dashboard...');
                router.replace('/dashboard');
                return;
              } catch (idTokenError) {
                console.log('❌ id_token format failed:', idTokenError);
                
                // Format 3: token (generic)
                try {
                  console.log('🔵 Trying token format...');
                  const result = await googleLogin({ token: response.credential }).unwrap();
                  console.log('✅ Google login successful with token:', result);
                  toast.success('Google login successful! Redirecting to dashboard...');
                  router.replace('/dashboard');
                  return;
                } catch (tokenError) {
                  console.log('❌ token format failed:', tokenError);
                  
                  // Format 4: credential (direct)
                  try {
                    console.log('🔵 Trying credential format...');
                    const result = await googleLogin({ credential: response.credential }).unwrap();
                    console.log('✅ Google login successful with credential:', result);
                    toast.success('Google login successful! Redirecting to dashboard...');
                    router.replace('/dashboard');
                    return;
                  } catch (credentialError) {
                    console.log('❌ credential format failed:', credentialError);
                    
                    // Format 5: google_token
                    try {
                      console.log('🔵 Trying google_token format...');
                      const result = await googleLogin({ google_token: response.credential }).unwrap();
                      console.log('✅ Google login successful with google_token:', result);
                      toast.success('Google login successful! Redirecting to dashboard...');
                      router.replace('/dashboard');
                      return;
                    } catch (googleTokenError) {
                      console.log('❌ google_token format failed:', googleTokenError);
                      
                      // Format 6: jwt
                      try {
                        console.log('🔵 Trying jwt format...');
                        const result = await googleLogin({ jwt: response.credential }).unwrap();
                        console.log('✅ Google login successful with jwt:', result);
                        toast.success('Google login successful! Redirecting to dashboard...');
                        router.replace('/dashboard');
                        return;
                      } catch (jwtError) {
                        console.log('❌ jwt format failed:', jwtError);
                        
                        // Format 7: google_id_token
                        try {
                          console.log('🔵 Trying google_id_token format...');
                          const result = await googleLogin({ google_id_token: response.credential }).unwrap();
                          console.log('✅ Google login successful with google_id_token:', result);
                          toast.success('Google login successful! Redirecting to dashboard...');
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
            console.error('❌ Google login API call failed:', err);
            
            let errorMessage = 'Google login failed. Please try again.';
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

    // Use popup-based OAuth instead of FedCM to avoid CORS issues
    const buttonDiv = document.getElementById('google-signin-button');
    if (buttonDiv) {
      buttonDiv.innerHTML = `
        <button 
          type="button" 
          id="google-login-btn"
          class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      `;

      // Add click handler for popup-based OAuth
      const googleBtn = document.getElementById('google-login-btn');
      if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleLoginPopup);
      }
    }
  };

  const handleGoogleLoginPopup = async () => {
    try {
      console.log('🔵 Starting Google OAuth for login');
      
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

  const handleGoogleAuthCode = async (code: string) => {
    try {
      console.log('🔵 Processing Google auth code');
      
      // Exchange code for token (you'll need to implement this in your backend)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      
      // Use the existing googleLogin mutation
      const result = await googleLogin({ access_token: data.access_token }).unwrap();
      console.log('✅ Google login successful:', result);
      toast.success('Google login successful! Redirecting to dashboard...');
      router.replace('/dashboard');
      
    } catch (error: any) {
      console.error('❌ Google auth code processing failed:', error);
      toast.error('Google authentication failed. Please try again.');
    }
  };

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
        
        <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} noValidate>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`w-full py-3 px-4 bg-gray-700/50 border rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400 ${
                loginForm.formState.errors.email 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-600/50'
              }`}
              {...loginForm.register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                },
                onChange: () => {
                  if (loginError) setLoginError(null); // Clear error when user starts typing
                }
              })}
              disabled={isLoading}
              placeholder="Enter your email"
            />
            {loginForm.formState.errors.email && (
              <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="mb-1">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full py-3 px-4 pr-12 bg-gray-700/50 border rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400 ${
                  loginForm.formState.errors.password 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-600/50'
                }`}
                {...loginForm.register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  onChange: () => {
                    if (loginError) setLoginError(null); // Clear error when user starts typing
                  }
                })}
                disabled={isLoading}
                placeholder="Enter your password"
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
            {loginForm.formState.errors.password && (
              <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          
          {/* Forgot Password Link */}
          <div className="mb-5 text-right">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotPasswordMessage(null); // Clear any previous messages
                forgotPasswordForm.setValue('email', loginForm.getValues('email')); // Pre-fill with current email
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
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
              {isLoading ? 'Logging in...' : 'Login'}
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
            <div id="google-signin-button" className="w-full"></div>
          </div>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              Create one here
            </Link>
          </p>
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
                  forgotPasswordForm.reset();
                  setForgotPasswordMessage(null);
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
            
            {/* Backend Response Message Display */}
            {forgotPasswordMessage && (
              <div className={`mb-4 p-3 rounded-lg backdrop-blur-sm ${
                forgotPasswordMessage.type === 'success' 
                  ? 'bg-green-900/30 border border-green-600/50 text-green-300' 
                  : 'bg-red-900/30 border border-red-600/50 text-red-300'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {forgotPasswordMessage.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{forgotPasswordMessage.text}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPasswordSubmit)}>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="forgot-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  className={`w-full py-3 px-4 bg-gray-700/50 border rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 backdrop-blur-sm placeholder-gray-400 ${
                    forgotPasswordForm.formState.errors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-600/50'
                  }`}
                  {...forgotPasswordForm.register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  placeholder="Enter your email address"
                  disabled={isForgotPasswordLoading}
                />
                {forgotPasswordForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{forgotPasswordForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    forgotPasswordForm.reset();
                    setForgotPasswordMessage(null);
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
