import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

export function useAuth() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const normalizedClerkKey = typeof publishableKey === 'string' ? publishableKey.trim() : '';
  const isClerkConfigured =
    normalizedClerkKey.startsWith('pk_') && !/your|placeholder/i.test(normalizedClerkKey);

  if (!isClerkConfigured) {
    return {
      isSignedIn: false,
      isLoaded: true,
      user: null,
      getApiToken: async () => null,
      userEmail: undefined,
      userName: undefined,
    };
  }

  const { getToken, isSignedIn, isLoaded } = useClerkAuth();
  const { user } = useUser();

  async function getApiToken() {
    if (!isSignedIn) return null;
    return await getToken();
  }

  return {
    isSignedIn,
    isLoaded,
    user,
    getApiToken,
    userEmail: user?.primaryEmailAddress?.emailAddress,
    userName: user?.fullName,
  };
}