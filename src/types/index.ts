export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ApiKeys {
  openai?: string;
  perplexity?: string;
  deepseek?: string;
  grok?: string;
  qwen?: string;
}

export type AIProvider = 'openai' | 'perplexity' | 'deepseek' | 'grok' | 'qwen';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface SavedPrompt {
  id?: string;
  userId: string;
  title: string;
  systemPrompt: string;
  userPrompt: string;
  provider: AIProvider;
  model: string;
  response?: string;
  tokenUsage?: TokenUsage;
  createdAt: string;
  updatedAt: string;
}

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
  max_tokens: number;
}

export type ResponseFormat = 'json' | 'markdown';

export interface PromptState {
  systemPrompt: string;
  userPrompt: string;
  responseFormat: ResponseFormat;
  modelConfig: AIModelConfig;
}