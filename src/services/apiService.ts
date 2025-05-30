import { AIProvider, AIResponse, PromptState, ResponseFormat } from '../types';
import { useAuthStore } from '../store/authStore';

// Base configuration for API requests
const createApiConfig = (provider: AIProvider, apiKey: string) => {
  const configs = {
    openai: {
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
    }
  };
  
  return configs[provider];
};

// Format the API request based on provider
const formatRequest = (promptState: PromptState) => {
  const { systemPrompt, userPrompt, modelConfig, responseFormat } = promptState;
  const { provider, model, temperature, max_tokens } = modelConfig;
  
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

// Send request to the selected AI provider
export const sendPrompt = async (promptState: PromptState): Promise<AIResponse> => {
  const { provider, model } = promptState.modelConfig;
  const apiKeys = useAuthStore.getState().apiKeys;
  const apiKey = apiKeys[provider];
  
  if (!apiKey) {
    throw new Error(`API key for ${provider} is not set`);
  }
  
  const config = createApiConfig(provider, apiKey);
  const requestData = formatRequest(promptState);
  
  try {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from API');
    }
    
    const data = await response.json();
    
    // Extract token usage information
    const tokenUsage = data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    };
    
    return {
      content: data.choices[0].message.content,
      format: promptState.responseFormat,
      timestamp: Date.now(),
      provider,
      model,
      tokenUsage
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
    perplexity: ['sonar', 'sonar-pro', 'sonar-reasoning'],
    deepseek: ['deepseek-coder', 'deepseek-chat'],
    grok: ['grok-3', 'grok-3-mini'],
    qwen: ['qwen-plus', 'qwen-turbo']
  };
  
  return models[provider] || [];
};