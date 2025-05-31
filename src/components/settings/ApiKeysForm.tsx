import React, { useState } from 'react';
import { Check, Eye, EyeOff, Key } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ApiKeys } from '../../types';

const ApiKeysForm: React.FC = () => {
  const { apiKeys, setApiKey, removeApiKey } = useAuthStore();
  const [formData, setFormData] = useState<ApiKeys>({ ...apiKeys });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  
  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'grok', name: 'Grok' },
    { id: 'qwen', name: 'Qwen' }
  ];
  
  const handleChange = (provider: keyof ApiKeys, value: string) => {
    setFormData({
      ...formData,
      [provider]: value
    });
    setSavedStatus({
      ...savedStatus,
      [provider]: false
    });
  };
  
  const handleToggleShow = (provider: string) => {
    setShowKeys({
      ...showKeys,
      [provider]: !showKeys[provider]
    });
  };
  
  const handleSave = (provider: keyof ApiKeys) => {
    if (formData[provider]?.trim()) {
      setApiKey(provider, formData[provider]!);
    } else {
      removeApiKey(provider);
      setFormData({
        ...formData,
        [provider]: ''
      });
    }
    
    setSavedStatus({
      ...savedStatus,
      [provider]: true
    });
    
    // Reset saved status after 3 seconds
    setTimeout(() => {
      setSavedStatus({
        ...savedStatus,
        [provider]: false
      });
    }, 3000);
  };
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-medium">API Keys</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add your API keys to test prompts with different providers.
            Your keys are stored securely in your browser and never sent to our servers.
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          {providers.map(({ id, name }) => (
            <div key={id} className="space-y-1">
              <label htmlFor={`api-key-${id}`} className="flex items-center">
                <Key className="w-4 h-4 mr-2" />
                <span className="label mb-0">{name} API Key</span>
              </label>
              
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    id={`api-key-${id}`}
                    type={showKeys[id] ? 'text' : 'password'}
                    value={formData[id as keyof ApiKeys] || ''}
                    onChange={(e) => handleChange(id as keyof ApiKeys, e.target.value)}
                    placeholder={`Enter your ${name} API key`}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleShow(id)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showKeys[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleSave(id as keyof ApiKeys)}
                  className={`btn ${
                    savedStatus[id]
                      ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
                      : 'btn-primary'
                  }`}
                  disabled={
                    (formData[id as keyof ApiKeys] || '') === (apiKeys[id as keyof ApiKeys] || '')
                  }
                >
                  {savedStatus[id] ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
              
              {id === 'openrouter' && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get your API key from the{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    OpenRouter dashboard
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiKeysForm;