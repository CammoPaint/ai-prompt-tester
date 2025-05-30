import React, { useMemo } from 'react';
import { AIModelConfig, AIProvider } from '../../types';
import { getAvailableModels } from '../../services/apiService';
import { getProviderColor } from '../../utils/theme';

interface ModelSelectorProps {
  modelConfig: AIModelConfig;
  onChange: (config: Partial<AIModelConfig>) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  modelConfig, 
  onChange 
}) => {
  const availableModels = useMemo(() => 
    getAvailableModels(modelConfig.provider), 
    [modelConfig.provider]
  );
  
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as AIProvider;
    const models = getAvailableModels(provider);
    onChange({ 
      provider,
      model: models[0] // Default to first model
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
          <option value="perplexity">Perplexity</option>
          <option value="deepseek">DeepSeek</option>
          <option value="grok">Grok</option>
          <option value="qwen">Qwen</option>
        </select>
      </div>
      
      <div>
        <select
          value={modelConfig.model}
          onChange={handleModelChange}
          className={`select text-sm py-1.5 ${getProviderColor(modelConfig.provider)}`}
        >
          {availableModels.map(model => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ModelSelector;