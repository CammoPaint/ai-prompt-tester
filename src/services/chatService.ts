import { AIProvider, AIResponse, TokenUsage } from '../types';
import { ChatMessage } from '../types/chat';
import { useAuthStore } from '../store/authStore';

// Enhanced API service for chat functionality
export const sendChatMessage = async (
  messages: ChatMessage[],
  provider: AIProvider,
  model: string,
  systemPrompt?: string
): Promise<AIResponse> => {
  const apiKeys = useAuthStore.getState().apiKeys;
  const apiKey = apiKeys[provider];
  
  // Check if Ollama is being used on a deployed site
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (provider === 'ollama' && !isLocalhost) {
    throw new Error('Ollama is only available when running locally. Please use a cloud-based provider for deployed applications.');
  }
  
  if (provider !== 'ollama' && !apiKey) {
    throw new Error(`API key for ${provider} is not set`);
  }
  
  const config = createApiConfig(provider, apiKey);
  const requestData = formatChatRequest(messages, provider, model, systemPrompt);
  const startTime = performance.now();
  
  try {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (provider === 'ollama') {
        throw new Error(`Ollama Error: ${errorData.error || 'Failed to connect to Ollama. Make sure Ollama is running on localhost:11434'}`);
      }
      throw new Error(errorData.error?.message || 'Failed to get response from API');
    }
    
    const data = await response.json();
    const endTime = performance.now();
    
    let content: string;
    let tokenUsage: TokenUsage;
    
    if (provider === 'ollama') {
      content = data.message?.content || '';
      tokenUsage = {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      };
    } else {
      content = data.choices[0].message.content;
      tokenUsage = data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      };
    }
    
    return {
      content,
      format: 'markdown',
      timestamp: Date.now(),
      provider,
      model,
      tokenUsage,
      responseTime: (endTime - startTime) / 1000
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
};

const createApiConfig = (provider: AIProvider, apiKey?: string) => {
  const configs = {
    openai: {
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    openrouter: {
      baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Prompt Testing Platform',
        'Content-Type': 'application/json'
      }
    },
    perplexity: {
      baseUrl: 'https://api.perplexity.ai/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    deepseek: {
      baseUrl: 'https://api.deepseek.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    grok: {
      baseUrl: 'https://api.x.ai/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    qwen: {
      baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    ollama: {
      baseUrl: 'http://localhost:11434/api/chat',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  };
  
  return configs[provider];
};

const formatChatRequest = (
  messages: ChatMessage[],
  provider: AIProvider,
  model: string,
  systemPrompt?: string
) => {
  // Convert ChatMessage[] to API format
  const apiMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  // Add system prompt if provided
  if (systemPrompt) {
    apiMessages.unshift({
      role: 'system',
      content: systemPrompt
    });
  }
  
  if (provider === 'ollama') {
    return {
      model,
      messages: apiMessages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 2048
      }
    };
  }
  
  return {
    model,
    messages: apiMessages,
    temperature: 0.7,
    ...(provider === 'openai' && (model.includes('gpt-5') || model.includes('o1'))
      ? { max_completion_tokens: 2048 }
      : { max_tokens: 2048 })
  };
};