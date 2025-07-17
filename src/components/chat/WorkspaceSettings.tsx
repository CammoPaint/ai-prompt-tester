import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Workspace } from '../../types/chat';
import { AIProvider } from '../../types';
import { getAvailableModels } from '../../services/apiService';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

interface WorkspaceSettingsProps {
  workspace: Workspace;
  onClose: () => void;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ workspace, onClose }) => {
  const { updateWorkspace } = useChatStore();
  const { apiKeys } = useAuthStore();
  const [formData, setFormData] = useState({
    name: workspace.name,
    systemPrompt: workspace.systemPrompt,
    provider: workspace.provider,
    model: workspace.model
  });
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  const availableModels = getAvailableModels(formData.provider);
  
  const handleProviderChange = (provider: AIProvider) => {
    const models = getAvailableModels(provider);
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
    <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Workspace Settings</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input text-sm"
            required
          />
        </div>
        
        <div>
          <label className="label">System Prompt</label>
          <textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            className="textarea text-sm font-mono"
            rows={3}
            placeholder="Define the AI's behavior and personality..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="select text-sm"
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
              className="select text-sm"
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
      
      <div className="flex space-x-2 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !formData.name.trim()}
          className="btn-primary text-sm flex-1 flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onClose}
          className="btn-outline text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;