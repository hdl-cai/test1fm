import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import type { UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export type { UserRole } from '@/types';

/**
 * Hook to guard a component or page based on user role.
 * Redirects to an unauthorized page (or home) if the user doesn't have the role.
 */
export function useRoleGuard(allowedRoles: UserRole[], redirectTo = '/unauthorized') {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const isSingleUser = useProfileStore((s) => s.isSingleUser);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate('/login');
            } else if (user && !isSingleUser && !allowedRoles.includes(user.role as UserRole)) {
                navigate(redirectTo);
            }
        }
    }, [user, isAuthenticated, isLoading, isSingleUser, allowedRoles, navigate, redirectTo]);

    return { isLoading, isAuthorized: isAuthenticated && user && (isSingleUser || allowedRoles.includes(user.role as UserRole)) };
}

/**
 * Utility to check if a user has a specific role permission.
 * Useful for conditional rendering of components.
 */
export function hasRole(allowedRoles: UserRole[]): boolean {
    const { user } = useAuthStore.getState();
    const { isSingleUser } = useProfileStore.getState();
    if (!user) return false;
    if (isSingleUser) return true;
    return allowedRoles.includes(user.role as UserRole);
}

/**
 * Higher Order Component (HOC) wrapper for role protection
 */
export function withRole<P extends object>(Component: React.ComponentType<P>, allowedRoles: UserRole[]) {
    return function WrappedWithRole(props: P) {
        const { isAuthorized, isLoading } = useRoleGuard(allowedRoles);

        if (isLoading) {
            return (
                <div className="flex h-screen w-screen items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-micro font-bold uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                            Security Check...
                        </p>
                    </div>
                </div>
            );
        }

        if (!isAuthorized) {
            return null; // The hook handles redirect
        }

        return <Component {...props} />;
    };
}
