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
  const [isResponseFullscreen, setIsResponseFullscreen] = useState(false);
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
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-6rem)]">
        {/* Left Panel - System Prompt */}
        <div className="flex flex-col">
          <div className="mb-4">
            <ModelSelector 
              modelConfig={currentPrompt.modelConfig}
              onChange={(config) => usePromptStore.getState().setModelConfig(config)}
            />
          </div>
          <div className="flex-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="h-full flex flex-col">
              <label className="label mb-2">System Prompt</label>
              <div className="flex-1 overflow-auto">
                <textarea
                  value={currentPrompt.systemPrompt}
                  onChange={(e) => usePromptStore.getState().setSystemPrompt(e.target.value)}
                  className="textarea font-mono text-sm w-full h-full resize-none"
                  placeholder="Describe desired model behavior (tone, tool usage, response style)"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - User Prompt and Response */}
        <div className="flex flex-col">
          {/* User Prompt */}
          <div className="mb-4 flex items-center justify-between">
            <FormatToggle />
          </div>
          <div className="flex-1 grid grid-rows-2 gap-4">
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="h-full flex flex-col">
                <label className="label mb-2">User Prompt</label>
                <div className="flex-1 overflow-auto">
                  <textarea
                    value={currentPrompt.userPrompt}
                    onChange={(e) => usePromptStore.getState().setUserPrompt(e.target.value)}
                    className="textarea font-mono text-sm w-full h-full resize-none"
                    placeholder="Write your prompt here..."
                  />
                </div>
                <button
                  onClick={handleSubmitPrompt}
                  disabled={!currentPrompt.userPrompt.trim()}
                  className="btn-primary mt-4"
                >
                  Submit
                </button>
              </div>
            </div>
            
            {/* Response */}
            {isResponseFullscreen ? (
              <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 p-6 overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Response</h2>
                  <button
                    onClick={() => setIsResponseFullscreen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <ResponseViewer isExpanded={true} />
              </div>
            ) : (
              <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-semibold">Response</h2>
                  <button
                    onClick={() => setIsResponseFullscreen(true)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Expand"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6"></path>
                      <path d="M9 21H3v-6"></path>
                      <path d="M21 3l-7 7"></path>
                      <path d="M3 21l7-7"></path>
                    </svg>
                  </button>
                </div>
                <div className="h-[200px] overflow-auto">
                  <ResponseViewer isExpanded={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;