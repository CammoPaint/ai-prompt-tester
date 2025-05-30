import React, { useState } from 'react';
import { Braces, FileJson, FileText, Loader2 } from 'lucide-react';
import { usePromptStore } from '../../store/promptStore';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useThemeStore } from '../../store/themeStore';
import { getProviderColor } from '../../utils/theme';

const ResponseViewer: React.FC = () => {
  const { response, isLoading, error } = usePromptStore();
  const { mode } = useThemeStore();
  const [view, setView] = useState<'formatted' | 'raw'>('formatted');
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Waiting for response...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-error-600 dark:text-error-400 px-4">
        <div className="p-6 bg-error-50 dark:bg-error-900/20 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!response) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 dark:text-gray-400">
        <Braces className="w-8 h-8 mb-4" />
        <p>Submit a prompt to see the response</p>
      </div>
    );
  }
  
  let jsonContent: any = null;
  let isValidJson = false;
  
  try {
    if (response.format === 'json') {
      jsonContent = JSON.parse(response.content);
      isValidJson = true;
    }
  } catch (e) {
    // Not valid JSON, will fallback to text display
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Response</h2>
          <span className={`text-sm ${getProviderColor(response.provider)}`}>
            {response.provider} · {response.model}
          </span>
          {response.tokenUsage && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Tokens: {response.tokenUsage.promptTokens} prompt + {response.tokenUsage.completionTokens} completion = {response.tokenUsage.totalTokens} total
            </span>
          )}
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setView('formatted')}
            className={`flex items-center text-xs px-2 py-1 rounded ${
              view === 'formatted' 
                ? 'bg-white dark:bg-gray-700 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <FileText className="w-3 h-3 mr-1" />
            Formatted
          </button>
          <button
            type="button"
            onClick={() => setView('raw')}
            className={`flex items-center text-xs px-2 py-1 rounded ${
              view === 'raw' 
                ? 'bg-white dark:bg-gray-700 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <FileJson className="w-3 h-3 mr-1" />
            Raw
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {view === 'raw' ? (
          <pre className="font-mono text-sm whitespace-pre-wrap p-4 bg-gray-50 dark:bg-gray-900 rounded-md h-full overflow-auto">
            {response.content}
          </pre>
        ) : (
          <div className="prose dark:prose-invert prose-sm max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-md h-full overflow-auto">
            {isValidJson ? (
              <SyntaxHighlighter
                language="json"
                style={mode === 'dark' ? oneDark : oneLight}
                customStyle={{ margin: 0, borderRadius: '0.375rem' }}
              >
                {JSON.stringify(jsonContent, null, 2)}
              </SyntaxHighlighter>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        style={mode === 'dark' ? oneDark : oneLight}
                        customStyle={{ margin: '1em 0', borderRadius: '0.375rem' }}
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
                  }
                }}
              >
                {response.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;