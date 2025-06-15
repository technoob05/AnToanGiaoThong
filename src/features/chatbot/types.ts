import { DocumentChunk } from '@/lib/pdf-processor';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  sources?: DocumentChunk[];
  confidence?: 'high' | 'medium' | 'low';
  isVoiceInput?: boolean;
  hasBeenSpoken?: boolean;
}

export interface QuickReply {
  id: string;
  text: string;
  category: 'violation' | 'law' | 'safety' | 'general';
}

export interface VoiceState {
  isRecording: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  error: string | null;
  transcript: string;
  isTranscriptFinal: boolean;
}

export interface VoiceSettings {
  autoSpeak: boolean;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  selectedVoiceURI: string | null;
  language: string;
  continuousListening: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  quickReplies: QuickReply[];
  voiceState: VoiceState;
  voiceSettings: VoiceSettings;
}

export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {
    id: '1',
    text: 'Vượt đèn đỏ bị phạt bao nhiêu tiền?',
    category: 'violation'
  },
  {
    id: '2', 
    text: 'Tuổi tối thiểu để lái xe ô tô là bao nhiêu?',
    category: 'law'
  },
  {
    id: '3',
    text: 'Không đội mũ bảo hiểm bị phạt như thế nào?',
    category: 'violation'
  },
  {
    id: '4',
    text: 'Quy định về giấy phép lái xe?',
    category: 'law'
  },
  {
    id: '5',
    text: 'Uống rượu bia lái xe bị xử lý ra sao?',
    category: 'violation'
  },
  {
    id: '6',
    text: 'Quy định tốc độ trên đường cao tốc?',
    category: 'safety'
  }
];
