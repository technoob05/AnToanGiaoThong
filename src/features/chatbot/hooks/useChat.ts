import { useState, useCallback } from 'react';
import { ChatMessage, ChatState, DEFAULT_QUICK_REPLIES } from '../types';
import { ragService } from '@/lib/rag-service';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Xin chào! Tôi là G-LawBot, trợ lý AI chuyên về luật giao thông Việt Nam. Tôi có thể giúp bạn tìm hiểu về:\n\n🚦 Luật giao thông hiện hành\n⚖️ Mức phạt vi phạm\n🛣️ An toàn giao thông\n📋 Thủ tục giấy tờ\n\nBạn muốn hỏi gì về giao thông?',
        timestamp: new Date(),
      }
    ],
    isLoading: false,
    error: null,
    quickReplies: DEFAULT_QUICK_REPLIES
  });

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, loadingMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const ragResponse = await ragService.askQuestion(content);
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === loadingMessage.id 
            ? { 
                ...msg, 
                content: ragResponse.answer, 
                sources: ragResponse.sources,
                confidence: ragResponse.confidence,
                isLoading: false 
              }
            : msg
        ),
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== loadingMessage.id),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
      }));
    }
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [prev.messages[0]], // Keep only the welcome message
      error: null,
    }));
    // RAG service doesn't need to reset chat state like gemini service
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = state.messages
      .filter(msg => msg.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      // Remove error state and retry
      setState(prev => ({
        ...prev,
        error: null,
      }));
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, sendMessage]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    quickReplies: state.quickReplies,
    sendMessage,
    clearChat,
    retryLastMessage,
  };
}
