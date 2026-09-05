import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

/**
 * Inner provider that uses Clerk hooks. Only rendered when ClerkProvider exists.
 */
function ClerkAdminAuthProvider({ children }) {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkAdminRole = async () => {
            if (!isLoaded) return;
            
            if (!isSignedIn) {
                if (mounted) {
                    setAdminProfile(null);
                    setLoading(false);
                }
                return;
            }

            try {
                const token = await getToken();
                if (!token) throw new Error('No token');

                // Verify with backend that this user is an admin
                const response = await api.admin_me(token);
                if (mounted) {
                    if (response?.success && response?.data?.role === 'admin') {
                        setAdminProfile(response.data);
                    } else {
                        setAdminProfile(null);
                    }
                }
            } catch (error) {
                console.error('Admin role verification failed:', error);
                if (mounted) setAdminProfile(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        checkAdminRole();

        return () => {
            mounted = false;
        };
    }, [isLoaded, isSignedIn, getToken]);

    return (
        <AuthContext.Provider 
            value={{ 
                admin: adminProfile, 
                loading, 
                isLoggedIn: !!adminProfile,
                isLoaded: isLoaded && !loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Fallback provider when Clerk is not configured.
 * In DEV mode, shows a simple password gate so local development can proceed.
 * In production without Clerk, always reports as not logged in.
 */
function FallbackAdminAuthProvider({ children }) {
    const [devLoggedIn, setDevLoggedIn] = useState(() => {
        // Persist across page refreshes within the same browser session
        return sessionStorage.getItem('nowic_dev_admin') === 'true';
    });

    const devLogin = (ok) => {
        if (ok) sessionStorage.setItem('nowic_dev_admin', 'true');
        else sessionStorage.removeItem('nowic_dev_admin');
        setDevLoggedIn(ok);
    };

    const isDevMode = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

    return (
        <AuthContext.Provider
            value={{
                admin: (isDevMode && devLoggedIn) ? { role: 'admin', email: 'dev@local', name: 'Dev Admin' } : null,
                loading: false,
                isLoggedIn: isDevMode && devLoggedIn,
                isLoaded: true,
                devLogin,           // exposed for the login page
                isDevMode,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Wrapper that picks the right provider depending on Clerk availability.
 * Checks the same env var that main.jsx uses to decide whether to mount ClerkProvider.
 */
export function AdminAuthProvider({ children }) {
    const key = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY) || '';
    const normalizedKey = typeof key === 'string' ? key.trim() : '';
    const isClerkConfigured = normalizedKey.startsWith('pk_') && !/your|placeholder/i.test(normalizedKey);

    if (isClerkConfigured) {
        return <ClerkAdminAuthProvider>{children}</ClerkAdminAuthProvider>;
    }

    return <FallbackAdminAuthProvider>{children}</FallbackAdminAuthProvider>;
}

export function useAdminAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
    return ctx;
}
