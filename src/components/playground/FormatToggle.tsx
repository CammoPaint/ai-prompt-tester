import React from 'react';
import { FileJson, FileText, PlusCircle, Save } from 'lucide-react';
import { usePromptStore } from '../../store/promptStore';
import { ResponseFormat } from '../../types';
import SavePromptButton from './SavePromptButton';

const FormatToggle: React.FC = () => {
  const { currentPrompt, setResponseFormat, resetCurrentPrompt } = usePromptStore();
  
  const handleFormatChange = (format: ResponseFormat) => {
    setResponseFormat(format);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
        <button
          type="button"
          onClick={() => handleFormatChange('markdown')}
          className={`flex items-center text-xs px-2 py-1 rounded ${
            currentPrompt.responseFormat === 'markdown' 
              ? 'bg-white dark:bg-gray-700 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FileText className="w-3 h-3 mr-1" />
          Markdown
        </button>
        <button
          type="button"
          onClick={() => handleFormatChange('json')}
          className={`flex items-center text-xs px-2 py-1 rounded ${
            currentPrompt.responseFormat === 'json' 
              ? 'bg-white dark:bg-gray-700 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FileJson className="w-3 h-3 mr-1" />
          JSON
        </button>
      </div>
      
      <button
        type="button"
        onClick={resetCurrentPrompt}
        className="flex items-center text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <PlusCircle className="w-3 h-3 mr-1" />
        New Prompt
      </button>

      <SavePromptButton />
    </div>
  );
};

export default FormatToggle;