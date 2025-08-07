export {};
declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
      fs: {
        write: (
          path: string,
          data: string | File | Blob
        ) => Promise<File | undefined>;
        read: (path: string) => Promise<Blob>;
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        delete: (path: string) => Promise<void>;
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      ai: {
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions
        ) => Promise<object>;
        img2txt: (
          image: string | File | Blob,
          testMode?: boolean
        ) => Promise<string>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

export interface FSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  parent_id: string;
  parent_uid: string;
  created: number;
  modified: number;
  accessed: number;
  size: number | null;
  writable: boolean;
}

export interface PuterUser {
  uuid: string;
  username: string;
}

export interface KVItem {
  key: string;
  value: string;
}

export interface ChatMessageContent {
  type: 'file' | 'text';
  puter_path?: string;
  text?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ChatMessageContent[];
}

export interface PuterChatOptions {
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  tools?: {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: { type: string; properties: object };
    }[];
  };
}

export interface AIResponse {
  index: number;
  message: {
    role: string;
    content: string | never[];
    refusal: null | string;
    annotations: never[];
  };
  logprobs: null | never;
  finish_reason: string;
  usage: {
    type: string;
    model: string;
    amount: number;
    cost: number;
  }[];
  via_ai_chat_service: boolean;
}
