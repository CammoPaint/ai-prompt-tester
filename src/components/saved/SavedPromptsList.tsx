import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { usePromptStore } from '../../store/promptStore';
import { getProviderColor, getProviderBgColor } from '../../utils/theme';

const SavedPromptsList: React.FC = () => {
  const { savedPrompts, loadSavedPrompt, deleteSavedPrompt } = usePromptStore();
  const navigate = useNavigate();
  
  if (savedPrompts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">
          You don't have any saved prompts yet.
        </p>
      </div>
    );
  }
  
  const handleLoadPrompt = (promptId: string) => {
    loadSavedPrompt(promptId);
    navigate('/');
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {savedPrompts.map((prompt) => {
        const providerColor = getProviderColor(prompt.provider);
        const providerBg = getProviderBgColor(prompt.provider);
        const date = new Date(prompt.updatedAt);
        
        return (
          <div
            key={prompt.id}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg line-clamp-1">{prompt.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`${providerBg} ${providerColor} text-xs px-2 py-0.5 rounded capitalize`}>
                    {prompt.provider}
                  </span>
                  {prompt.tokenUsage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {prompt.tokenUsage.totalTokens} tokens
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                {prompt.userPrompt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{date.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{date.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 flex">
              <button
                onClick={() => handleLoadPrompt(prompt.id!)}
                className="flex-1 py-2 text-sm text-center font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Load Prompt
              </button>
              <div className="w-px bg-gray-200 dark:bg-gray-800" />
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this prompt?')) {
                    deleteSavedPrompt(prompt.id!);
                  }
                }}
                className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-error-600 dark:hover:text-error-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SavedPromptsList;