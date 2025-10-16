'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

const RegisterSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // Get email from URL parameters or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('registeredEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('registeredEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    // Countdown timer for resend email
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    try {
      // Call resend verification email API
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Verification email sent successfully!');
        setCountdown(30); // Reset countdown
      } else {
        alert('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to send verification email. Please try again.');
    }
  };

  const handleCheckVerification = async () => {
    if (!email) return;
    
    try {
      // Check if email is verified
      const response = await fetch(`/api/v1/auth/check-verification?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          alert('Email verified successfully! You can now log in.');
          localStorage.removeItem('registeredEmail');
          router.push('/login');
        } else {
          alert('Email not yet verified. Please check your email and click the verification link.');
        }
      } else {
        alert('Failed to check verification status. Please try again.');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      alert('Failed to check verification status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Dark background with gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-indigo-900/25" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-800/10 to-purple-800/20" />
      </div>

      {/* Success card */}
      <div className="p-8 w-full max-w-md relative z-10 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-gray-300">Your account has been created successfully.</p>
        </div>

        {/* Email Verification Message */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg backdrop-blur-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Email Verification Required</h3>
              <p className="text-sm text-blue-200">
                We've sent a verification email to <strong className="text-blue-100">{email || 'your email'}</strong>. 
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-200 mb-2">Next Steps:</h4>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. Check your email inbox (and spam folder)</li>
            <li>2. Click the verification link in the email</li>
            <li>3. Return here and click "Check Verification"</li>
            <li>4. Once verified, you can log in to your account</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Check Verification Status
          </button>

          <button
            onClick={handleResendEmail}
            disabled={countdown > 0}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 ${
              countdown > 0
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
            }`}
          >
            {countdown > 0 ? `Resend Email (${countdown}s)` : 'Resend Verification Email'}
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already verified?{' '}
            <Link 
              href="/login" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;
