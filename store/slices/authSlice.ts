import { PuterSlice, getPuter, getErrorMessage } from "../puterUtils";
import { PuterUser } from "@/types/puter";

export interface AuthState {
    // Auth-specific state
    user: PuterUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthActions {
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    getUser: () => PuterUser | null;
}

// Create auth slice with proper typing
export const createAuthSlice: PuterSlice<any, AuthState & { auth: AuthActions }> = (set, get) => {
    const updateAuthState = (updates: Partial<AuthState>) => {
        set((state) => ({ ...state, ...updates }));
    };

    const checkAuthStatus = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            return; // Handled by global init process
        }
        
        updateAuthState({ isLoading: true });
        
        try {
            const isSignedIn = await puter.auth.isSignedIn();
            const user = isSignedIn ? await puter.auth.getUser() : null;
            
            updateAuthState({
                user,
                isAuthenticated: isSignedIn,
                isLoading: false,
            });
        } catch (error) {
            console.error("Failed to check auth status:", getErrorMessage(error));
            updateAuthState({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false 
            });
        }
    };

    const signIn = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) return;
        
        updateAuthState({ isLoading: true });
        
        try {
            await puter.auth.signIn();
            await checkAuthStatus();
        } catch (error) {
            updateAuthState({ isLoading: false });
            console.error("Sign in failed:", getErrorMessage(error));
        }
    };

    const signOut = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) return;
        
        try {
            await puter.auth.signOut();
            updateAuthState({ user: null, isAuthenticated: false });
        } catch (error) {
            console.error("Sign out failed:", getErrorMessage(error));
        }
    };

    const refreshUser = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) return;
        
        try {
            const user = await puter.auth.getUser();
            updateAuthState({ user, isAuthenticated: !!user });
        } catch (error) {
            console.error("Failed to refresh user:", getErrorMessage(error));
            updateAuthState({ user: null, isAuthenticated: false });
        }
    };

    const getUser = (): PuterUser | null => {
        return get().user;
    };

    return {
        // Initial auth state
        user: null,
        isAuthenticated: false,
        isLoading: true,

        // Auth actions grouped under 'auth' namespace
        auth: {
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getUser,
        },
    };
};
