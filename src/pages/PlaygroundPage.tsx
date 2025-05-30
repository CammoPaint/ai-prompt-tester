import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { sendPrompt } from '../services/apiService';
import { usePromptStore } from '../store/promptStore';
import { useAuthStore } from '../store/authStore';
import ResponseViewer from '../components/playground/ResponseViewer';
import FormatToggle from '../components/playground/FormatToggle';
import SavePromptButton from '../components/playground/SavePromptButton';
import ModelSelector from '../components/playground/ModelSelector';

const PlaygroundPage: React.FC = () => {
  const { 
    currentPrompt, 
    setResponse, 
    setLoading, 
    setError,
    resetCurrentPrompt 
  } = usePromptStore();
  const { apiKeys } = useAuthStore();
  
  const handleSubmitPrompt = async () => {
    const { provider } = currentPrompt.modelConfig;
    
    if (!apiKeys[provider]) {
      setError(`Please set your ${provider} API key in the settings`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sendPrompt(currentPrompt);
      setResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Left Panel - System Prompt */}
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <ModelSelector 
              modelConfig={currentPrompt.modelConfig}
              onChange={(config) => usePromptStore.getState().setModelConfig(config)}
            />
          </div>
          <div className="flex-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="h-full flex flex-col">
              <label className="label mb-2">System Prompt</label>
              <textarea
                value={currentPrompt.systemPrompt}
                onChange={(e) => usePromptStore.getState().setSystemPrompt(e.target.value)}
                className="textarea font-mono text-sm flex-1"
                placeholder="Describe desired model behavior (tone, tool usage, response style)"
              />
            </div>
          </div>
        </div>
        
        {/* Right Panel - User Prompt and Response */}
        <div className="h-full grid grid-rows-2 gap-4">
          {/* User Prompt */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <FormatToggle />
            </div>
            <div className="flex-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="h-full flex flex-col">
                <label className="label mb-2">User Prompt</label>
                <textarea
                  value={currentPrompt.userPrompt}
                  onChange={(e) => usePromptStore.getState().setUserPrompt(e.target.value)}
                  className="textarea font-mono text-sm flex-1"
                  placeholder="Write your prompt here..."
                />
                <button
                  onClick={handleSubmitPrompt}
                  disabled={!currentPrompt.userPrompt.trim()}
                  className="btn-primary mt-4"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
          
          {/* Response */}
          <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
            <ResponseViewer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;