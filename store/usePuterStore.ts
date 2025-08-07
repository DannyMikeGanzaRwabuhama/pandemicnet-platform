import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createAuthSlice, AuthState, AuthActions } from "./slices/authSlice";
import { createFsSlice, FsState, FsActions } from "./slices/fsSlice";
import { createAiSlice, AiState, AiActions } from "./slices/aiSlice";
import { createKvSlice, KvState, KvActions } from "./slices/kvSlice";
import { getPuter, getErrorMessage } from "./puterUtils";

// Complete store interface
export interface PuterStore extends AuthState, FsState, AiState, KvState {
    // Global state
    error: string | null;
    puterReady: boolean;
    
    // Global actions
    init: () => Promise<void>;
    clearError: () => void;
    
    // Slice actions
    auth: AuthActions;
    fs: FsActions;
    ai: AiActions;
    kv: KvActions;
}

export const usePuterStore = create<PuterStore>()(  
    devtools(
        immer((set, get, store) => ({
            // Global state
            error: null,
            puterReady: false,
            clearError: () => set({ error: null }),

            // Compose all slices properly
            ...createAuthSlice(set, get, store),
            ...createFsSlice(set, get, store),
            ...createAiSlice(set, get, store),
            ...createKvSlice(set, get, store),

            // Main initialization logic with proper error handling
            init: async () => {
                const puter = getPuter();
                if (puter) {
                    set({ puterReady: true, error: null });
                    await get().auth.checkAuthStatus();
                    return;
                }

                // Promise-based approach with proper cleanup
                let checkInterval: NodeJS.Timeout | null = null;
                let timeout: NodeJS.Timeout | null = null;
                
                try {
                    await new Promise<void>((resolve, reject) => {
                        timeout = setTimeout(() => {
                            if (checkInterval) clearInterval(checkInterval);
                            reject(new Error("Puter.js failed to load within 10 seconds"));
                        }, 10000);

                        checkInterval = setInterval(() => {
                            if (getPuter()) {
                                if (checkInterval) clearInterval(checkInterval);
                                if (timeout) clearTimeout(timeout);
                                resolve();
                            }
                        }, 100);
                    });
                    
                    set({ puterReady: true, error: null });
                    await get().auth.checkAuthStatus();
                } catch (error) {
                    const errorMessage = getErrorMessage(error);
                    set({ error: errorMessage, puterReady: false });
                    
                    // Ensure cleanup on error
                    if (checkInterval) clearInterval(checkInterval);
                    if (timeout) clearTimeout(timeout);
                }
            },
        })),
        { name: 'puter-store' }
    )
);
