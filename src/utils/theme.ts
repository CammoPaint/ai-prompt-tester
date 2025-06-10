import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export const useThemeEffect = () => {
  const { mode } = useThemeStore();
  
  useEffect(() => {
    // Apply theme to document
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);
};

export const getProviderColor = (provider: string): string => {
  const colors = {
    openai: 'text-emerald-600 dark:text-emerald-400',
    openrouter: 'text-orange-600 dark:text-orange-400',
    perplexity: 'text-violet-600 dark:text-violet-400',
    deepseek: 'text-blue-600 dark:text-blue-400',
    grok: 'text-pink-600 dark:text-pink-400',
    qwen: 'text-amber-600 dark:text-amber-400',
    ollama: 'text-green-600 dark:text-green-400',
  };
  
  return colors[provider as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
};

export const getProviderBgColor = (provider: string): string => {
  const colors = {
    openai: 'bg-emerald-100 dark:bg-emerald-900/30',
    openrouter: 'bg-orange-100 dark:bg-orange-900/30',
    perplexity: 'bg-violet-100 dark:bg-violet-900/30',
    deepseek: 'bg-blue-100 dark:bg-blue-900/30',
    grok: 'bg-pink-100 dark:bg-pink-900/30',
    qwen: 'bg-amber-100 dark:bg-amber-900/30',
    ollama: 'bg-green-100 dark:bg-green-900/30',
  };
  
  return colors[provider as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800';
};