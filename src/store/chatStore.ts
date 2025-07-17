import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatThread, Workspace, ChatMessage, ChatState } from '../types/chat';
import { AIProvider } from '../types';
import { 
  saveWorkspaceToFirestore,
  updateWorkspaceInFirestore,
  getWorkspacesFromFirestore,
  deleteWorkspaceFromFirestore,
  saveThreadToFirestore,
  updateThreadInFirestore,
  getThreadsFromFirestore,
  deleteThreadFromFirestore
} from '../services/chatFirestore';
import { useAuthStore } from './authStore';

interface ChatStoreState extends ChatState {
  // Workspace actions
  createWorkspace: (name: string, description?: string) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  loadWorkspaces: () => Promise<void>;
  
  // Thread actions
  createThread: (title: string, workspaceId: string) => Promise<void>;
  updateThread: (id: string, updates: Partial<ChatThread>) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  setCurrentThread: (thread: ChatThread | null) => void;
  loadThreads: (workspaceId?: string) => Promise<void>;
  
  // Message actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  
  // UI state
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Model switching
  switchModel: (provider: AIProvider, model: string) => void;
}

const defaultWorkspace: Workspace = {
  id: '',
  userId: '',
  name: 'Default Workspace',
  systemPrompt: 'You are a helpful AI assistant.',
  provider: 'openai',
  model: 'gpt-4o',
  threads: [],
  createdAt: '',
  updatedAt: ''
};

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      currentWorkspace: null,
      currentThread: null,
      workspaces: [],
      threads: [],
      isLoading: false,
      error: null,
      
      // Workspace actions
      createWorkspace: async (name, description) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('User must be logged in');
        
        const workspace: Workspace = {
          id: '',
          userId: user.id,
          name,
          description,
          systemPrompt: 'You are a helpful AI assistant.',
          provider: 'openai',
          model: 'gpt-4o',
          threads: [],
          createdAt: '',
          updatedAt: ''
        };
        
        try {
          const id = await saveWorkspaceToFirestore(workspace);
          const savedWorkspace = { ...workspace, id };
          
          set(state => ({
            workspaces: [savedWorkspace, ...state.workspaces],
            currentWorkspace: savedWorkspace
          }));
        } catch (error) {
          throw new Error('Failed to create workspace');
        }
      },
      
      updateWorkspace: async (id, updates) => {
        const { workspaces, currentWorkspace } = get();
        const workspace = workspaces.find(w => w.id === id);
        if (!workspace) return;
        
        const updatedWorkspace = { ...workspace, ...updates };
        
        try {
          await updateWorkspaceInFirestore(id, updatedWorkspace);
          
          set(state => ({
            workspaces: state.workspaces.map(w => w.id === id ? updatedWorkspace : w),
            currentWorkspace: state.currentWorkspace?.id === id ? updatedWorkspace : state.currentWorkspace
          }));
        } catch (error) {
          throw new Error('Failed to update workspace');
        }
      },
      
      deleteWorkspace: async (id) => {
        try {
          await deleteWorkspaceFromFirestore(id);
          
          set(state => ({
            workspaces: state.workspaces.filter(w => w.id !== id),
            currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
            threads: state.threads.filter(t => t.workspaceId !== id)
          }));
        } catch (error) {
          throw new Error('Failed to delete workspace');
        }
      },
      
      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace });
        if (workspace) {
          get().loadThreads(workspace.id);
        }
      },
      
      loadWorkspaces: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          const workspaces = await getWorkspacesFromFirestore(user.id);
          set({ workspaces });
          
          // Set first workspace as current if none selected
          if (workspaces.length > 0 && !get().currentWorkspace) {
            get().setCurrentWorkspace(workspaces[0]);
          }
        } catch (error) {
          console.error('Failed to load workspaces:', error);
        }
      },
      
      // Thread actions
      createThread: async (title, workspaceId) => {
        const { user } = useAuthStore.getState();
        const { currentWorkspace } = get();
        if (!user || !currentWorkspace) throw new Error('User and workspace required');
        
        const thread: ChatThread = {
          id: '',
          workspaceId,
          userId: user.id,
          title,
          messages: [],
          provider: currentWorkspace.provider,
          model: currentWorkspace.model,
          createdAt: '',
          updatedAt: ''
        };
        
        try {
          const id = await saveThreadToFirestore(thread);
          const savedThread = { ...thread, id };
          
          set(state => ({
            threads: [savedThread, ...state.threads],
            currentThread: savedThread
          }));
        } catch (error) {
          throw new Error('Failed to create thread');
        }
      },
      
      updateThread: async (id, updates) => {
        const { threads, currentThread } = get();
        const thread = threads.find(t => t.id === id);
        if (!thread) return;
        
        const updatedThread = { ...thread, ...updates };
        
        try {
          await updateThreadInFirestore(id, updatedThread);
          
          set(state => ({
            threads: state.threads.map(t => t.id === id ? updatedThread : t),
            currentThread: state.currentThread?.id === id ? updatedThread : state.currentThread
          }));
        } catch (error) {
          throw new Error('Failed to update thread');
        }
      },
      
      deleteThread: async (id) => {
        try {
          await deleteThreadFromFirestore(id);
          
          set(state => ({
            threads: state.threads.filter(t => t.id !== id),
            currentThread: state.currentThread?.id === id ? null : state.currentThread
          }));
        } catch (error) {
          throw new Error('Failed to delete thread');
        }
      },
      
      setCurrentThread: (thread) => {
        set({ currentThread: thread });
      },
      
      loadThreads: async (workspaceId) => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          const threads = await getThreadsFromFirestore(user.id, workspaceId);
          set({ threads });
        } catch (error) {
          console.error('Failed to load threads:', error);
        }
      },
      
      // Message actions
      addMessage: (message) => {
        const { currentThread } = get();
        if (!currentThread) return;
        
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: Date.now()
        };
        
        const updatedThread = {
          ...currentThread,
          messages: [...currentThread.messages, newMessage]
        };
        
        set({ currentThread: updatedThread });
        
        // Save to Firestore
        get().updateThread(currentThread.id, { messages: updatedThread.messages });
      },
      
      updateMessage: (messageId, updates) => {
        const { currentThread } = get();
        if (!currentThread) return;
        
        const updatedMessages = currentThread.messages.map(msg =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
        
        const updatedThread = {
          ...currentThread,
          messages: updatedMessages
        };
        
        set({ currentThread: updatedThread });
        
        // Save to Firestore
        get().updateThread(currentThread.id, { messages: updatedMessages });
      },
      
      // UI state
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Model switching
      switchModel: (provider, model) => {
        const { currentWorkspace, currentThread } = get();
        
        if (currentWorkspace) {
          get().updateWorkspace(currentWorkspace.id, { provider, model });
        }
        
        if (currentThread) {
          get().updateThread(currentThread.id, { provider, model });
        }
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
        currentThread: state.currentThread
      })
    }
  )
);