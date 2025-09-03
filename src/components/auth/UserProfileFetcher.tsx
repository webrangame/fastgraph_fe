'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetUserProfileQuery } from '../../../lib/api/authApi';
import { selectCurrentUser } from '../../../redux/slice/authSlice';

interface UserProfileFetcherProps {
  children: React.ReactNode;
}

export default function UserProfileFetcher({ children }: UserProfileFetcherProps) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  // Only fetch user profile if we have tokens but no user data
  const shouldFetchProfile = !user && (
    typeof window !== 'undefined' && 
    (document.cookie.includes('access_token') || document.cookie.includes('refresh_token'))
  );

  const { data: profileData, error, isLoading } = useGetUserProfileQuery(undefined, {
    skip: !shouldFetchProfile,
  });

  useEffect(() => {
    if (profileData && !user) {
      console.log('🔵 UserProfileFetcher: Fetched user profile:', profileData);
      // The auth slice will automatically handle this via the getUserProfile.matchFulfilled matcher
    }
  }, [profileData, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('🔴 UserProfileFetcher: Failed to fetch user profile:', error);
  }

  return <>{children}</>;
}
