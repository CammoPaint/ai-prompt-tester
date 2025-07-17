import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw, Copy, Check } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { sendChatMessage } from '../../services/chatService';
import { getProviderColor } from '../../utils/theme';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useThemeStore } from '../../store/themeStore';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ChatInterface: React.FC = () => {
  const { 
    currentWorkspace, 
    currentThread, 
    addMessage, 
    updateMessage,
    isLoading, 
    setLoading, 
    setError 
  } = useChatStore();
  const { apiKeys } = useAuthStore();
  const { mode } = useThemeStore();
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages]);
  
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentThread || !currentWorkspace || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage
    });
    
    // Check API key
    const { provider } = currentThread;
    if (provider !== 'ollama' && !apiKeys[provider]) {
      setError(`Please set your ${provider} API key in the settings`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare messages for API (include system prompt from workspace)
      const messages = currentThread.messages.concat([{
        id: Date.now().toString(),
        role: 'user' as const,
        content: userMessage,
        timestamp: Date.now()
      }]);
      
      const response = await sendChatMessage(
        messages,
        currentThread.provider,
        currentThread.model,
        currentWorkspace.systemPrompt
      );
      
      // Add assistant message
      addMessage({
        role: 'assistant',
        content: response.content,
        provider: response.provider,
        model: response.model,
        tokenUsage: response.tokenUsage,
        responseTime: response.responseTime
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const regenerateResponse = async (messageIndex: number) => {
    if (!currentThread || !currentWorkspace || isLoading) return;
    
    // Find the user message that prompted this response
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || currentThread.messages[userMessageIndex].role !== 'user') return;
    
    const userMessage = currentThread.messages[userMessageIndex];
    const messagesUpToUser = currentThread.messages.slice(0, userMessageIndex + 1);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sendChatMessage(
        messagesUpToUser,
        currentThread.provider,
        currentThread.model,
        currentWorkspace.systemPrompt
      );
      
      // Update the assistant message
      const assistantMessage = currentThread.messages[messageIndex];
      updateMessage(assistantMessage.id, {
        content: response.content,
        tokenUsage: response.tokenUsage,
        responseTime: response.responseTime
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentThread || !currentWorkspace) return null;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold">{currentThread.title}</h1>
            <p className={`text-sm ${getProviderColor(currentThread.provider)}`}>
              {currentThread.provider} · {currentThread.model}
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentThread.messages.length} messages
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentThread.messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              {message.role === 'user' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none">
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
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              
              {/* Message actions */}
              {message.role === 'assistant' && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    {message.tokenUsage && (
                      <span>{message.tokenUsage.totalTokens} tokens</span>
                    )}
                    {message.responseTime && (
                      <span>{message.responseTime.toFixed(1)}s</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3 h-3 text-success-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => regenerateResponse(index)}
                      disabled={isLoading}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="input resize-none pr-12"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;