import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AIResponse, AIProvider, SavedPrompt } from '../types';
import { sendPrompt } from '../services/apiService';
import { usePromptStore } from '../store/promptStore';
import { useAuthStore } from '../store/authStore';
import { getProviderColor } from '../utils/theme';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface ComparisonResult {
  provider: AIProvider;
  model: string;
  response: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const ComparisonPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prompt = location.state?.prompt as SavedPrompt;
  const { apiKeys } = useAuthStore();
  const [selectedProviders, setSelectedProviders] = useState<Array<{ provider: AIProvider; model: string }>>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!prompt) {
    return <Navigate to="/saved\" replace />;
  }

  const providers = [
    { id: 'openai' as AIProvider, name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'perplexity' as AIProvider, name: 'Perplexity', models: ['sonar', 'sonar-pro', 'sonar-reasoning'] },
    { id: 'deepseek' as AIProvider, name: 'DeepSeek', models: ['deepseek-coder', 'deepseek-chat'] },
    { id: 'grok' as AIProvider, name: 'Grok', models: ['grok-3', 'grok-3-mini'] },
    { id: 'qwen' as AIProvider, name: 'Qwen', models: ['qwen-plus', 'qwen-turbo'] }
  ];

  const handleAddProvider = (provider: AIProvider, model: string) => {
    setSelectedProviders(prev => [...prev, { provider, model }]);
  };

  const handleRemoveProvider = (index: number) => {
    setSelectedProviders(prev => prev.filter((_, i) => i !== index));
  };

  const runComparison = async () => {
    setIsLoading(true);
    setError(null);
    const newResults: ComparisonResult[] = [];

    for (const { provider, model } of selectedProviders) {
      try {
        const response = await sendPrompt({
          systemPrompt: prompt.systemPrompt,
          userPrompt: prompt.userPrompt,
          responseFormat: 'markdown',
          modelConfig: {
            provider,
            model,
            temperature: 0.7,
            max_tokens: 2048
          }
        });

        newResults.push({
          provider,
          model,
          response: response.content,
          tokenUsage: response.tokenUsage
        });
      } catch (error) {
        setError(`Failed to get response from ${provider}`);
        break;
      }
    }

    setResults(newResults);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/saved')}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Compare Responses</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="card p-4 mb-4">
            <h2 className="text-lg font-semibold mb-4">Select Providers</h2>
            <div className="space-y-4">
              {providers.map(provider => (
                <div key={provider.id} className="space-y-2">
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${getProviderColor(provider.id)}`}>
                      {provider.name}
                    </span>
                    {!apiKeys[provider.id] && (
                      <span className="ml-2 text-xs text-error-600 dark:text-error-400">
                        (API key not set)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {provider.models.map(model => (
                      <button
                        key={model}
                        onClick={() => handleAddProvider(provider.id, model)}
                        disabled={!apiKeys[provider.id] || selectedProviders.some(p => p.provider === provider.id && p.model === model)}
                        className="btn-outline text-xs py-1"
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Selected Models</h2>
            {selectedProviders.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No models selected
              </p>
            ) : (
              <div className="space-y-2">
                {selectedProviders.map((selection, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <span className={`text-sm ${getProviderColor(selection.provider)}`}>
                      {selection.provider} · {selection.model}
                    </span>
                    <button
                      onClick={() => handleRemoveProvider(index)}
                      className="text-gray-500 hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={runComparison}
                  disabled={isLoading || selectedProviders.length === 0}
                  className="btn-primary w-full mt-4"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Running comparison...
                    </span>
                  ) : (
                    'Run Comparison'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 rounded-lg">
              {error}
            </div>
          )}
          
          {results.map((result, index) => (
            <div key={index} className="card">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${getProviderColor(result.provider)}`}>
                    {result.provider} · {result.model}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span title="Input tokens" className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-primary-400 mr-1"></span>
                      {result.tokenUsage.promptTokens}
                    </span>
                    <span title="Output tokens" className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-secondary-400 mr-1"></span>
                      {result.tokenUsage.completionTokens}
                    </span>
                    <span title="Total tokens" className="flex items-center font-medium">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
                      {result.tokenUsage.totalTokens}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  {result.response}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;