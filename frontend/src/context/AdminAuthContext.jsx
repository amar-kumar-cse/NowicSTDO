import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

async function adminRequest(path, options = {}) {
    const finalHeaders = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    const response = await fetch(`/api/admin${path}`, {
        ...options,
        credentials: 'include',
        headers: finalHeaders,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload?.message || 'Admin auth request failed');
    }

    return payload;
}

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await adminRequest('/session', { method: 'GET' });
                if (mounted) {
                    setAdmin(data.admin || null);
                }
            } catch {
                if (mounted) {
                    setAdmin(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const login = async (username, password) => {
        const data = await adminRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        setAdmin(data.admin || null);
        return true;
    };

    const logout = async () => {
        try {
            await adminRequest('/logout', { method: 'POST' });
        } finally {
            setAdmin(null);
        }
    };

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout, isLoggedIn: !!admin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAdminAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
    return ctx;
}
