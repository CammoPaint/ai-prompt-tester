import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AIResponse, AIProvider, SavedPrompt } from '../types';
import { sendPrompt } from '../services/apiService';
import { usePromptStore } from '../store/promptStore';
import { useAuthStore } from '../store/authStore';
import { getProviderColor } from '../utils/theme';
import { ArrowLeft, Loader2, Plus, X, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ComparisonColumn {
  provider: AIProvider | '';
  model: string;
  response?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseTime?: number;
  error?: string;
  isLoading?: boolean;
}

const ComparisonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prompt = location.state?.prompt as SavedPrompt;
  const { apiKeys } = useAuthStore();
  const [columns, setColumns] = useState<ComparisonColumn[]>([
    { provider: '', model: '' },
    { provider: '', model: '' }
  ]);

  if (!prompt) {
    return <Navigate to="/saved\" replace />;
  }

  const providers = [
    { id: 'openai' as AIProvider, name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'openrouter' as AIProvider, name: 'OpenRouter', models: ['perplexity/sonar', 'deepseek/deepseek-r1-0528:free', 'anthropic/claude-3.7-sonnet'] },
    { id: 'perplexity' as AIProvider, name: 'Perplexity', models: ['sonar', 'sonar-small', 'sonar-pro', 'sonar-deep-research'] },
    { id: 'deepseek' as AIProvider, name: 'DeepSeek', models: ['deepseek-coder', 'deepseek-chat'] },
    { id: 'grok' as AIProvider, name: 'Grok', models: ['grok-3', 'grok-3-mini'] },
    { id: 'qwen' as AIProvider, name: 'Qwen', models: ['qwen-plus', 'qwen-turbo'] }
  ];

  const handleProviderChange = (index: number, provider: AIProvider) => {
    setColumns(prev => prev.map((col, i) => 
      i === index ? { ...col, provider, model: '' } : col
    ));
  };

  const handleModelChange = (index: number, model: string) => {
    setColumns(prev => prev.map((col, i) => 
      i === index ? { ...col, model } : col
    ));
  };

  const addColumn = () => {
    setColumns(prev => [...prev, { provider: '', model: '' }]);
  };

  const removeColumn = (index: number) => {
    setColumns(prev => prev.filter((_, i) => i !== index));
  };

  const runComparison = async () => {
    const validColumns = columns.filter(col => col.provider && col.model);
    if (validColumns.length === 0) return;

    // Set loading state for all valid columns
    setColumns(prev => prev.map(col => 
      col.provider && col.model 
        ? { ...col, isLoading: true, error: undefined, response: undefined }
        : col
    ));

    // Run all API calls in parallel
    const promises = columns.map(async (col, index) => {
      if (!col.provider || !col.model) return null;

      try {
        const startTime = performance.now();
        const response = await sendPrompt({
          systemPrompt: prompt.systemPrompt,
          userPrompt: prompt.userPrompt,
          responseFormat: 'markdown',
          modelConfig: {
            provider: col.provider,
            model: col.model,
            temperature: 0.7,
            max_tokens: 2048
          }
        });
        const endTime = performance.now();

        // Update only this specific column
        setColumns(prev => prev.map((c, i) => 
          i === index ? {
            ...c,
            response: response.content,
            tokenUsage: response.tokenUsage,
            responseTime: Math.round(endTime - startTime) / 1000,
            isLoading: false
          } : c
        ));
      } catch (error) {
        // Update error state for this specific column
        setColumns(prev => prev.map((c, i) => 
          i === index ? {
            ...c,
            error: `Failed to get response from ${col.provider}`,
            isLoading: false
          } : c
        ));
      }
    });

    // Wait for all promises to complete
    await Promise.all(promises);
  };

  const canCompare = columns.some(col => col.provider && col.model);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/saved')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Compare Responses</h1>
        </div>
        <button
          onClick={addColumn}
          className="btn-outline flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </button>
      </div>

      <div className="flex space-x-4 mb-4 overflow-x-auto pb-4">
        {columns.map((column, index) => (
          <div key={index} className="flex-1 min-w-[300px]">
            <div className="card h-full">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Column {index + 1}</h3>
                  {columns.length > 2 && (
                    <button
                      onClick={() => removeColumn(index)}
                      className="p-1 text-gray-500 hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="label">Provider</label>
                    <select
                      value={column.provider}
                      onChange={(e) => handleProviderChange(index, e.target.value as AIProvider)}
                      className="select"
                    >
                      <option value="">Select Provider</option>
                      {providers.map(provider => (
                        <option 
                          key={provider.id} 
                          value={provider.id}
                          disabled={!apiKeys[provider.id]}
                        >
                          {provider.name} {!apiKeys[provider.id] && '(No API Key)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Model</label>
                    <select
                      value={column.model}
                      onChange={(e) => handleModelChange(index, e.target.value)}
                      className="select"
                      disabled={!column.provider}
                    >
                      <option value="">Select Model</option>
                      {column.provider && providers
                        .find(p => p.id === column.provider)
                        ?.models.map(model => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {column.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : column.error ? (
                  <div className="p-4 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 rounded-lg text-sm">
                    {column.error}
                  </div>
                ) : column.response ? (
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-2">
                        <span title="Input tokens" className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-primary-400 mr-1"></span>
                          {column.tokenUsage?.promptTokens}
                        </span>
                        <span title="Output tokens" className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-secondary-400 mr-1"></span>
                          {column.tokenUsage?.completionTokens}
                        </span>
                        <span title="Total tokens" className="flex items-center font-medium">
                          <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
                          {column.tokenUsage?.totalTokens}
                        </span>
                      </div>
                      {column.responseTime && (
                        <span title="Response time" className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {column.responseTime.toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {column.response}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {column.provider && column.model 
                      ? 'Ready to compare'
                      : 'Select provider and model'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={runComparison}
          disabled={!canCompare || columns.some(col => col.isLoading)}
          className="btn-primary min-w-[200px]"
        >
          {columns.some(col => col.isLoading) ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Comparing...
            </span>
          ) : (
            'Compare'
          )}
        </button>
      </div>
    </div>
  );
};

export default ComparisonPage;