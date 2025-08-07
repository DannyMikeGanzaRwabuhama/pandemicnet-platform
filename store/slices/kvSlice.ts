import { PuterSlice, withErrorHandling } from "../puterUtils";
import { KVItem } from "@/types/puter";

export interface KvState {
    // KV-specific state - could add cache, usage stats, etc.
    cachedKeys?: KVItem[] | null;
    operationCount?: number;
}

export interface KvActions {
    getKV: (key: string) => Promise<string | null | undefined>;
    setKV: (key: string, value: string) => Promise<boolean | undefined>;
    deleteKV: (key: string) => Promise<boolean | undefined>;
    listKV: (
        pattern: string,
        returnValues?: boolean
    ) => Promise<string[] | KVItem[] | undefined>;
    flushKV: () => Promise<boolean | undefined>;
}

export const createKvSlice: PuterSlice<any, KvState & { kv: KvActions }> = (set) => {
    const setError = (error: string) => set((state) => ({ ...state, error }));
    const clearError = () => set((state) => ({ ...state, error: null }));

    const getKV = withErrorHandling(
        async (puter, key: string) => {
            const value = await puter.kv.get(key);
            clearError();
            return value;
        },
        setError
    );

    const setKV = withErrorHandling(
        async (puter, key: string, value: string) => {
            const success = await puter.kv.set(key, value);
            clearError();
            return success;
        },
        setError
    );

    const deleteKV = withErrorHandling(
        async (puter, key: string) => {
            const success = await puter.kv.delete(key);
            clearError();
            return success;
        },
        setError
    );

    const listKV = withErrorHandling(
        async (puter, pattern: string, returnValues: boolean = false) => {
            const list = await puter.kv.list(pattern, returnValues);
            clearError();
            return list;
        },
        setError
    );

    const flushKV = withErrorHandling(
        async (puter) => {
            const success = await puter.kv.flush();
            clearError();
            return success;
        },
        setError
    );

    return {
        // Initial KV state
        // cachedKeys: null,
        // operationCount: 0,

        // KV actions grouped under 'kv' namespace
        kv: {
            getKV,
            setKV,
            deleteKV,
            listKV,
            flushKV,
        },
    };
};
