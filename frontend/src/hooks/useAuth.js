import { useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

const fallbackGetApiToken = async () => 'dev_token';

export function useAuth() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const normalizedClerkKey = typeof publishableKey === 'string' ? publishableKey.trim() : '';
  const isClerkConfigured =
    normalizedClerkKey.startsWith('pk_') && !/your|placeholder/i.test(normalizedClerkKey);

  if (!isClerkConfigured) {
    return {
      isSignedIn: true,   // treat as signed-in for dev flow
      isLoaded: true,
      user: { fullName: 'Dev Admin', primaryEmailAddress: { emailAddress: 'dev@local' } },
      getApiToken: fallbackGetApiToken,
      userEmail: 'dev@local',
      userName: 'Dev Admin',
      isClerkConfigured: false,
    };
  }

  const { getToken, isSignedIn, isLoaded } = useClerkAuth();
  const { user } = useUser();

  const getApiToken = useCallback(async () => {
    if (!isSignedIn) return null;
    return await getToken();
  }, [isSignedIn, getToken]);

  return {
    isSignedIn,
    isLoaded,
    user,
    getApiToken,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    userName: user?.fullName,
  };
}