export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: AIProvider;
  model?: string;
  tokenUsage?: TokenUsage;
  responseTime?: number;
}

export interface ChatThread {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  provider: AIProvider;
  model: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface Workspace {
  id: string;
  userId: string;
  name: string;
  systemPrompt: string;
  provider: AIProvider;
  model: string;
  threads: string[]; // Thread IDs
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface ChatState {
  currentWorkspace: Workspace | null;
  currentThread: ChatThread | null;
  workspaces: Workspace[];
  threads: ChatThread[];
  isLoading: boolean;
  error: string | null;
}