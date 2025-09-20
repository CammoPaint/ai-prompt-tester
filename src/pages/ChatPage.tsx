import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import ChatLayout from '../components/chat/ChatLayout';

const ChatPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { loadWorkspaces } = useChatStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaces();
    }
  }, [isAuthenticated, loadWorkspaces]);
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Sign in to use Chat</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be signed in to access the chat feature with workspaces and threads.
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
  
  return <ChatLayout />;
};

export default ChatPage;