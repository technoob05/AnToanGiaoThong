/**
 * Speech Recognition Service using Web Speech API
 * Provides speech-to-text functionality with Vietnamese language support
 */

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  readonly message: string;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private options: SpeechRecognitionOptions = {
    language: 'vi-VN',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1
  };

  // Event callbacks
  public onResult: (result: VoiceRecognitionResult) => void = () => {};
  public onError: (error: string) => void = () => {};
  public onStart: () => void = () => {};
  public onEnd: () => void = () => {};

  constructor(options?: Partial<SpeechRecognitionOptions>) {
    this.options = { ...this.options, ...options };
    this.initializeRecognition();
  }

  /**
   * Check if Speech Recognition is supported in the current browser
   */
  public static isSupported(): boolean {
    return !!(
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Initialize the speech recognition instance
   */
  private initializeRecognition(): void {
    if (!SpeechRecognitionService.isSupported()) {
      console.warn('Speech Recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    if (!this.recognition) return;

    // Configure recognition settings
    this.recognition.lang = this.options.language!;
    this.recognition.continuous = this.options.continuous!;
    this.recognition.interimResults = this.options.interimResults!;
    this.recognition.maxAlternatives = this.options.maxAlternatives!;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      this.onResult({
        transcript: transcript.trim(),
        confidence,
        isFinal
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      let errorMessage = 'Đã xảy ra lỗi không xác định';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Không phát hiện được giọng nói. Vui lòng thử lại.';
          break;
        case 'audio-capture':
          errorMessage = 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.';
          break;
        case 'not-allowed':
          errorMessage = 'Quyền truy cập microphone bị từ chối. Vui lòng cấp quyền và thử lại.';
          break;
        case 'network':
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          break;
        case 'language-not-supported':
          errorMessage = 'Ngôn ngữ không được hỗ trợ.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Dịch vụ nhận dạng giọng nói không khả dụng.';
          break;
        default:
          errorMessage = `Lỗi nhận dạng giọng nói: ${event.error}`;
      }

      this.onError(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd();
    };
  }

  /**
   * Start listening for speech input
   */
  public async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech Recognition không được hỗ trợ trong trình duyệt này');
    }

    if (this.isListening) {
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recognition.start();
    } catch (error) {
      if (error instanceof Error) {
        this.onError(`Không thể truy cập microphone: ${error.message}`);
      } else {
        this.onError('Không thể truy cập microphone');
      }
      throw error;
    }
  }

  /**
   * Stop listening for speech input
   */
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort speech recognition immediately
   */
  public abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Update recognition options
   */
  public updateOptions(options: Partial<SpeechRecognitionOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (this.recognition) {
      this.recognition.lang = this.options.language!;
      this.recognition.continuous = this.options.continuous!;
      this.recognition.interimResults = this.options.interimResults!;
      this.recognition.maxAlternatives = this.options.maxAlternatives!;
    }
  }

  /**
   * Get available languages (basic list for Vietnamese context)
   */
  public static getAvailableLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'vi-VN', name: 'Tiếng Việt (Việt Nam)' },
      { code: 'en-US', name: 'English (United States)' },
      { code: 'en-GB', name: 'English (United Kingdom)' }
    ];
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
    this.isListening = false;
  }
}

// Export a singleton instance for convenience
export const speechRecognitionService = new SpeechRecognitionService();
