import React, { useState } from 'react';
import { Braces, FileJson, FileText, Loader2, Clock } from 'lucide-react';
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
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <p className="text-sm">Waiting for response...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-error-600 dark:text-error-400">
        <div className="p-3 bg-error-50 dark:bg-error-900/20 rounded-lg text-center">
          <h3 className="text-sm font-medium mb-1">Error</h3>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!response) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500 dark:text-gray-400">
        <Braces className="w-5 h-5 mr-2" />
        <p className="text-sm">Submit a prompt to see the response</p>
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
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className={`text-xs ${getProviderColor(response.provider)}`}>
            {response.provider} · {response.model}
          </span>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span title="Input tokens" className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary-400 mr-1"></span>
              {response.tokenUsage.promptTokens}
            </span>
            <span title="Output tokens" className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-secondary-400 mr-1"></span>
              {response.tokenUsage.completionTokens}
            </span>
            <span title="Total tokens" className="flex items-center font-medium">
              <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
              {response.tokenUsage.totalTokens}
            </span>
            {response.responseTime && (
              <span title="Response time" className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {response.responseTime.toFixed(1)}s
              </span>
            )}
          </div>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setView('formatted')}
            className={`flex items-center text-xs px-2 py-0.5 rounded ${
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
            className={`flex items-center text-xs px-2 py-0.5 rounded ${
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
      
      {view === 'raw' ? (
        <pre className="font-mono text-xs whitespace-pre-wrap p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
          {response.content}
        </pre>
      ) : (
        <div className="prose dark:prose-invert prose-sm max-w-none p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
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
                      customStyle={{ margin: '0.5em 0', borderRadius: '0.375rem' }}
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
  );
};

export default ResponseViewer;