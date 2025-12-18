
export enum AIModel {
  CHATGPT = 'gpt-4.1-nano',
  GEMINI = 'gemini-3-flash-preview'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelName?: string;
}

export interface SessionConfig {
  systemPrompt: string;
  temperature: number;
  maxOutputTokens: number;
  model: AIModel;
}

export interface AnalysisConfig {
  provider: 'gemini' | 'openai';
  question: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  history: Message[];
}
