import React, { useState } from 'react';
import { PlusCircle, MessageSquare, Bot, Loader2 } from 'lucide-react';
import { sendPrompt } from '../services/apiService';
import { usePromptStore } from '../store/promptStore';
import { useAuthStore } from '../store/authStore';
import ResponseViewer from '../components/playground/ResponseViewer';
import FormatToggle from '../components/playground/FormatToggle';
import SavePromptButton from '../components/playground/SavePromptButton';
import ModelSelector from '../components/playground/ModelSelector';

type TabType = 'prompt' | 'response';

const PlaygroundPage: React.FC = () => {
  const {
    currentPrompt,
    response,
    isLoading,
    setResponse,
    setLoading,
    setError,
    resetCurrentPrompt
  } = usePromptStore();
  const [activeTab, setActiveTab] = useState<TabType>('prompt');
  const { apiKeys } = useAuthStore();
  
  const handleSubmitPrompt = async () => {
    const { provider } = currentPrompt.modelConfig;
    
    // Skip API key check for Ollama since it runs locally
    if (provider !== 'ollama' && !apiKeys[provider]) {
      setError(`Please set your ${provider} API key in the settings`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sendPrompt(currentPrompt);
      setResponse(response);
      // Auto-switch to response tab when we get a response
      setActiveTab('response');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      // Switch to response tab to show the error
      setActiveTab('response');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header with Model Selector and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Playground</h1>
          <ModelSelector 
            modelConfig={currentPrompt.modelConfig}
            onChange={(config) => usePromptStore.getState().setModelConfig(config)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <FormatToggle />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'prompt'
              ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Prompts
        </button>
        <button
          onClick={() => setActiveTab('response')}
          className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'response'
              ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Bot className="w-4 h-4 mr-2" />
          Response
          {response && (
            <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {activeTab === 'prompt' ? (
          <div className="h-full p-6 flex flex-col">
            <div className="grid grid-cols-2 gap-6 flex-1">
              {/* System Prompt */}
              <div className="flex flex-col">
                <label className="label mb-3">System Prompt</label>
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={currentPrompt.systemPrompt}
                    onChange={(e) => usePromptStore.getState().setSystemPrompt(e.target.value)}
                    className="textarea font-mono text-sm flex-1 resize-none"
                    placeholder="Describe desired model behavior (tone, tool usage, response style)..."
                  />
                </div>
              </div>
              
              {/* User Prompt */}
              <div className="flex flex-col">
                <label className="label mb-3">User Prompt</label>
                <textarea
                  value={currentPrompt.userPrompt}
                  onChange={(e) => usePromptStore.getState().setUserPrompt(e.target.value)}
                  className="textarea font-mono text-sm flex-1 resize-none"
                  placeholder="Write your prompt here..."
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-center mt-6 flex-shrink-0">
              <button
                onClick={handleSubmitPrompt}
                disabled={!currentPrompt.userPrompt.trim() || isLoading}
                className="btn-primary px-8"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full p-6">
            <div className="h-full overflow-auto">
              <ResponseViewer isExpanded={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaygroundPage;