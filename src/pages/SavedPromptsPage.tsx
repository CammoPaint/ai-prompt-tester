import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePromptStore } from '../store/promptStore';
import SavedPromptsList from '../components/saved/SavedPromptsList';

const SavedPromptsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { loadPrompts } = usePromptStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      loadPrompts();
    }
  }, [isAuthenticated, loadPrompts]);
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Sign in to view saved prompts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be signed in to save and access your prompts.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Prompts</h1>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          New Prompt
        </button>
      </div>
      
      <SavedPromptsList />
    </div>
  );
};

export default SavedPromptsPage;