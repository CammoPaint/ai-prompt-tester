import { AIProvider, AIResponse, PromptState, ResponseFormat } from '../types';
import { useAuthStore } from '../store/authStore';

// Base configuration for API requests
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

// Format the API request based on provider
const formatRequest = (promptState: PromptState) => {
  const { systemPrompt, userPrompt, modelConfig, responseFormat } = promptState;
  const { provider, model, temperature, max_tokens } = modelConfig;
  
  if (provider === 'ollama') {
    // Ollama uses a different API format
    return {
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: userPrompt }
      ],
      stream: false,
      options: {
        temperature,
        num_predict: max_tokens
      }
    };
  }
  
  // Common message format for most providers
  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: userPrompt }
  ];
  
  // Common parameters across most APIs
  const commonParams = {
    model,
    temperature,
    max_tokens,
    messages
  };
  
  // Format response based on format preference
  const response_format = responseFormat === 'json' 
    ? { type: 'json_object' } 
    : undefined;
  
  return {
    ...commonParams,
    ...(response_format && { response_format })
  };
};

// Get available models for Ollama
const getOllamaModels = async (): Promise<string[]> => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models');
    }
    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  } catch (error) {
    console.warn('Could not fetch Ollama models:', error);
    return ['llama2', 'mistral', 'codellama']; // Fallback common models
  }
};

// Send request to the selected AI provider
export const sendPrompt = async (promptState: PromptState): Promise<AIResponse> => {
  const { provider, model } = promptState.modelConfig;
  const apiKeys = useAuthStore.getState().apiKeys;
  const apiKey = apiKeys[provider];
  
  if (provider !== 'ollama' && !apiKey) {
    throw new Error(`API key for ${provider} is not set`);
  }
  
  const config = createApiConfig(provider, apiKey);
  const requestData = formatRequest(promptState);
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
    let tokenUsage: any;
    
    if (provider === 'ollama') {
      // Ollama response format
      content = data.message?.content || '';
      tokenUsage = {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      };
    } else {
      // Standard OpenAI-compatible format
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
      format: promptState.responseFormat,
      timestamp: Date.now(),
      provider,
      model,
      tokenUsage,
      responseTime: (endTime - startTime) / 1000 // Convert to seconds
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
};

// Get available models for each provider
export const getAvailableModels = (provider: AIProvider): string[] => {
  const models = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    openrouter: ['perplexity/sonar', 'deepseek/deepseek-r1-0528:free', 'deepseek/deepseek-r1-0528-qwen3-8b:free','anthropic/claude-3.7-sonnet'],
    perplexity: ['sonar', 'sonar-small', 'sonar-pro', 'sonar-deep-research', 'r1-1776','llama-2-70b-chat', 'llama-3.1-sonar-small-128k-online'],
    deepseek: ['deepseek-chat','deepseek-coder'],
    grok: ['grok-3', 'grok-3-mini'],
    qwen: ['qwen-plus', 'qwen-turbo'],
    ollama: ['llama2', 'mistral', 'codellama', 'llama3', 'phi', 'gemma'] // Common Ollama models
  };
  
  return models[provider] || [];
};

// Fetch available Ollama models dynamically
export const fetchOllamaModels = getOllamaModels;