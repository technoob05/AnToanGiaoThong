import { useState, useCallback } from 'react';
import { ChatMessage, ChatState, DEFAULT_QUICK_REPLIES, VoiceState, VoiceSettings } from '../types';
import { ragService } from '@/lib/rag-service';
import { speechSynthesisService } from '@/lib/speech-synthesis';

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
    quickReplies: DEFAULT_QUICK_REPLIES,
    voiceState: {
      isRecording: false,
      isSpeaking: false,
      isListening: false,
      error: null,
      transcript: '',
      isTranscriptFinal: false
    },
    voiceSettings: {
      autoSpeak: false,
      speechRate: 1.0,
      speechPitch: 1.0,
      speechVolume: 1.0,
      selectedVoiceURI: null,
      language: 'vi-VN',
      continuousListening: false
    }
  });

  const sendMessage = useCallback(async (content: string, isVoiceInput = false) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      isVoiceInput,
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
      voiceState: {
        ...prev.voiceState,
        transcript: '',
        isTranscriptFinal: false
      }
    }));

    try {
      const ragResponse = await ragService.askQuestion(content);
      
      const assistantMessage: ChatMessage = {
        id: loadingMessage.id,
        role: 'assistant',
        content: ragResponse.answer,
        sources: ragResponse.sources,
        confidence: ragResponse.confidence,
        timestamp: new Date(),
        isLoading: false,
        hasBeenSpoken: false
      };

      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === loadingMessage.id ? assistantMessage : msg
        ),
        isLoading: false,
      }));

      // Auto-speak the response if enabled
      if (state.voiceSettings.autoSpeak) {
        try {
          await speechSynthesisService.speakLongText(ragResponse.answer);
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, hasBeenSpoken: true }
                : msg
            ),
          }));
        } catch (voiceError) {
          console.error('Auto-speak failed:', voiceError);
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== loadingMessage.id),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
      }));
    }
  }, [state.voiceSettings.autoSpeak]);

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

  // Voice functionality methods
  const updateVoiceState = useCallback((voiceState: Partial<VoiceState>) => {
    setState(prev => ({
      ...prev,
      voiceState: { ...prev.voiceState, ...voiceState }
    }));
  }, []);

  const updateVoiceSettings = useCallback((voiceSettings: Partial<VoiceSettings>) => {
    setState(prev => ({
      ...prev,
      voiceSettings: { ...prev.voiceSettings, ...voiceSettings }
    }));
  }, []);

  const handleVoiceInput = useCallback(async (transcript: string) => {
    if (transcript.trim()) {
      await sendMessage(transcript, true);
    }
  }, [sendMessage]);

  const speakMessage = useCallback(async (messageId: string) => {
    const message = state.messages.find(msg => msg.id === messageId);
    if (message && message.role === 'assistant') {
      try {
        await speechSynthesisService.speakLongText(message.content);
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, hasBeenSpoken: true }
              : msg
          ),
        }));
      } catch (error) {
        console.error('Speech synthesis failed:', error);
        updateVoiceState({ error: 'Không thể đọc tin nhắn này' });
      }
    }
  }, [state.messages, updateVoiceState]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    quickReplies: state.quickReplies,
    voiceState: state.voiceState,
    voiceSettings: state.voiceSettings,
    sendMessage,
    clearChat,
    retryLastMessage,
    updateVoiceState,
    updateVoiceSettings,
    handleVoiceInput,
    speakMessage,
  };
}
