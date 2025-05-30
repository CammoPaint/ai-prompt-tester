import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ApiKeys } from '../types';
import { saveApiKeys, getApiKeys } from '../services/firestore';

interface AuthState {
  user: User | null;
  apiKeys: ApiKeys;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => Promise<void>;
  removeApiKey: (provider: keyof ApiKeys) => Promise<void>;
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
        } else {
          set({ apiKeys: {} });
        }
      },
      
      setApiKey: async (provider, key) => {
        const { user, apiKeys } = get();
        if (!user) return;
        
        const updatedKeys = {
          ...apiKeys,
          [provider]: key
        };
        
        await saveApiKeys(user.id, updatedKeys);
        set({ apiKeys: updatedKeys });
      },
      
      removeApiKey: async (provider) => {
        const { user, apiKeys } = get();
        if (!user) return;
        
        const updatedKeys = { ...apiKeys };
        delete updatedKeys[provider];
        
        await saveApiKeys(user.id, updatedKeys);
        set({ apiKeys: updatedKeys });
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
          error: null 
        }),
      
      loadApiKeys: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const apiKeys = await getApiKeys(user.id);
          set({ apiKeys });
        } catch (error) {
          console.error('Failed to load API keys:', error);
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