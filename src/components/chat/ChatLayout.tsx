import React, { useState } from 'react';
import { MessageSquare, Settings, Plus, Menu, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import WorkspaceSelector from './WorkspaceSelector';
import ThreadList from './ThreadList';
import ChatInterface from './ChatInterface';
import WorkspaceSettings from './WorkspaceSettings';

const ChatLayout: React.FC = () => {
  const { currentWorkspace, currentThread } = useChatStore();
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-80' : 'w-0'
      } transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Workspace Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <WorkspaceSelector />
        </div>
        
        {showSettings && currentWorkspace && (
          <div className="border-b border-gray-200 dark:border-gray-800">
            <WorkspaceSettings 
              workspace={currentWorkspace}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          <ThreadList />
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold">
              {currentThread?.title || 'Select a thread'}
            </h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>
        
        {currentWorkspace && currentThread ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Welcome to Chat</p>
              <p className="text-sm">
                {!currentWorkspace 
                  ? 'Create a workspace to get started'
                  : 'Select or create a thread to begin chatting'
                }
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatLayout;