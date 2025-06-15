import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export interface ChatHistory {
  role: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

export interface FileData {
  mimeType: string;
  data: string; // base64 encoded
}

export class EnhancedGeminiService {
  private model: any;
  private chatHistory: ChatHistory[] = [];

  constructor() {
    this.model = genAI.models;
  }

  async sendMessage(
    message: string,
    files?: FileData[],
    useHistory: boolean = true
  ): Promise<string> {
    try {
      const userParts: any[] = [{ text: message }];
      
      // Add files if provided
      if (files && files.length > 0) {
        files.forEach(file => {
          userParts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.data
            }
          });
        });
      }

      const userMessage: ChatHistory = {
        role: 'user',
        parts: userParts
      };

      let contents: ChatHistory[];
      
      if (useHistory && this.chatHistory.length > 0) {
        // Include chat history for multiturn conversation
        contents = [...this.chatHistory, userMessage];
      } else {
        contents = [userMessage];
      }

      const response = await this.model.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
          systemInstruction: `Bạn là G-LawBot, một chuyên gia về luật giao thông Việt Nam.

NHIỆM VỤ:
- Trả lời câu hỏi về luật giao thông Việt Nam một cách chính xác
- Nếu có ảnh hoặc tài liệu, hãy phân tích chúng liên quan đến luật giao thông
- Trích dẫn cụ thể điều, khoản, nghị định khi có thể
- Giải thích rõ ràng, dễ hiểu cho người Việt Nam
- Nhớ ngữ cảnh cuộc trò chuyện trước đó

QUY TẮC:
1. Luôn trả lời bằng tiếng Việt
2. Sử dụng ngôn ngữ thân thiện, chuyên nghiệp
3. Khi phân tích ảnh, mô tả chi tiết những gì bạn thấy liên quan đến giao thông
4. Đưa ra lời khuyên an toàn giao thông khi phù hợp
5. Nhớ thông tin từ tin nhắn trước trong cuộc trò chuyện`,
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      const responseText = response.text || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
      
      // Add to chat history
      if (useHistory) {
        this.chatHistory.push(userMessage);
        this.chatHistory.push({
          role: 'model',
          parts: [{ text: responseText }]
        });
        
        // Keep only last 10 exchanges to manage memory
        if (this.chatHistory.length > 20) {
          this.chatHistory = this.chatHistory.slice(-20);
        }
      }

      return responseText;
    } catch (error) {
      console.error('Enhanced Gemini API error:', error);
      throw new Error('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.');
    }
  }

  async *sendMessageStream(
    message: string,
    files?: FileData[],
    useHistory: boolean = true
  ): AsyncGenerator<string, void, unknown> {
    const userParts: any[] = [{ text: message }];
    
    if (files && files.length > 0) {
      files.forEach(file => {
        userParts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data
          }
        });
      });
    }

    const userMessage: ChatHistory = {
      role: 'user',
      parts: userParts
    };

    let contents: ChatHistory[];
    
    if (useHistory && this.chatHistory.length > 0) {
      contents = [...this.chatHistory, userMessage];
    } else {
      contents = [userMessage];
    }

    const stream = await this.model.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: `Bạn là G-LawBot, một chuyên gia về luật giao thông Việt Nam.

NHIỆM VỤ:
- Trả lời câu hỏi về luật giao thông Việt Nam một cách chính xác
- Nếu có ảnh hoặc tài liệu, hãy phân tích chúng liên quan đến luật giao thông
- Trích dẫn cụ thể điều, khoản, nghị định khi có thể
- Giải thích rõ ràng, dễ hiểu cho người Việt Nam
- Nhớ ngữ cảnh cuộc trò chuyện trước đó

QUY TẮC:
1. Luôn trả lời bằng tiếng Việt
2. Sử dụng ngôn ngữ thân thiện, chuyên nghiệp
3. Khi phân tích ảnh, mô tả chi tiết những gì bạn thấy liên quan đến giao thông
4. Đưa ra lời khuyên an toàn giao thông khi phù hợp
5. Nhớ thông tin từ tin nhắn trước trong cuộc trò chuyện`,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    let fullResponse = '';
    
    // Stream and collect response
    for await (const chunk of stream) {
      const chunkText = chunk.text || '';
      fullResponse += chunkText;
      yield chunkText;
    }
    
    // Add to history after stream completes
    if (useHistory) {
      this.chatHistory.push(userMessage);
      this.chatHistory.push({
        role: 'model',
        parts: [{ text: fullResponse }]
      });
      
      if (this.chatHistory.length > 20) {
        this.chatHistory = this.chatHistory.slice(-20);
      }
    }
  }

  getChatHistory(): ChatHistory[] {
    return [...this.chatHistory];
  }

  clearHistory(): void {
    this.chatHistory = [];
  }

  setHistory(history: ChatHistory[]): void {
    this.chatHistory = [...history];
  }
}

export const enhancedGemini = new EnhancedGeminiService();
export const enhancedGeminiService = enhancedGemini; // Backward compatibility
