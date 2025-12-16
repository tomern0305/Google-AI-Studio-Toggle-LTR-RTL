export type Direction = 'ltr' | 'rtl';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  direction?: Direction; // Per-message direction override
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
}