import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Workspace } from '../../types/chat';
import { AIProvider } from '../../types';
import { getAvailableModels, getCombinedOpenRouterModels } from '../../services/apiService';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

interface WorkspaceSettingsProps {
  workspace: Workspace;
  onClose: () => void;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ workspace, onClose }) => {
  const { updateWorkspace } = useChatStore();
  const { apiKeys, customOpenRouterModels } = useAuthStore();
  const [formData, setFormData] = useState({
    name: workspace.name,
    systemPrompt: workspace.systemPrompt,
    provider: workspace.provider,
    model: workspace.model
  });
  const [isSaving, setIsSaving] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  // Check if we're running locally for Ollama availability
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'grok', name: 'Grok' },
    { id: 'qwen', name: 'Qwen' },
    ...(isLocalhost ? [{ id: 'ollama', name: 'Local LLM (Ollama)' }] : [])
  ];
  
  const availableModels = formData.provider === 'openrouter' 
    ? getCombinedOpenRouterModels(customOpenRouterModels)
    : getAvailableModels(formData.provider);
  
  const handleProviderChange = (provider: AIProvider) => {
    const models = provider === 'openrouter' 
      ? getCombinedOpenRouterModels(customOpenRouterModels)
      : getAvailableModels(provider);
    setFormData({
      ...formData,
      provider,
      model: models[0] || ''
    });
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateWorkspace(workspace.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update workspace:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workspace Settings</h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
      
      <div className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            required
          />
        </div>
        
        <div>
          <label className="label">System Prompt</label>
          <textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            className="textarea font-mono"
            rows={4}
            placeholder="Define the AI's behavior and personality..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="select"
            >
              {providers.map(provider => {
                const hasApiKey = provider.id === 'ollama' || apiKeys[provider.id as keyof typeof apiKeys];
                return (
                  <option 
                    key={provider.id} 
                    value={provider.id}
                    disabled={!hasApiKey}
                  >
                    {provider.name} {!hasApiKey && '(No API Key)'}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label className="label">Model</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="select"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
          <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;