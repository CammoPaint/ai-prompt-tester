import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw, Copy, Check, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { sendChatMessage } from '../../services/chatService';
import { getProviderColor } from '../../utils/theme';
import { getAvailableModels } from '../../services/apiService';
import { AIProvider } from '../../types';
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
    createThread,
    updateThread,
    isLoading, 
    setLoading, 
    setError 
  } = useChatStore();
  const { apiKeys } = useAuthStore();
  const { mode } = useThemeStore();
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editingModel, setEditingModel] = useState(false);
  const [editModel, setEditModel] = useState('');
  const [editProvider, setEditProvider] = useState('');
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
    if (!input.trim() || !currentWorkspace || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Create new thread if none exists
    let thread = currentThread;
    if (!thread) {
      try {
        await createThread('New Chat', currentWorkspace.id);
        thread = useChatStore.getState().currentThread;
      } catch (error) {
        console.error('Failed to create thread:', error);
        setError('Failed to create new thread');
        return;
      }
    }
    
    if (!thread) return;
    
    // Add user message
    addMessage({
      role: 'user',
      content: userMessage
    });
    
    // Check API key
    const { provider } = thread;
    if (provider !== 'ollama' && !apiKeys[provider as keyof typeof apiKeys]) {
      setError(`Please set your ${provider} API key in the settings`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare messages for API (include system prompt from workspace)
      const messages = thread.messages.concat([{
        id: Date.now().toString(),
        role: 'user' as const,
        content: userMessage,
        timestamp: Date.now()
      }]);
      
      const response = await sendChatMessage(
        messages,
        thread.provider,
        thread.model,
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
  
  // Thread editing handlers
  const handleEditTitle = () => {
    if (!currentThread) return;
    setEditingTitle(true);
    setEditTitle(currentThread.title);
  };
  
  const handleSaveTitle = async () => {
    if (!currentThread || !editTitle.trim()) return;
    
    try {
      await updateThread(currentThread.id, { title: editTitle.trim() });
      setEditingTitle(false);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };
  
  const handleCancelTitleEdit = () => {
    setEditingTitle(false);
    setEditTitle('');
  };
  
  const handleEditModel = () => {
    if (!currentThread) return;
    setEditingModel(true);
    setEditModel(currentThread.model);
    setEditProvider(currentThread.provider);
  };
  
  const handleSaveModel = async () => {
    if (!currentThread || !editModel.trim() || !editProvider.trim()) return;
    
    try {
      await updateThread(currentThread.id, { 
        provider: editProvider.trim(),
        model: editModel.trim() 
      });
      setEditingModel(false);
      setEditModel('');
      setEditProvider('');
    } catch (error) {
      console.error('Failed to update model:', error);
    }
  };
  
  const handleCancelModelEdit = () => {
    setEditingModel(false);
    setEditModel('');
    setEditProvider('');
  };
  
  const handleProviderChange = (newProvider: string) => {
    setEditProvider(newProvider);
    // Reset model to first available model for new provider
    const availableModels = getAvailableModels(newProvider as AIProvider);
    if (availableModels.length > 0) {
      setEditModel(availableModels[0]);
    }
  };
  
  const regenerateResponse = async (messageIndex: number) => {
    if (!currentThread || !currentWorkspace || isLoading) return;
    
    // Find the user message that prompted this response
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || currentThread.messages[userMessageIndex].role !== 'user') return;
    
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
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          {/* Thread Title Editing */}
          {editingTitle ? (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input text-sm font-medium flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelTitleEdit();
                }}
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 text-success-600 hover:bg-success-100 dark:hover:bg-success-900/30 rounded"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancelTitleEdit}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <h1 
              className="text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
              onClick={handleEditTitle}
              title="Click to edit title"
            >
              {currentThread.title}
            </h1>
          )}
          
          {/* Separator */}
          <span className="text-gray-300 dark:text-gray-600">·</span>
          
          {/* Provider & Model Editing */}
          {editingModel ? (
            <div className="flex items-center space-x-1">
              <select
                value={editProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="input text-xs w-20"
                autoFocus
              >
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="perplexity">Perplexity</option>
                <option value="deepseek">DeepSeek</option>
                <option value="grok">Grok</option>
                <option value="qwen">Qwen</option>
                <option value="ollama">Ollama</option>
              </select>
              <select
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                className="input text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveModel();
                  if (e.key === 'Escape') handleCancelModelEdit();
                }}
              >
                {getAvailableModels(editProvider as AIProvider).map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveModel}
                className="p-1 text-success-600 hover:bg-success-100 dark:hover:bg-success-900/30 rounded"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancelModelEdit}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span 
              className={`text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors ${getProviderColor(currentThread.provider)}`}
              onClick={handleEditModel}
              title="Click to change provider and model"
            >
              {currentThread.provider} · {currentThread.model}
            </span>
          )}
        </div>
      </div>
      
      {/* New Chat Input - ChatGPT Style */}
      {!currentThread && (
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={`New chat in ${currentWorkspace?.name || 'workspace'}`}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-0">
        {currentThread.messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} min-w-0`}
          >
            <div
              className={`max-w-[80%] min-w-0 rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-hidden'
              }`}
            >
              {message.role === 'user' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none overflow-x-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !props.inline && match ? (
                          <SyntaxHighlighter
                            language={match[1]}
                            style={mode === 'dark' ? oneDark : oneLight}
                            customStyle={{ 
                              margin: '0.5em 0', 
                              borderRadius: '0.375rem',
                              maxWidth: '100%',
                              overflow: 'auto'
                            }}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={`${className} break-all`} {...props}>
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
      
      {/* Input - Only show when there's a current thread */}
      {currentThread && (
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
      )}
    </div>
  );
};

export default ChatInterface;