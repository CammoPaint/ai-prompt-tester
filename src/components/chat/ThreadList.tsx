import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X, Plus, AlertTriangle } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { getProviderColor } from '../../utils/theme';

const ThreadList: React.FC = () => {
  const { 
    threads, 
    currentThread, 
    currentWorkspace,
    setCurrentThread, 
    createThread, 
    deleteThread,
    updateThread
  } = useChatStore();
  
  // Filter threads by current workspace
  const workspaceThreads = threads.filter(thread => 
    thread.workspaceId === currentWorkspace?.id
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  
  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteConfirm) {
        cancelDeleteThread();
      }
    };
    
    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDeleteConfirm]);
  
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !currentWorkspace) return;
    
    setIsCreating(true);
    try {
      await createThread(newThreadTitle.trim(), currentWorkspace.id);
      setNewThreadTitle('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create thread:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreadToDelete(threadId);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteThread = async () => {
    if (!threadToDelete) return;
    
    try {
      await deleteThread(threadToDelete);
      setShowDeleteConfirm(false);
      setThreadToDelete(null);
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  };
  
  const cancelDeleteThread = () => {
    setShowDeleteConfirm(false);
    setThreadToDelete(null);
  };
  
  const handleEditThread = (thread: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThreadId(thread.id);
    setEditTitle(thread.title);
  };
  
  const handleSaveEdit = async (threadId: string) => {
    if (!editTitle.trim()) return;
    
    try {
      await updateThread(threadId, { title: editTitle.trim() });
      setEditingThreadId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update thread:', error);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditTitle('');
  };
  
  if (!currentWorkspace) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">Select a workspace to view threads</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">Threads</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {workspaceThreads.length}
          </span>
        </div>
        
        {/* Create New Thread */}
        {showCreateForm ? (
          <form onSubmit={handleCreateThread} className="space-y-2">
            <input
              type="text"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              placeholder="Thread title"
              className="input text-sm"
              autoFocus
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isCreating || !newThreadTitle.trim()}
                className="btn-primary text-sm flex-1"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewThreadTitle('');
                }}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Thread
          </button>
        )}
      </div>
      
      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {workspaceThreads.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No threads yet</p>
            <p className="text-xs">Create your first thread to start chatting</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {workspaceThreads.map(thread => (
              <div
                key={thread.id}
                onClick={() => setCurrentThread(thread)}
                className={`p-3 rounded-lg cursor-pointer group transition-colors ${
                  currentThread?.id === thread.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingThreadId === thread.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="input text-sm flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(thread.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(thread.id)}
                          className="p-1 text-success-600 hover:bg-success-100 dark:hover:bg-success-900/30 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{thread.title}</h4>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => handleEditThread(thread, e)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteThread(thread.id, e)}
                              className="p-1 text-error-500 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${getProviderColor(thread.provider)}`}>
                            {thread.provider} · {thread.model}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {thread.messages.length} messages
                          </span>
                        </div>
                        {thread.messages.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {thread.messages[thread.messages.length - 1].content.substring(0, 50)}...
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cancelDeleteThread}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Delete Thread
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this thread? This action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={cancelDeleteThread}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteThread}
                    className="px-4 py-2 text-sm font-medium text-white bg-error-600 hover:bg-error-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadList;