import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VoiceState, VoiceSettings } from '../types';
import { speechRecognitionService, SpeechRecognitionService } from '@/lib/speech-recognition';
import { speechSynthesisService, SpeechSynthesisService } from '@/lib/speech-synthesis';

interface VoiceControlsProps {
  voiceState: VoiceState;
  voiceSettings: VoiceSettings;
  onVoiceStateChange: (state: Partial<VoiceState>) => void;
  onVoiceSettingsChange: (settings: Partial<VoiceSettings>) => void;
  onTranscriptComplete: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceControls({
  voiceState,
  voiceSettings,
  onVoiceStateChange,
  onVoiceSettingsChange,
  onTranscriptComplete,
  disabled = false
}: VoiceControlsProps) {
  const [isSupported, setIsSupported] = useState({
    recognition: false,
    synthesis: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const micButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check browser support
    setIsSupported({
      recognition: SpeechRecognitionService.isSupported(),
      synthesis: SpeechSynthesisService.isSupported()
    });

    // Load available voices
    if (SpeechSynthesisService.isSupported()) {
      const loadVoices = () => {
        setAvailableVoices(speechSynthesisService.getAvailableVoices());
      };

      loadVoices();
      
      // Voices might load asynchronously
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  useEffect(() => {
    // Set up speech recognition callbacks
    speechRecognitionService.onResult = (result) => {
      onVoiceStateChange({
        transcript: result.transcript,
        isTranscriptFinal: result.isFinal
      });

      if (result.isFinal) {
        onTranscriptComplete(result.transcript);
        handleStopListening();
      }
    };

    speechRecognitionService.onError = (error) => {
      onVoiceStateChange({
        error,
        isRecording: false,
        isListening: false
      });
    };

    speechRecognitionService.onStart = () => {
      onVoiceStateChange({
        isRecording: true,
        isListening: true,
        error: null
      });
    };

    speechRecognitionService.onEnd = () => {
      onVoiceStateChange({
        isRecording: false,
        isListening: false
      });
    };

    // Set up speech synthesis callbacks
    speechSynthesisService.onStart = () => {
      onVoiceStateChange({ isSpeaking: true });
    };

    speechSynthesisService.onEnd = () => {
      onVoiceStateChange({ isSpeaking: false });
    };

    speechSynthesisService.onError = (error) => {
      onVoiceStateChange({
        error,
        isSpeaking: false
      });
    };

    // Update speech synthesis settings
    speechSynthesisService.updateSettings({
      autoSpeak: voiceSettings.autoSpeak,
      rate: voiceSettings.speechRate,
      pitch: voiceSettings.speechPitch,
      volume: voiceSettings.speechVolume,
      selectedVoiceURI: voiceSettings.selectedVoiceURI,
      language: voiceSettings.language
    });

    // Update speech recognition settings
    speechRecognitionService.updateOptions({
      language: voiceSettings.language,
      continuous: voiceSettings.continuousListening,
      interimResults: true
    });

    return () => {
      speechRecognitionService.dispose();
      speechSynthesisService.dispose();
    };
  }, [voiceSettings, onVoiceStateChange, onTranscriptComplete]);

  const handleStartListening = async () => {
    if (!isSupported.recognition || disabled) return;

    try {
      await speechRecognitionService.startListening();
    } catch (error) {
      console.error('Failed to start listening:', error);
    }
  };

  const handleStopListening = () => {
    speechRecognitionService.stopListening();
  };

  const handleToggleListening = () => {
    if (voiceState.isRecording) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  const handleStopSpeaking = () => {
    speechSynthesisService.stop();
  };

  const handleToggleAutoSpeak = () => {
    onVoiceSettingsChange({
      autoSpeak: !voiceSettings.autoSpeak
    });
  };

  const handleVoiceChange = (voiceURI: string) => {
    onVoiceSettingsChange({
      selectedVoiceURI: voiceURI
    });
  };

  const handleSpeedChange = (rate: number) => {
    onVoiceSettingsChange({
      speechRate: rate
    });
  };

  const getVietnameseVoices = () => {
    return availableVoices.filter(voice => 
      voice.lang.includes('vi') || voice.lang.includes('VN')
    );
  };

  if (!isSupported.recognition && !isSupported.synthesis) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          ⚠️ Trình duyệt không hỗ trợ voice
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Microphone Button */}
      {isSupported.recognition && (
        <Button
          ref={micButtonRef}
          variant={voiceState.isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={handleToggleListening}
          disabled={disabled || voiceState.isSpeaking}
          className={cn(
            "relative transition-all duration-200",
            voiceState.isRecording && "animate-pulse shadow-lg"
          )}
          title={voiceState.isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
        >
          {voiceState.isRecording ? (
            <>
              <span className="size-4 text-white">🔴</span>
              <span className="ml-1 text-xs hidden sm:inline">Đang nghe...</span>
            </>
          ) : (
            <>
              <span className="size-4">🎤</span>
              <span className="ml-1 text-xs hidden sm:inline">Nói</span>
            </>
          )}
        </Button>
      )}

      {/* Speaker Controls */}
      {isSupported.synthesis && (
        <>
          {/* Stop Speaking Button (only when speaking) */}
          {voiceState.isSpeaking && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopSpeaking}
              className="text-red-600 border-red-300 hover:bg-red-50"
              title="Dừng đọc"
            >
              <span className="size-4">🔇</span>
              <span className="ml-1 text-xs hidden sm:inline">Dừng</span>
            </Button>
          )}

          {/* Auto-speak Toggle */}
          <Button
            variant={voiceSettings.autoSpeak ? "default" : "outline"}
            size="sm"
            onClick={handleToggleAutoSpeak}
            disabled={disabled}
            className={cn(
              voiceSettings.autoSpeak && "bg-green-600 hover:bg-green-700"
            )}
            title={voiceSettings.autoSpeak ? "Tắt tự động đọc" : "Bật tự động đọc"}
          >
            <span className="size-4">🔊</span>
            <span className="ml-1 text-xs hidden sm:inline">
              {voiceSettings.autoSpeak ? "TĐ ON" : "TĐ OFF"}
            </span>
          </Button>
        </>
      )}

      {/* Voice Settings Button */}
      {isSupported.synthesis && availableVoices.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          disabled={disabled}
          title="Cài đặt giọng nói"
        >
          <span className="size-4">⚙️</span>
        </Button>
      )}

      {/* Live Transcript Display */}
      {voiceState.transcript && !voiceState.isTranscriptFinal && (
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className="text-xs max-w-full">
            <span className="truncate">📝 {voiceState.transcript}</span>
          </Badge>
        </div>
      )}

      {/* Voice Status Indicators */}
      <div className="flex gap-1">
        {voiceState.isSpeaking && (
          <Badge variant="secondary" className="text-xs animate-pulse">
            🔊 Đang đọc
          </Badge>
        )}
        
        {voiceState.error && (
          <Badge variant="destructive" className="text-xs">
            ⚠️ Lỗi
          </Badge>
        )}
      </div>

      {/* Voice Settings Panel */}
      {showSettings && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50 min-w-64">
          <h3 className="text-sm font-medium mb-3">Cài đặt giọng nói</h3>
          
          {/* Voice Selection */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
              Giọng đọc:
            </label>
            <select
              value={voiceSettings.selectedVoiceURI || ''}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full text-xs p-2 border rounded"
            >
              <option value="">Mặc định</option>
              {getVietnameseVoices().map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
              {getVietnameseVoices().length === 0 && 
                availableVoices.slice(0, 5).map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              }
            </select>
          </div>

          {/* Speed Control */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
              Tốc độ: {voiceSettings.speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.speechRate}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Close button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
            className="w-full text-xs"
          >
            Đóng
          </Button>
        </div>
      )}
    </div>
  );
}
