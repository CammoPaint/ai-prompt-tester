import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { usePromptStore } from '../../store/promptStore';
import { useAuthStore } from '../../store/authStore';

const SavePromptButton: React.FC = () => {
  const { currentPrompt, savePrompt } = usePromptStore();
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  
  useEffect(() => {
    if (currentPrompt.id && currentPrompt.title) {
      setTitle(currentPrompt.title);
    } else {
      setTitle('');
    }
  }, [currentPrompt.id, currentPrompt.title]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  const handleSave = async () => {
    if (title.trim()) {
      try {
        await savePrompt(title);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to save prompt:', error);
      }
    }
  };
  
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        disabled={!currentPrompt.userPrompt.trim()}
      >
        <Save className="w-3 h-3 mr-1" />
        Save Prompt
      </button>
    );
  }
  
  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-1 animate-fade-in">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Prompt title"
        className="text-sm px-2 py-1 border-none focus:ring-0 bg-transparent"
        autoFocus
      />
      
      <button
        type="button"
        onClick={handleSave}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400"
        disabled={!title.trim()}
      >
        <Save className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          if (currentPrompt.id && currentPrompt.title) {
            setTitle(currentPrompt.title);
          }
        }}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SavePromptButton;