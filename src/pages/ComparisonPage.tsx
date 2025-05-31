import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AIResponse, AIProvider, SavedPrompt } from '../types';
import { sendPrompt } from '../services/apiService';
import { usePromptStore } from '../store/promptStore';
import { useAuthStore } from '../store/authStore';
import { getProviderColor } from '../utils/theme';
import { ArrowLeft, Loader2, Plus, X, Clock, FileJson, FileText, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useThemeStore } from '../store/themeStore';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ComparisonColumn {
  provider: AIProvider | '';
  model: string;
  response: AIResponse | null;
  error: string | null;
  isLoading: boolean;
  isExpanded: boolean;
  viewFormat: 'formatted' | 'raw';
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseTime?: number;
}

interface ProviderOption {
  id: AIProvider;
  name: string;
  models: string[];
}

const providers: ProviderOption[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-3.5-turbo'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-2', 'claude-instant-1'],
  },
];

const ComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useThemeStore();
  const { apiKeys } = useAuthStore();
  const { currentPrompt } = usePromptStore();

  const [columns, setColumns] = useState<ComparisonColumn[]>([
    {
      provider: '',
      model: '',
      response: null,
      error: null,
      isLoading: false,
      isExpanded: false,
      viewFormat: 'formatted',
    },
    {
      provider: '',
      model: '',
      response: null,
      error: null,
      isLoading: false,
      isExpanded: false,
      viewFormat: 'formatted',
    },
  ]);

  const addColumn = () => {
    setColumns(prev => [
      ...prev,
      {
        provider: '',
        model: '',
        response: null,
        error: null,
        isLoading: false,
        isExpanded: false,
        viewFormat: 'formatted',
      },
    ]);
  };

  const removeColumn = (index: number) => {
    setColumns(prev => prev.filter((_, i) => i !== index));
  };

  const toggleExpand = (index: number) => {
    setColumns(prev => prev.map((col, i) => ({
      ...col,
      isExpanded: i === index ? !col.isExpanded : false,
    })));
  };

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

  const toggleViewFormat = (index: number) => {
    setColumns(prev => prev.map((col, i) => 
      i === index ? {
        ...col,
        viewFormat: col.viewFormat === 'formatted' ? 'raw' : 'formatted',
      } : col
    ));
  };

  const renderResponse = (column: ComparisonColumn) => {
    if (!column.response) return null;

    if (column.viewFormat === 'raw') {
      return (
        <SyntaxHighlighter
          language="json"
          style={isDarkMode ? oneDark : oneLight}
          className="rounded-lg text-sm"
        >
          {JSON.stringify(column.response, null, 2)}
        </SyntaxHighlighter>
      );
    }

    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  language={match[1]}
                  style={isDarkMode ? oneDark : oneLight}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {column.response.content}
        </ReactMarkdown>
      </div>
    );
  };

  const canCompare = columns.every(col => col.provider && col.model) && !columns.some(col => col.isLoading);

  const runComparison = async () => {
    if (!currentPrompt) return;

    const startTime = Date.now();

    setColumns(prev => prev.map(col => ({
      ...col,
      isLoading: true,
      error: null,
      response: null,
    })));

    try {
      const responses = await Promise.all(
        columns.map(async col => {
          if (!col.provider || !col.model) {
            throw new Error('Provider and model must be selected');
          }

          const response = await sendPrompt({
            provider: col.provider,
            model: col.model,
            prompt: currentPrompt.content,
            temperature: currentPrompt.temperature,
          });

          return {
            response,
            responseTime: (Date.now() - startTime) / 1000,
          };
        })
      );

      setColumns(prev => prev.map((col, i) => ({
        ...col,
        isLoading: false,
        response: responses[i].response,
        responseTime: responses[i].responseTime,
        error: null,
      })));
    } catch (error) {
      setColumns(prev => prev.map(col => ({
        ...col,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      })));
    }
  };

  if (!currentPrompt) {
    return <Navigate to="/playground" replace />;
  }

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
          <div 
            key={index} 
            className={`flex-1 min-w-[300px] ${
              column.isExpanded ? 'fixed inset-4 z-50 min-w-0 bg-white dark:bg-gray-900 rounded-lg shadow-2xl' : ''
            }`}
          >
            <div className={`card h-full ${
              column.isExpanded ? 'flex flex-col' : ''
            }`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">Column {index + 1}</h3>
                    <button
                      onClick={() => toggleExpand(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title={column.isExpanded ? "Collapse" : "Expand"}
                    >
                      {column.isExpanded ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {columns.length > 2 && !column.isExpanded && (
                    <button
                      onClick={() => removeColumn(index)}
                      className="p-1 text-gray-500 hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {column.isExpanded && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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

              <div className={`p-4 ${column.isExpanded ? 'flex-1 overflow-auto' : ''}`}>
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
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
                        {column.responseTime && (
                          <span title="Response time" className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {column.responseTime.toFixed(1)}s
                          </span>
                        )}
                      </div>
                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
                        <button
                          onClick={() => toggleViewFormat(index)}
                          className={`flex items-center text-xs px-2 py-0.5 rounded ${
                            column.viewFormat === 'formatted'
                              ? 'bg-white dark:bg-gray-700 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {column.viewFormat === 'formatted' ? (
                            <>
                              <FileText className="w-3 h-3 mr-1" />
                              Formatted
                            </>
                          ) : (
                            <>
                              <FileJson className="w-3 h-3 mr-1" />
                              Raw
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {renderResponse(column)}
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