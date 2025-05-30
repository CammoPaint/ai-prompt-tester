import React, { useState } from 'react';
import { Book, SendHorizontal } from 'lucide-react';
import { usePromptStore } from '../../store/promptStore';
import { AIModelConfig } from '../../types';
import ModelSelector from './ModelSelector';

interface PromptEditorProps {
  onSubmit: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ onSubmit }) => {
  const { 
    currentPrompt, 
    setSystemPrompt, 
    setUserPrompt, 
    setModelConfig,
    isLoading 
  } = usePromptStore();
  
  const [showSystemPrompt, setShowSystemPrompt] = useState(!!currentPrompt.systemPrompt);
  
  const handleModelConfigChange = (config: Partial<AIModelConfig>) => {
    setModelConfig(config);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Prompt</h2>
          <button
            type="button"
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className={`ml-3 flex items-center text-xs px-2 py-1 rounded ${
              showSystemPrompt 
                ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <Book className="w-3 h-3 mr-1" />
            System Prompt {showSystemPrompt ? '(visible)' : '(hidden)'}
          </button>
        </div>
        
        <ModelSelector 
          modelConfig={currentPrompt.modelConfig}
          onChange={handleModelConfigChange}
        />
      </div>
      
      {showSystemPrompt && (
        <div className="mb-4 animate-slide-down">
          <label htmlFor="systemPrompt" className="label">
            System Prompt
          </label>
          <textarea
            id="systemPrompt"
            value={currentPrompt.systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="textarea font-mono text-sm"
            placeholder="You are a helpful assistant..."
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <label htmlFor="userPrompt" className="label">
          User Prompt
        </label>
        <div className="relative flex-1 flex flex-col">
          <textarea
            id="userPrompt"
            value={currentPrompt.userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="textarea font-mono text-sm flex-1"
            placeholder="Write your prompt here..."
            required
          />
          
          <div className="absolute bottom-3 right-3">
            <button
              type="submit"
              disabled={isLoading || !currentPrompt.userPrompt.trim()}
              className="btn-primary flex items-center space-x-1"
            >
              <span>Submit</span>
              <SendHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PromptEditor;