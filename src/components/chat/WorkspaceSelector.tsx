import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Folder, Plus } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

const WorkspaceSelector: React.FC = () => {
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    createWorkspace
  } = useChatStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
  
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Workspace Dropdown Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center min-w-0">
          <Folder className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {/* Workspace List */}
            {workspaces.map(workspace => (
              <div
                key={workspace.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <Folder className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <button
                    onClick={() => {
                      setCurrentWorkspace(workspace);
                      setShowDropdown(false);
                    }}
                    className="text-left text-sm font-medium text-gray-900 dark:text-gray-100 truncate hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {workspace.name}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Divider */}
            {workspaces.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            )}
            
            {/* Create New Workspace */}
            {showCreateForm ? (
              <div className="px-3 py-2">
                <form onSubmit={handleCreateWorkspace} className="space-y-2">
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace name"
                    className="input text-sm w-full"
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
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;