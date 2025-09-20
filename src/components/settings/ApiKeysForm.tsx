import React, { useState } from 'react';
import { Check, Eye, EyeOff, Key, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ApiKeys } from '../../types';

const ApiKeysForm: React.FC = () => {
  const { 
    apiKeys, 
    setApiKey, 
    removeApiKey, 
    customOpenRouterModels, 
    addCustomOpenRouterModel, 
    removeCustomOpenRouterModel 
  } = useAuthStore();
  const [formData, setFormData] = useState<ApiKeys>({ ...apiKeys });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [customModelForm, setCustomModelForm] = useState({ name: '', modelId: '' });
  const [isAddingModel, setIsAddingModel] = useState(false);
  
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
  
  const handleAddCustomModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModelForm.name.trim() || !customModelForm.modelId.trim()) return;
    
    setIsAddingModel(true);
    try {
      await addCustomOpenRouterModel(customModelForm.name.trim(), customModelForm.modelId.trim());
      setCustomModelForm({ name: '', modelId: '' });
    } catch (error) {
      console.error('Failed to add custom model:', error);
    } finally {
      setIsAddingModel(false);
    }
  };
  
  const handleRemoveCustomModel = async (modelId: string) => {
    if (confirm('Are you sure you want to remove this custom model?')) {
      try {
        await removeCustomOpenRouterModel(modelId);
      } catch (error) {
        console.error('Failed to remove custom model:', error);
      }
    }
  };
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Firebase Configuration Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Firebase Configuration Required
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              To persist your API keys and custom models across sessions, you need to configure Firebase.
              Copy <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">.env.example</code> to <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">.env</code> and add your Firebase project credentials.
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              Without Firebase, your API keys will only be stored locally in your browser and custom models won't be available.
            </p>
          </div>
        </div>
      </div>

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
      
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-medium">Custom OpenRouter Models</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add your own OpenRouter models by specifying the model ID from the OpenRouter API.
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Add Custom Model Form */}
          <form onSubmit={handleAddCustomModel} className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Model Name</label>
                <input
                  type="text"
                  value={customModelForm.name}
                  onChange={(e) => setCustomModelForm({ ...customModelForm, name: e.target.value })}
                  placeholder="e.g., Claude 3.5 Sonnet"
                  className="input text-sm"
                  required
                />
              </div>
              <div>
                <label className="label">OpenRouter Model ID</label>
                <input
                  type="text"
                  value={customModelForm.modelId}
                  onChange={(e) => setCustomModelForm({ ...customModelForm, modelId: e.target.value })}
                  placeholder="e.g., anthropic/claude-3.5-sonnet"
                  className="input text-sm font-mono"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAddingModel || !customModelForm.name.trim() || !customModelForm.modelId.trim()}
              className="btn-primary text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              {isAddingModel ? 'Adding...' : 'Add Custom Model'}
            </button>
          </form>
          
          {/* Custom Models List */}
          {customOpenRouterModels.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Custom Models</h3>
              {customOpenRouterModels.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{model.modelId}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveCustomModel(model.id)}
                    className="p-2 text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 rounded"
                    title="Remove custom model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {customOpenRouterModels.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No custom models added yet.</p>
              <p className="text-xs mt-1">Add your first custom OpenRouter model above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeysForm;