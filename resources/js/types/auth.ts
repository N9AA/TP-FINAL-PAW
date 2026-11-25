export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile_photo_path: string | null;
    profile_photo_url: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    permissions: string[];
};

export type SharedData = {
    auth: Auth;
    name: string;
    sidebarOpen: boolean;
    [key: string]: unknown;
};