export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ApiKeys {
  openai?: string;
  openrouter?: string;
  perplexity?: string;
  deepseek?: string;
  grok?: string;
  qwen?: string;
}

export type AIProvider = 'openai' | 'openrouter' | 'perplexity' | 'deepseek' | 'grok' | 'qwen' | 'ollama';

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
  responseTime?: number;
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

export interface AIResponse {
  content: string;
  format: ResponseFormat;
  timestamp: number;
  provider: AIProvider;
  model: string;
  tokenUsage: TokenUsage;
  responseTime: number;
}