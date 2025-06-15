import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../types';
import { useNavigate } from 'react-router-dom';
import { SourceCard } from './SourceCard';
import { VoiceControls } from './VoiceControls';

interface ChatMessageProps {
  message: ChatMessage;
  onSpeakMessage?: (messageId: string) => void;
}

function ChatMessageComponent({ message, onSpeakMessage }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <Avatar className="size-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-sm">
            🤖
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isUser 
          ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white ml-auto'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      )}>
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="size-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500">G-LawBot đang suy nghĩ...</span>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
              {message.content}
            </div>
            
            {/* Voice input indicator */}
            {message.isVoiceInput && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-blue-600 dark:text-blue-400">🎤 Tin nhắn giọng nói</span>
              </div>
            )}
            
            {/* Speak button for assistant messages */}
            {!isUser && !message.isLoading && onSpeakMessage && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSpeakMessage(message.id)}
                  className="text-xs h-6 px-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Đọc tin nhắn này"
                >
                  <span className="mr-1">🔊</span>
                  Đọc
                </Button>
                {message.hasBeenSpoken && (
                  <span className="text-xs text-green-600 dark:text-green-400">✓ Đã đọc</span>
                )}
              </div>
            )}
          </>
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
      
      {isUser && (
        <Avatar className="size-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
            👤
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

interface QuickReplyButtonProps {
  text: string;
  category: string;
  onClick: () => void;
}

function QuickReplyButton({ text, category, onClick }: QuickReplyButtonProps) {
  const categoryColors = {
    violation: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300',
    law: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
    safety: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300',
    general: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'text-xs h-auto p-2 rounded-full transition-all duration-200 hover:scale-105 break-words',
        categoryColors[category as keyof typeof categoryColors]
      )}
    >
      {text}
    </Button>
  );
}

export function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const {
    messages,
    isLoading,
    error,
    quickReplies,
    voiceState,
    voiceSettings,
    sendMessage,
    clearChat,
    retryLastMessage,
    updateVoiceState,
    updateVoiceSettings,
    handleVoiceInput,
    speakMessage
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    setShowQuickReplies(false);
    
    await sendMessage(message);
  };

  const handleQuickReply = async (text: string) => {
    setShowQuickReplies(false);
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white/70 dark:bg-black/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-white/50 dark:hover:bg-black/50 px-2 md:px-3 flex-shrink-0"
            >
              <span className="hidden sm:inline">← Về trang chủ</span>
              <span className="sm:hidden">← Home</span>
            </Button>
            <div className="size-7 md:size-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-sm md:text-lg font-bold text-white">🤖</span>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="text-sm md:text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent truncate">
                G-LawBot AI
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block truncate">Trợ lý luật giao thông</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 hidden md:inline-flex">
              🚀 Gemini 2.0-flash
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-1.5 py-0.5 md:hidden">
              🚀 AI
            </Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 sm:py-8 overflow-hidden">
        <div className="max-w-4xl mx-auto min-w-0">
          {/* Header */}
          <Card className="mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 border-0 text-white">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                  <div className="size-10 sm:size-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">🤖</span>
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <CardTitle className="text-lg sm:text-2xl font-bold text-white truncate">
                      G-LawBot AI
                    </CardTitle>
                    <p className="text-white/90 text-xs sm:text-sm truncate">
                      Trợ lý AI chuyên về luật giao thông Việt Nam
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1 hidden sm:inline-flex">
                    🚀 Gemini 2.0-flash
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1 sm:hidden">
                    🚀 AI
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearChat}
                    className="text-white hover:bg-white/20 border-white/30 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">🔄 Làm mới</span>
                    <span className="sm:hidden">🔄</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Chat Area */}
          <Card className="mb-6 shadow-2xl border-2">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-6">
                <div className="space-y-4 min-w-0">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-3 min-w-0">
                      <ChatMessageComponent 
                        message={message} 
                        onSpeakMessage={speakMessage}
                      />
                      {/* Show sources for assistant messages that have them */}
                      {message.role === 'assistant' && 
                       message.sources && 
                       message.sources.length > 0 && 
                       message.confidence && (
                        <SourceCard 
                          sources={message.sources} 
                          confidence={message.confidence}
                        />
                      )}
                    </div>
                  ))}
                  
                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 min-w-0">
                      <span className="text-red-600 flex-shrink-0">⚠️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-red-700 dark:text-red-300 text-sm break-words">
                          {error}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={retryLastMessage}
                        className="text-red-600 border-red-300 hover:bg-red-50 flex-shrink-0"
                      >
                        Thử lại
                      </Button>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Replies */}
          {showQuickReplies && quickReplies.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">💡 Câu hỏi gợi ý</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply) => (
                    <QuickReplyButton
                      key={reply.id}
                      text={reply.text}
                      category={reply.category}
                      onClick={() => handleQuickReply(reply.text)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Area */}
          <Card className="shadow-xl border-2">
            <CardContent className="p-4">
              <div className="flex gap-2 sm:gap-3 min-w-0">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Hỏi G-LawBot về luật giao thông..."
                  disabled={isLoading}
                  className="flex-1 text-sm sm:text-base min-w-0"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="lg"
                  className="px-4 sm:px-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg flex-shrink-0"
                >
                  {isLoading ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin sm:mr-2" />
                      <span className="hidden sm:inline">Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <span className="sm:mr-2">📨</span>
                      <span className="hidden sm:inline">Gửi</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Voice Controls */}
              <div className="mt-3 relative">
                <VoiceControls
                  voiceState={voiceState}
                  voiceSettings={voiceSettings}
                  onVoiceStateChange={updateVoiceState}
                  onVoiceSettingsChange={updateVoiceSettings}
                  onTranscriptComplete={handleVoiceInput}
                  disabled={isLoading}
                />
              </div>
              
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs text-muted-foreground">
                <span>💡 Nhấn Enter để gửi tin nhắn hoặc dùng nút 🎤 để nói</span>
                <span>🤖 Được hỗ trợ bởi Gemini AI</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
