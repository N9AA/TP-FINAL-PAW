import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function useAuth() {
    const { auth } = usePage<SharedData>().props;

    const permissions: string[] = auth?.permissions || [];

    const can = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    return {
        can,
        user: auth?.user,
    };
}