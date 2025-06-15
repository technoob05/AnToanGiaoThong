/**
 * Speech Synthesis Service using Web Speech Synthesis API
 * Provides text-to-speech functionality with Vietnamese language support
 */

export interface VoiceOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface SpeechSynthesisSettings {
  autoSpeak: boolean;
  rate: number;
  pitch: number;
  volume: number;
  selectedVoiceURI: string | null;
  language: string;
}

export class SpeechSynthesisService {
  private synth: SpeechSynthesis;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private settings: SpeechSynthesisSettings = {
    autoSpeak: false,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    selectedVoiceURI: null,
    language: 'vi-VN'
  };

  // Event callbacks
  public onStart: () => void = () => {};
  public onEnd: () => void = () => {};
  public onError: (error: string) => void = () => {};
  public onPause: () => void = () => {};
  public onResume: () => void = () => {};

  constructor(settings?: Partial<SpeechSynthesisSettings>) {
    this.synth = window.speechSynthesis;
    this.settings = { ...this.settings, ...settings };
    
    // Handle voices loaded event
    this.initializeVoices();
  }

  /**
   * Check if Speech Synthesis is supported in the current browser
   */
  public static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Initialize and wait for voices to be loaded
   */
  private initializeVoices(): void {
    if (this.synth.getVoices().length > 0) {
      this.selectDefaultVoice();
    } else {
      // Wait for voices to be loaded
      this.synth.onvoiceschanged = () => {
        this.selectDefaultVoice();
      };
    }
  }

  /**
   * Select the best default voice for the current language
   */
  private selectDefaultVoice(): void {
    const voices = this.getAvailableVoices();
    
    // Try to find a Vietnamese voice first
    let defaultVoice = voices.find(voice => 
      voice.lang.includes('vi') || voice.lang.includes('VN')
    );

    // If no Vietnamese voice, try to find any voice that matches the language
    if (!defaultVoice) {
      defaultVoice = voices.find(voice => 
        voice.lang.startsWith(this.settings.language.split('-')[0])
      );
    }

    // Fall back to the first available voice
    if (!defaultVoice && voices.length > 0) {
      defaultVoice = voices[0];
    }

    if (defaultVoice) {
      this.settings.selectedVoiceURI = defaultVoice.voiceURI;
    }
  }

  /**
   * Get all available voices
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  /**
   * Get voices filtered by language
   */
  public getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(voice => 
      voice.lang.startsWith(language.split('-')[0])
    );
  }

  /**
   * Get the currently selected voice
   */
  public getSelectedVoice(): SpeechSynthesisVoice | null {
    if (!this.settings.selectedVoiceURI) return null;
    
    return this.getAvailableVoices().find(voice => 
      voice.voiceURI === this.settings.selectedVoiceURI
    ) || null;
  }

  /**
   * Speak the given text
   */
  public async speak(text: string, options?: VoiceOptions): Promise<void> {
    if (!SpeechSynthesisService.isSupported()) {
      throw new Error('Speech Synthesis không được hỗ trợ trong trình duyệt này');
    }

    if (!text.trim()) {
      return;
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply settings
      const voice = options?.voice || this.getSelectedVoice();
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = options?.rate || this.settings.rate;
      utterance.pitch = options?.pitch || this.settings.pitch;
      utterance.volume = options?.volume || this.settings.volume;
      utterance.lang = options?.lang || this.settings.language;

      // Set up event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.isPaused = false;
        const errorMessage = `Lỗi text-to-speech: ${event.error}`;
        this.onError(errorMessage);
        reject(new Error(errorMessage));
      };

      utterance.onpause = () => {
        this.isPaused = true;
        this.onPause();
      };

      utterance.onresume = () => {
        this.isPaused = false;
        this.onResume();
      };

      // Speak the utterance
      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (this.isSpeaking || this.isPaused) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
    }
  }

  /**
   * Pause current speech
   */
  public pause(): void {
    if (this.isSpeaking && !this.isPaused) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  public resume(): void {
    if (this.isPaused) {
      this.synth.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Check if currently paused
   */
  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Update synthesis settings
   */
  public updateSettings(settings: Partial<SpeechSynthesisSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  public getSettings(): SpeechSynthesisSettings {
    return { ...this.settings };
  }

  /**
   * Set the selected voice by URI
   */
  public setVoice(voiceURI: string): void {
    const voice = this.getAvailableVoices().find(v => v.voiceURI === voiceURI);
    if (voice) {
      this.settings.selectedVoiceURI = voiceURI;
    }
  }

  /**
   * Get recommended voices for Vietnamese
   */
  public getVietnameseVoices(): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(voice => 
      voice.lang.includes('vi') || 
      voice.lang.includes('VN') ||
      voice.name.toLowerCase().includes('vietnam')
    );
  }

  /**
   * Speak text if auto-speak is enabled
   */
  public autoSpeak(text: string): Promise<void> | null {
    if (this.settings.autoSpeak) {
      return this.speak(text);
    }
    return null;
  }

  /**
   * Queue multiple texts to be spoken in sequence
   */
  public async speakQueue(texts: string[]): Promise<void> {
    for (const text of texts) {
      if (text.trim()) {
        await this.speak(text);
        // Small delay between utterances
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Split long text into chunks and speak them
   */
  public async speakLongText(text: string, maxLength: number = 200): Promise<void> {
    if (text.length <= maxLength) {
      return this.speak(text);
    }

    // Split text into sentences and group them into chunks
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());

    return this.speakQueue(chunks);
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): Array<{ code: string; name: string }> {
    const voices = this.getAvailableVoices();
    const languages = new Set<string>();
    
    voices.forEach(voice => {
      const langCode = voice.lang.split('-')[0];
      languages.add(langCode);
    });

    return Array.from(languages).map(code => ({
      code,
      name: this.getLanguageName(code)
    }));
  }

  /**
   * Get human-readable language name
   */
  private getLanguageName(code: string): string {
    const languageNames: Record<string, string> = {
      'vi': 'Tiếng Việt',
      'en': 'English',
      'zh': '中文',
      'ja': '日本語',
      'ko': '한국어',
      'fr': 'Français',
      'de': 'Deutsch',
      'es': 'Español',
      'it': 'Italiano',
      'ru': 'Русский'
    };
    
    return languageNames[code] || code.toUpperCase();
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.stop();
  }
}

// Export a singleton instance for convenience
export const speechSynthesisService = new SpeechSynthesisService();
