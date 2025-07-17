import React, { useState } from 'react';
import { Plus, ChevronDown, Folder, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

const WorkspaceSelector: React.FC = () => {
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    createWorkspace, 
    deleteWorkspace 
  } = useChatStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    setIsCreating(true);
    try {
      await createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteWorkspace = async (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workspace? All threads will be lost.')) {
      try {
        await deleteWorkspace(workspaceId);
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }
  };
  
  return (
    <div className="space-y-2">
      {/* Current Workspace Display */}
      {currentWorkspace && (
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <Folder className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-primary-900 dark:text-primary-100 truncate">
                  {currentWorkspace.name}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          </div>
        </div>
      )}
      
      {/* Workspace List */}
      {workspaces.length > 1 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {workspaces
            .filter(w => w.id !== currentWorkspace?.id)
            .map(workspace => (
              <div
                key={workspace.id}
                onClick={() => setCurrentWorkspace(workspace)}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group"
              >
                <div className="flex items-center min-w-0">
                  <Folder className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{workspace.name}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error-100 dark:hover:bg-error-900/30 text-error-600 dark:text-error-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      )}
      
      {/* Create New Workspace */}
      {showCreateForm ? (
        <form onSubmit={handleCreateWorkspace} className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Workspace name"
            className="input text-sm"
            autoFocus
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isCreating || !newWorkspaceName.trim()}
              className="btn-primary text-sm flex-1"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewWorkspaceName('');
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
          className="w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </button>
      )}
    </div>
  );
};

export default WorkspaceSelector;