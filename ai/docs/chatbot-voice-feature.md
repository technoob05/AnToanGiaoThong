# G-LawBot Voice Feature Documentation

## Overview

The G-LawBot now includes comprehensive voice functionality, enabling users to interact with the AI assistant using speech-to-text and text-to-speech capabilities. This feature leverages native browser Web APIs to provide a seamless voice experience without requiring external dependencies.

## Features

### Speech-to-Text (STT)
- **Voice Input**: Users can speak their questions instead of typing
- **Real-time Transcription**: Live display of speech recognition results
- **Vietnamese Language Support**: Optimized for Vietnamese language recognition
- **Multiple Language Support**: Supports Vietnamese, English (US), and English (UK)
- **Error Handling**: Comprehensive error messages for various failure scenarios

### Text-to-Speech (TTS)
- **Auto-speak**: Automatically read bot responses when enabled
- **Manual Playback**: Click-to-speak buttons on individual messages
- **Voice Selection**: Choose from available Vietnamese and other language voices
- **Speed Control**: Adjustable speech rate (0.5x to 2x speed)
- **Voice Settings**: Persistent voice preferences

### Voice Controls
- **Microphone Button**: Start/stop voice recording with visual feedback
- **Speaker Toggle**: Enable/disable auto-speak functionality
- **Settings Panel**: Configure voice options and preferences
- **Status Indicators**: Real-time feedback on voice activities

## Implementation Details

### Core Services

#### Speech Recognition Service (`src/lib/speech-recognition.ts`)
```typescript
export class SpeechRecognitionService {
  // Main methods
  startListening(): Promise<void>
  stopListening(): void
  updateOptions(options: Partial<SpeechRecognitionOptions>): void
  
  // Event callbacks
  onResult: (result: VoiceRecognitionResult) => void
  onError: (error: string) => void
  onStart: () => void
  onEnd: () => void
}
```

**Features:**
- Web Speech API wrapper with Vietnamese language support
- Continuous and interim results support
- Comprehensive error handling with Vietnamese error messages
- Microphone permission management
- Cross-browser compatibility detection

#### Speech Synthesis Service (`src/lib/speech-synthesis.ts`)
```typescript
export class SpeechSynthesisService {
  // Main methods
  speak(text: string, options?: VoiceOptions): Promise<void>
  speakLongText(text: string, maxLength?: number): Promise<void>
  stop(): void
  pause(): void
  resume(): void
  
  // Voice management
  getAvailableVoices(): SpeechSynthesisVoice[]
  getVietnameseVoices(): SpeechSynthesisVoice[]
  setVoice(voiceURI: string): void
}
```

**Features:**
- Web Speech Synthesis API wrapper
- Automatic Vietnamese voice detection and selection
- Long text chunking for better speech quality
- Voice queue management
- Speech rate, pitch, and volume control

### Components

#### VoiceControls Component (`src/features/chatbot/components/VoiceControls.tsx`)
**Props:**
```typescript
interface VoiceControlsProps {
  voiceState: VoiceState
  voiceSettings: VoiceSettings
  onVoiceStateChange: (state: Partial<VoiceState>) => void
  onVoiceSettingsChange: (settings: Partial<VoiceSettings>) => void
  onTranscriptComplete: (transcript: string) => void
  disabled?: boolean
}
```

**Features:**
- Microphone button with recording animation
- Auto-speak toggle with visual state
- Voice settings dropdown panel
- Live transcript display
- Error state handling
- Browser compatibility detection

#### Enhanced ChatInterface
**New Features:**
- Integrated voice controls in input area
- Voice input indicators on messages
- Individual message speak buttons
- Visual feedback for voice activities
- Updated help text with voice instructions

### State Management

#### Voice State
```typescript
interface VoiceState {
  isRecording: boolean
  isSpeaking: boolean
  isListening: boolean
  error: string | null
  transcript: string
  isTranscriptFinal: boolean
}
```

#### Voice Settings
```typescript
interface VoiceSettings {
  autoSpeak: boolean
  speechRate: number
  speechPitch: number
  speechVolume: number
  selectedVoiceURI: string | null
  language: string
  continuousListening: boolean
}
```

### Enhanced Chat Messages
```typescript
interface ChatMessage {
  // ... existing properties
  isVoiceInput?: boolean      // Indicates message was from voice input
  hasBeenSpoken?: boolean     // Tracks if TTS has been used for this message
}
```

## Browser Compatibility

### Speech Recognition Support
- ✅ **Chrome/Chromium**: Full support
- ✅ **Microsoft Edge**: Full support
- ⚠️ **Safari**: Limited support (may work on newer versions)
- ❌ **Firefox**: No support (graceful degradation to text-only)

### Speech Synthesis Support
- ✅ **Chrome/Chromium**: Full support with multiple voices
- ✅ **Microsoft Edge**: Full support
- ✅ **Safari**: Full support
- ✅ **Firefox**: Basic support

### Fallback Behavior
- When speech recognition is not supported: Voice input controls are hidden, text input remains functional
- When speech synthesis is not supported: Speak buttons are hidden, auto-speak is disabled
- Graceful error handling with user-friendly Vietnamese error messages

## User Experience

### Voice Input Flow
1. User clicks microphone button
2. Browser requests microphone permission
3. Speech recognition starts with visual feedback
4. Real-time transcript appears below controls
5. When user stops speaking, final transcript is processed
6. Message is sent to the AI with voice input indicator

### Voice Output Flow
1. AI response is received
2. If auto-speak is enabled, TTS begins automatically
3. User can manually trigger TTS with speak button on any message
4. Visual indicators show speaking status
5. Users can stop speech at any time

### Settings Management
1. Voice settings panel accessible via gear icon
2. Voice selection from available Vietnamese voices
3. Speech rate adjustment with live preview
4. Settings persist across sessions
5. Auto-detection of optimal default voice

## Error Handling

### Speech Recognition Errors
- **No Speech**: "Không phát hiện được giọng nói. Vui lòng thử lại."
- **Audio Capture**: "Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập."
- **Permission Denied**: "Quyền truy cập microphone bị từ chối. Vui lòng cấp quyền và thử lại."
- **Network Error**: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet."

### Speech Synthesis Errors
- Automatic fallback to text-only mode
- Error notifications in Vietnamese
- Retry mechanisms for temporary failures

## Performance Considerations

### Optimization Features
- Lazy loading of voice engines
- Efficient audio buffer management
- Minimal impact on chat performance
- Proper cleanup of audio resources
- Memory leak prevention

### Long Text Handling
- Automatic text chunking for better speech quality
- Smart sentence boundary detection
- Queue management for multiple speech requests
- Interruption handling

## Accessibility

### Screen Reader Support
- Proper ARIA labels on all voice controls
- Keyboard navigation support
- Focus management during voice interactions
- Alt text for voice status indicators

### Visual Indicators
- Clear visual feedback for all voice states
- Color-coded status indicators
- Animation for recording state
- Progress indicators for speech synthesis

## Future Enhancements

### Planned Features
1. **Voice Commands**: Support for voice-activated commands like "clear chat"
2. **Custom Wake Words**: Hands-free activation with custom phrases
3. **Voice Training**: Personalized speech recognition improvement
4. **Multi-language Detection**: Automatic language switching
5. **Voice Shortcuts**: Quick voice templates for common questions

### Technical Improvements
1. **WebRTC Integration**: Enhanced audio quality
2. **Server-side STT**: Fallback for unsupported browsers
3. **Voice Biometrics**: User identification through voice
4. **Advanced Audio Processing**: Noise reduction and echo cancellation

## Usage Examples

### Basic Voice Interaction
```typescript
// User clicks microphone button
// Speaks: "Vượt đèn đỏ bị phạt bao nhiêu tiền?"
// System transcribes and sends message
// AI responds with penalty information
// If auto-speak enabled, response is read aloud
```

### Voice Settings Configuration
```typescript
// User opens voice settings
// Selects Vietnamese voice
// Adjusts speech rate to 1.2x
// Enables auto-speak
// Settings are saved and applied immediately
```

### Manual Text-to-Speech
```typescript
// User clicks speak button on AI response
// System reads the message content
// User can stop playback at any time
// Message is marked as "spoken"
```

## Troubleshooting

### Common Issues
1. **Microphone not working**: Check browser permissions and device settings
2. **Poor recognition accuracy**: Ensure clear speech and minimal background noise
3. **No Vietnamese voices**: System may fall back to available voices
4. **TTS not working**: Check browser compatibility and audio settings

### Debug Information
- Browser compatibility detection
- Available voices listing
- Permission status checking
- Error logging and reporting
