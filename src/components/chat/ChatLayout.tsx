import React, { useState } from 'react';
import { MessageSquare, Settings, Trash2, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import WorkspaceSelector from './WorkspaceSelector';
import ThreadList from './ThreadList';
import ChatInterface from './ChatInterface';
import WorkspaceSettings from './WorkspaceSettings';

const ChatLayout: React.FC = () => {
  const { currentWorkspace, deleteWorkspace } = useChatStore();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;
    
    if (confirm('Are you sure you want to delete this workspace? All threads will be lost.')) {
      try {
        await deleteWorkspace(currentWorkspace.id);
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }
  };
  
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Left Sidebar - ChatGPT Style */}
      <div className={`${
        sidebarOpen ? 'w-96' : 'w-0'
      } transition-all duration-300 overflow-hidden bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">AI Prompt Tester</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 md:hidden"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          {/* Workspace Selector */}
          <div className="mb-3">
            <WorkspaceSelector />
          </div>
          
          {/* Thread List */}
          <div className="flex-1 overflow-hidden">
            <ThreadList />
          </div>
        </div>
        
        {/* Workspace Actions - Bottom of Sidebar */}
        {currentWorkspace && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Workspace Settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button
                onClick={handleDeleteWorkspace}
                className="flex items-center justify-center px-3 py-2 bg-error-100 dark:bg-error-900/30 hover:bg-error-200 dark:hover:bg-error-900/50 text-error-600 dark:text-error-400 rounded-lg transition-colors"
                title="Delete Workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Chat Area - ChatGPT Style */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          {currentWorkspace ? (
            <ChatInterface />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Welcome to Chat</p>
                <p className="text-sm">Create a workspace to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Workspace Settings Modal */}
      {showSettings && currentWorkspace && (
        <WorkspaceSettings 
          workspace={currentWorkspace}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default ChatLayout;