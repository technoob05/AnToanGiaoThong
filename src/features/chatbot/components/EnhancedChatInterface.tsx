import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Components
import { ChatSidebar } from './ChatSidebar';
import { FileUpload } from './FileUpload';
import { SourceCard } from './SourceCard';

// Services and types
import { chatStorage, ChatSession, StoredChatMessage, FileAttachment } from '@/lib/chat-storage';
import { enhancedGemini, FileData } from '@/lib/enhanced-gemini';

interface EnhancedChatMessage extends StoredChatMessage {
  isStreaming?: boolean;
}

interface ChatBubbleProps {
  message: EnhancedChatMessage;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      'flex gap-3 mb-6',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <Avatar className="size-10 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-sm">
            🤖
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        'max-w-[85%] space-y-3',
        isUser ? 'ml-auto' : ''
      )}>
        {/* Message Content */}
        <div className={cn(
          'rounded-2xl px-4 py-3 break-words',
          isUser 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        )}>
          {message.isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="size-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">G-LawBot đang phân tích...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          )}
          
          {/* File Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((file) => (
                <div key={file.id} className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg">
                  <span className="text-sm">
                    {file.type === 'image' ? '🖼️' : 
                     file.type === 'pdf' ? '📄' : 
                     file.type === 'video' ? '🎥' : 
                     file.type === 'audio' ? '🎵' : '📎'}
                  </span>
                  <span className="text-xs font-medium truncate">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(file.size / 1024).toFixed(1)}KB
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          <div className={cn(
            'text-xs mt-2 opacity-70',
            isUser ? 'text-white/80' : 'text-gray-500'
          )}>
            {message.timestamp.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Sources for AI responses */}
        {!isUser && message.sources && message.sources.length > 0 && message.confidence && (
          <SourceCard 
            sources={message.sources} 
            confidence={message.confidence}
          />
        )}
      </div>
      
      {isUser && (
        <Avatar className="size-10 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
            👤
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export function EnhancedChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize with a new session if none exists
    if (!currentSession) {
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = () => {
    const newSession = chatStorage.createSession();
    setCurrentSession(newSession);
    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: 'Xin chào! Tôi là G-LawBot, trợ lý AI chuyên về luật giao thông Việt Nam.\n\n🚀 **Tính năng mới:**\n- 📎 Upload hình ảnh, tài liệu để tôi phân tích\n- 🧠 Nhớ ngữ cảnh cuộc trò chuyện\n- 📚 Trích dẫn nguồn luật chính xác\n\n**Tôi có thể giúp bạn:**\n• Tư vấn luật giao thông và mức phạt\n• Phân tích biển báo từ hình ảnh\n• Đọc và giải thích tài liệu pháp luật\n• Tư vấn thủ tục xe cộ\n\nBạn muốn hỏi gì về giao thông?',
        timestamp: new Date()
      }
    ]);
    setAttachedFiles([]);
    setError(null);
    
    // Initialize Gemini with empty history
    enhancedGemini.clearHistory();
  };

  const handleSelectSession = (sessionId: string) => {
    const session = chatStorage.getSession(sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages as EnhancedChatMessage[]);
      
      // Set Gemini history for context
      const history = session.messages.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }]
      }));
      enhancedGemini.setHistory(history);
    }
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading || !currentSession) return;
    
    const messageText = inputValue.trim() || '[File attachment]';
    const userMessage: EnhancedChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    const streamingMessage: EnhancedChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    // Add messages to UI
    setMessages(prev => [...prev, userMessage, streamingMessage]);
    setInputValue('');
    setAttachedFiles([]);
    setShowFileUpload(false);
    setIsLoading(true);
    setError(null);

    // Save user message to storage
    chatStorage.addMessage(currentSession.id, userMessage);

    try {
      // Convert attachments to FileData format
      const geminiFiles: FileData[] = userMessage.attachments?.map(file => ({
        mimeType: file.type === 'image' ? 'image/jpeg' : 
                  file.type === 'pdf' ? 'application/pdf' : 'text/plain',
        data: file.data
      })) || [];

      // Use streaming for better UX
      const stream = await enhancedGemini.sendMessageStream(messageText, geminiFiles);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessage.id 
              ? { ...msg, content: fullResponse, isStreaming: true }
              : msg
          )
        );
      }

      // Finalize the message
      const finalMessage: EnhancedChatMessage = {
        ...streamingMessage,
        content: fullResponse,
        confidence: 'high', // TODO: Calculate from enhanced gemini
        isStreaming: false
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === streamingMessage.id ? finalMessage : msg
        )
      );

      // Save AI response to storage
      chatStorage.addMessage(currentSession.id, finalMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định');
      
      // Remove streaming message on error
      setMessages(prev => prev.filter(msg => msg.id !== streamingMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFilesUploaded = (files: FileAttachment[]) => {
    setAttachedFiles(files);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        currentSessionId={currentSession?.id}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300',
        sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
      )}>
        {/* Header */}
        <header className="bg-white/70 dark:bg-black/70 backdrop-blur-lg border-b border-white/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              ☰
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex"
            >
              ← Trang chủ
            </Button>
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-white">🤖</span>
              </div>
              <div>
                <h1 className="font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  G-LawBot AI
                </h1>
                <p className="text-xs text-gray-500">Multimodal • Multi-turn • RAG</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              🚀 Gemini 2.0-flash
            </Badge>
            {currentSession && (
              <Badge variant="outline" className="text-xs">
                {messages.length} tin nhắn
              </Badge>
            )}
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                  <span className="text-red-600 flex-shrink-0">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-red-700 dark:text-red-300 text-sm break-words">{error}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setError(null)}
                    className="text-red-600 border-red-300 hover:bg-red-50 flex-shrink-0"
                  >
                    Đóng
                  </Button>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* File Upload Area */}
          {showFileUpload && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white/50 dark:bg-black/50">
              <div className="max-w-4xl mx-auto">
                <FileUpload onFilesUploaded={handleFilesUploaded} />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white/70 dark:bg-black/70 backdrop-blur-lg">
            <div className="max-w-4xl mx-auto">
              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-sm">
                      <span>
                        {file.type === 'image' ? '🖼️' : 
                         file.type === 'pdf' ? '📄' : 
                         file.type === 'video' ? '🎥' : 
                         file.type === 'audio' ? '🎵' : '📎'}
                      </span>
                      <span className="truncate max-w-32">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="size-4 p-0 text-red-500 hover:text-red-600"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-end">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className={cn(
                      'transition-colors',
                      showFileUpload && 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300'
                    )}
                  >
                    📎
                  </Button>
                </div>
                
                <div className="flex-1 flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhắn tin hoặc upload file để hỏi G-LawBot..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={(!inputValue.trim() && attachedFiles.length === 0) || isLoading}
                    className="px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                  >
                    {isLoading ? (
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      '🚀'
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>💡 Hỗ trợ text, hình ảnh, PDF, video - Gemini AI sẽ phân tích và trả lời</span>
                <span>Enter để gửi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
