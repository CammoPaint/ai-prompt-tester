import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ApiKeys, CustomOpenRouterModel } from '../types';
import { 
  saveApiKeys, 
  getApiKeys, 
  saveCustomOpenRouterModel, 
  getCustomOpenRouterModels, 
  deleteCustomOpenRouterModel 
} from '../services/firestore';

interface AuthState {
  user: User | null;
  apiKeys: ApiKeys;
  customOpenRouterModels: CustomOpenRouterModel[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => Promise<void>;
  removeApiKey: (provider: keyof ApiKeys) => Promise<void>;
  addCustomOpenRouterModel: (name: string, modelId: string) => Promise<void>;
  removeCustomOpenRouterModel: (modelId: string) => Promise<void>;
  loadCustomOpenRouterModels: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  loadApiKeys: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      apiKeys: {},
      customOpenRouterModels: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
        
        // Load API keys when user logs in
        if (user) {
          get().loadApiKeys();
          get().loadCustomOpenRouterModels();
        } else {
          set({ apiKeys: {}, customOpenRouterModels: [] });
        }
      },
      
      setApiKey: async (provider, key) => {
        const { user, apiKeys } = get();
        if (!user) return;
        
        const updatedKeys = {
          ...apiKeys,
          [provider]: key
        };
        
        try {
          await saveApiKeys(user.id, updatedKeys);
          set({ apiKeys: updatedKeys });
        } catch (error: any) {
          console.error('Failed to save API key:', error);
          if (error.message?.includes('Firestore is not configured')) {
            console.warn('Firebase/Firestore is not configured. API key will not be persisted.');
            // Still update local state even if Firebase is not available
            set({ apiKeys: updatedKeys });
          } else {
            throw error;
          }
        }
      },
      
      removeApiKey: async (provider) => {
        const { user, apiKeys } = get();
        if (!user) return;
        
        const updatedKeys = { ...apiKeys };
        delete updatedKeys[provider];
        
        try {
          await saveApiKeys(user.id, updatedKeys);
          set({ apiKeys: updatedKeys });
        } catch (error: any) {
          console.error('Failed to remove API key:', error);
          if (error.message?.includes('Firestore is not configured')) {
            console.warn('Firebase/Firestore is not configured. API key removal will not be persisted.');
            // Still update local state even if Firebase is not available
            set({ apiKeys: updatedKeys });
          } else {
            throw error;
          }
        }
      },
      
      addCustomOpenRouterModel: async (name, modelId) => {
        const { user } = get();
        if (!user) return;
        
        try {
          const id = await saveCustomOpenRouterModel(user.id, { name, modelId });
          const newModel = { id, name, modelId };
          
          set(state => ({
            customOpenRouterModels: [...state.customOpenRouterModels, newModel]
          }));
        } catch (error) {
          console.error('Failed to add custom OpenRouter model:', error);
          throw error;
        }
      },
      
      removeCustomOpenRouterModel: async (modelId) => {
        const { user } = get();
        if (!user) return;
        
        try {
          await deleteCustomOpenRouterModel(user.id, modelId);
          
          set(state => ({
            customOpenRouterModels: state.customOpenRouterModels.filter(model => model.id !== modelId)
          }));
        } catch (error) {
          console.error('Failed to remove custom OpenRouter model:', error);
          throw error;
        }
      },
      
      loadCustomOpenRouterModels: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const models = await getCustomOpenRouterModels(user.id);
          set({ customOpenRouterModels: models });
        } catch (error: any) {
          console.error('Failed to load custom OpenRouter models:', error);
          // If Firebase is not configured, don't show error to user
          if (error.message?.includes('Firestore is not configured')) {
            console.warn('Firebase/Firestore is not configured. Custom OpenRouter models will not be available.');
            set({ customOpenRouterModels: [] });
          } else {
            // For other errors, you might want to show a user-friendly message
            set({ error: 'Failed to load custom OpenRouter models. Please check your connection.' });
          }
        }
      },
      
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setError: (error) => 
        set({ error }),
      
      logout: () => 
        set({ 
          user: null, 
          isAuthenticated: false,
          apiKeys: {},
          customOpenRouterModels: [],
          error: null 
        }),
      
      loadApiKeys: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const apiKeys = await getApiKeys(user.id);
          set({ apiKeys });
        } catch (error: any) {
          console.error('Failed to load API keys:', error);
          // If Firebase is not configured, don't show error to user
          if (error.message?.includes('Firestore is not configured')) {
            console.warn('Firebase/Firestore is not configured. API keys will not be persisted.');
            set({ apiKeys: {} });
          } else {
            // For other errors, you might want to show a user-friendly message
            set({ error: 'Failed to load API keys. Please check your connection.' });
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);