import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PromptState, AIResponse, SavedPrompt, ResponseFormat, AIModelConfig, AIProvider } from '../types';
import { savePromptToFirestore, deletePromptFromFirestore, getPromptsFromFirestore, updatePromptInFirestore } from '../services/firestore';
import { useAuthStore } from './authStore';

interface PromptStoreState {
  currentPrompt: PromptState;
  response: AIResponse | null;
  isLoading: boolean;
  error: string | null;
  savedPrompts: SavedPrompt[];
  
  setSystemPrompt: (prompt: string) => void;
  setUserPrompt: (prompt: string) => void;
  setResponseFormat: (format: ResponseFormat) => void;
  setModelConfig: (config: Partial<AIModelConfig>) => void;
  setResponse: (response: AIResponse | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetCurrentPrompt: () => void;
  
  savePrompt: (title: string) => Promise<void>;
  updateSavedPrompt: (id: string, updates: Partial<SavedPrompt>) => void;
  deleteSavedPrompt: (id: string) => Promise<void>;
  loadSavedPrompt: (id: string) => void;
  loadPrompts: () => Promise<void>;
}

const defaultModelConfig: AIModelConfig = {
  provider: 'openai',
  model: 'gpt-4o',
  temperature: 0.7,
  max_tokens: 2048
};

const initialPromptState: PromptState = {
  systemPrompt: '',
  userPrompt: '',
  responseFormat: 'markdown',
  modelConfig: defaultModelConfig
};

export const usePromptStore = create<PromptStoreState>()(
  persist(
    (set, get) => ({
      currentPrompt: initialPromptState,
      response: null,
      isLoading: false,
      error: null,
      savedPrompts: [],
      
      setSystemPrompt: (prompt) => 
        set((state) => ({
          currentPrompt: {
            ...state.currentPrompt,
            systemPrompt: prompt
          }
        })),
      
      setUserPrompt: (prompt) => 
        set((state) => ({
          currentPrompt: {
            ...state.currentPrompt,
            userPrompt: prompt
          }
        })),
      
      setResponseFormat: (format) => 
        set((state) => ({
          currentPrompt: {
            ...state.currentPrompt,
            responseFormat: format
          }
        })),
      
      setModelConfig: (config) => 
        set((state) => ({
          currentPrompt: {
            ...state.currentPrompt,
            modelConfig: {
              ...state.currentPrompt.modelConfig,
              ...config
            }
          }
        })),
      
      setResponse: (response) => 
        set({ response }),
      
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setError: (error) => 
        set({ error }),
      
      resetCurrentPrompt: () => 
        set({ 
          currentPrompt: initialPromptState,
          response: null,
          error: null 
        }),
      
      savePrompt: async (title) => {
        const { currentPrompt, response, savedPrompts } = get();
        const { user } = useAuthStore.getState();
        
        if (!user) {
          throw new Error('User must be logged in to save prompts');
        }
        
        // Find existing prompt with the same title
        const existingPrompt = savedPrompts.find(p => p.title === title);
        
        const promptData: SavedPrompt = {
          id: existingPrompt?.id,
          userId: user.id,
          title,
          systemPrompt: currentPrompt.systemPrompt.trim(),
          userPrompt: currentPrompt.userPrompt.trim(),
          provider: currentPrompt.modelConfig.provider,
          model: currentPrompt.modelConfig.model,
          response: response?.content ? response.content.trim() : undefined,
          tokenUsage: response?.tokenUsage,
          createdAt: existingPrompt?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        try {
          if (existingPrompt) {
            await updatePromptInFirestore(existingPrompt.id!, promptData);
          } else {
            await savePromptToFirestore(promptData);
          }
          await get().loadPrompts();
        } catch (error) {
          throw new Error('Failed to save prompt');
        }
      },
      
      updateSavedPrompt: (id, updates) => 
        set((state) => ({
          savedPrompts: state.savedPrompts.map(prompt => 
            prompt.id === id 
              ? { ...prompt, ...updates, updatedAt: new Date().toISOString() } 
              : prompt
          )
        })),
      
      deleteSavedPrompt: async (id) => {
        try {
          await deletePromptFromFirestore(id);
          set((state) => ({
            savedPrompts: state.savedPrompts.filter(prompt => prompt.id !== id)
          }));
        } catch (error) {
          throw new Error('Failed to delete prompt');
        }
      },
      
      loadSavedPrompt: (id) => {
        const { savedPrompts } = get();
        const promptToLoad = savedPrompts.find(p => p.id === id);
        
        if (promptToLoad) {
          set((state) => ({
            currentPrompt: {
              ...state.currentPrompt,
              systemPrompt: promptToLoad.systemPrompt,
              userPrompt: promptToLoad.userPrompt,
              modelConfig: {
                ...state.currentPrompt.modelConfig,
                provider: promptToLoad.provider,
                model: promptToLoad.model
              }
            },
            response: promptToLoad.response ? {
              content: promptToLoad.response,
              format: 'markdown',
              timestamp: Date.now(),
              provider: promptToLoad.provider,
              model: promptToLoad.model,
              tokenUsage: promptToLoad.tokenUsage || {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0
              }
            } : null,
            error: null
          }));
        }
      },
      
      loadPrompts: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        
        try {
          const prompts = await getPromptsFromFirestore(user.id);
          set({ savedPrompts: prompts });
        } catch (error) {
          console.error('Failed to load prompts:', error);
        }
      }
    }),
    {
      name: 'prompt-storage',
      partialize: (state) => ({ 
        savedPrompts: state.savedPrompts
      }),
    }
  )
);