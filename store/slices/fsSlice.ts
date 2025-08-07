import { PuterSlice, withErrorHandling } from "../puterUtils";
import { FSItem } from "@/types/puter";

export interface FsState {
    // FS-specific state - could add file cache, recent files, etc.
    files?: FSItem[] | null;
    currentDirectory?: string;
}

export interface FsActions {
    write: (path: string, data: string | File | Blob) => Promise<File | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (files: File[] | Blob[]) => Promise<FSItem | undefined>;
    deleteFile: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
}

export const createFsSlice: PuterSlice<any, FsState & { fs: FsActions }> = (set) => {
    const setError = (error: string) => set((state) => ({ ...state, error }));
    const clearError = () => set((state) => ({ ...state, error: null }));

    // Using withErrorHandling to eliminate repetitive code
    const write = withErrorHandling(
        async (puter, path: string, data: string | File | Blob) => {
            const result = await puter.fs.write(path, data);
            clearError();
            return result;
        },
        setError
    );

    const read = withErrorHandling(
        async (puter, path: string) => {
            const result = await puter.fs.read(path);
            clearError();
            return result;
        },
        setError
    );

    const upload = withErrorHandling(
        async (puter, files: File[] | Blob[]) => {
            const result = await puter.fs.upload(files);
            clearError();
            return result;
        },
        setError
    );

    const deleteFile = withErrorHandling(
        async (puter, path: string) => {
            await puter.fs.delete(path);
            clearError();
        },
        setError
    );

    const readDir = withErrorHandling(
        async (puter, path: string) => {
            const result = await puter.fs.readdir(path);
            clearError();
            return result;
        },
        setError
    );

    return {
        // Initial FS state
        // files: null,
        // currentDirectory: '/',

        // FS actions grouped under 'fs' namespace
        fs: {
            write,
            read,
            upload,
            deleteFile,
            readDir,
        },
    };
};
