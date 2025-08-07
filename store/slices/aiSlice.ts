import { PuterSlice, withErrorHandling } from "../puterUtils";
import {
    ChatMessage,
    PuterChatOptions,
    AIResponse,
} from "@/types/puter";

export interface AiState {
    // AI-specific state - could add chat history, model preferences, etc.
    chatHistory?: AIResponse[];
    preferredModel?: string;
}

export interface AiActions {
    chat: (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
    feedback: (path: string, message: string) => Promise<AIResponse | undefined>;
    img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string | undefined>;
}

export const createAiSlice: PuterSlice<any, AiState & { ai: AiActions }> = (set) => {
    const setError = (error: string) => set((state) => ({ ...state, error }));
    const clearError = () => set((state) => ({ ...state, error: null }));

    const chat = withErrorHandling(
        async (
            puter,
            prompt: string | ChatMessage[],
            imageURL?: string | PuterChatOptions,
            testMode?: boolean,
            options?: PuterChatOptions
        ) => {
            const response = (await puter.ai.chat(
                prompt,
                imageURL,
                testMode,
                options
            )) as AIResponse;
            clearError();
            return response;
        },
        setError
    );

    const feedback = withErrorHandling(
        async (puter, path: string, message: string) => {
            const response = (await puter.ai.chat(
                [
                    {
                        role: "user",
                        content: [
                            {
                                type: "file",
                                puter_path: path,
                            },
                            {
                                type: "text",
                                text: message,
                            },
                        ],
                    },
                ],
                { model: "claude-sonnet-4" }
            )) as AIResponse;
            clearError();
            return response;
        },
        setError
    );

    const img2txt = withErrorHandling(
        async (puter, image: string | File | Blob, testMode?: boolean) => {
            const text = await puter.ai.img2txt(image, testMode);
            clearError();
            return text;
        },
        setError
    );

    return {
        // Initial AI state
        // chatHistory: [],
        // preferredModel: 'claude-sonnet-4',

        // AI actions grouped under 'ai' namespace
        ai: {
            chat,
            feedback,
            img2txt,
        },
    };
};
