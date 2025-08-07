import { StateCreator } from 'zustand';

export const getPuter = () =>
  typeof window !== 'undefined' && window.puter ? window.puter : null;

// Generic type for slice creators with proper middleware typing
export type PuterSlice<T, U = T> = StateCreator<
  T,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  U
>;

// Improved error handler with better typing
export const withErrorHandling = <
    TArgs extends readonly unknown[],
    TReturn
>(
    action: (puter: NonNullable<ReturnType<typeof getPuter>>, ...args: TArgs) => Promise<TReturn>,
    setError: (msg: string) => void
) => {
    return async (...args: TArgs): Promise<TReturn | undefined> => {
        const puter = getPuter();
        if (!puter) {
            setError('Puter.js not available');
            return undefined;
        }
        try {
            return await action(puter, ...args);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(msg);
            return undefined;
        }
    };
};

// Type helper for error messages
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
};
