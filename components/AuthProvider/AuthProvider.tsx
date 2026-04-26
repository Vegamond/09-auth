'use client';

import { checkSession, getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useState } from 'react';

type Props = {
    children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
    const setUser = useAuthStore((state) => state.setUser);
    const clearIsAuthenticated = useAuthStore((state) => state.clearIsAuthenticated);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const session = await checkSession();
                if (session) {
                    const user = await getMe();
                    if (user) setUser(user);
                } else {
                    clearIsAuthenticated();
                }
            } catch {
                clearIsAuthenticated();
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [setUser, clearIsAuthenticated]);

    if (isLoading) return <p>Завантаження...</p>;

    return <>{children}</>;
}