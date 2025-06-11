import React, { useMemo, useState, useEffect } from 'react';
import { AIModelConfig, AIProvider } from '../../types';
import { getAvailableModels, fetchOllamaModels } from '../../services/apiService';
import { getProviderColor } from '../../utils/theme';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ModelSelectorProps {
  modelConfig: AIModelConfig;
  onChange: (config: Partial<AIModelConfig>) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  modelConfig, 
  onChange 
}) => {
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isLoadingOllama, setIsLoadingOllama] = useState(false);
  
  // Check if we're running locally
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  const availableModels = useMemo(() => {
    if (modelConfig.provider === 'ollama') {
      return ollamaModels.length > 0 ? ollamaModels : getAvailableModels('ollama');
    }
    return getAvailableModels(modelConfig.provider);
  }, [modelConfig.provider, ollamaModels]);
  
  const loadOllamaModels = async () => {
    if (!isLocalhost) return;
    
    setIsLoadingOllama(true);
    try {
      const models = await fetchOllamaModels();
      setOllamaModels(models);
      // If current model is not in the fetched list, select the first available
      if (models.length > 0 && !models.includes(modelConfig.model)) {
        onChange({ model: models[0] });
      }
    } catch (error) {
      console.warn('Failed to fetch Ollama models:', error);
    } finally {
      setIsLoadingOllama(false);
    }
  };
  
  useEffect(() => {
    if (modelConfig.provider === 'ollama' && isLocalhost) {
      loadOllamaModels();
    }
  }, [modelConfig.provider, isLocalhost]);
  
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as AIProvider;
    const models = provider === 'ollama' ? (isLocalhost ? ollamaModels : []) : getAvailableModels(provider);
    onChange({ 
      provider,
      model: models[0] || '' // Default to first model
    });
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ model: e.target.value });
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div>
        <select
          value={modelConfig.provider}
          onChange={handleProviderChange}
          className="select text-sm py-1.5"
        >
          <option value="openai">OpenAI</option>
          <option value="openrouter">OpenRouter</option>
          <option value="perplexity">Perplexity</option>
          <option value="deepseek">DeepSeek</option>
          <option value="grok">Grok</option>
          <option value="qwen">Qwen</option>
          <option value="ollama" disabled={!isLocalhost}>
            Local LLM (Ollama) {!isLocalhost && '(Local only)'}
          </option>
        </select>
      </div>
      
      <div className="flex items-center space-x-1">
        <select
          value={modelConfig.model}
          onChange={handleModelChange}
          className={`select text-sm py-1.5 ${getProviderColor(modelConfig.provider)}`}
          disabled={modelConfig.provider === 'ollama' && (isLoadingOllama || !isLocalhost)}
        >
          {availableModels.length > 0 ? (
            availableModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          ) : (
            <option value="">
              {modelConfig.provider === 'ollama' && !isLocalhost 
                ? 'Not available (deployed)' 
                : 'No models available'}
            </option>
          )}
        </select>
        
        {modelConfig.provider === 'ollama' && isLocalhost && (
          <button
            type="button"
            onClick={loadOllamaModels}
            disabled={isLoadingOllama}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh Ollama models"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingOllama ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        {modelConfig.provider === 'ollama' && !isLocalhost && (
          <div className="flex items-center text-amber-600 dark:text-amber-400" title="Ollama is only available when running locally">
            <AlertTriangle className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;