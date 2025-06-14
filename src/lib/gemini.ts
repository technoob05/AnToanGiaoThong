import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  systemInstruction: `Bạn là G-LawBot, một chuyên gia về luật giao thông Việt Nam. 
Nhiệm vụ của bạn:
1. Trả lời các câu hỏi về luật giao thông Việt Nam một cách chính xác, dễ hiểu
2. Giải thích các tình huống vi phạm giao thông và mức phạt theo Nghị định 100/2019/NĐ-CP
3. Đưa ra lời khuyên an toàn giao thông phù hợp với từng đối tượng (học sinh, sinh viên, người lớn)
4. Sử dụng ngôn ngữ thân thiện, dễ hiểu cho người Việt Nam
5. Luôn khuyến khích tuân thủ luật giao thông và an toàn

Trả lời bằng tiếng Việt. Nếu có thể, hãy đưa ra ví dụ cụ thể và các con số phạt chính xác.`
});

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export class GeminiService {
  private chat: any;

  constructor() {
    this.initializeChat();
  }

  private initializeChat() {
    this.chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.9,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      throw new Error('Không thể kết nối với AI. Vui lòng thử lại sau.');
    }
  }

  async sendMessageWithContext(message: string, context?: string): Promise<string> {
    try {
      const contextualMessage = context 
        ? `Bối cảnh: ${context}\n\nCâu hỏi: ${message}`
        : message;
      
      return await this.sendMessage(contextualMessage);
    } catch (error) {
      console.error('Error sending contextual message:', error);
      throw error;
    }
  }

  resetChat() {
    this.initializeChat();
  }

  async getTrafficLawSuggestions(location?: string): Promise<string[]> {
    try {
      const locationContext = location ? `tại khu vực ${location}` : '';
      const prompt = `Đưa ra 3 gợi ý ngắn gọn về an toàn giao thông ${locationContext} cho người dân Việt Nam. Mỗi gợi ý không quá 50 từ.`;
      
      const result = await this.sendMessage(prompt);
      
      // Parse the response into an array of suggestions
      const suggestions = result.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3);
      
      return suggestions.length > 0 ? suggestions : [
        'Luôn đội mũ bảo hiểm khi đi xe máy',
        'Tuân thủ tín hiệu đèn giao thông',
        'Không sử dụng điện thoại khi lái xe'
      ];
    } catch (error) {
      console.error('Error getting traffic law suggestions:', error);
      return [
        'Luôn đội mũ bảo hiểm khi đi xe máy',
        'Tuân thủ tín hiệu đèn giao thông', 
        'Không sử dụng điện thoại khi lái xe'
      ];
    }
  }
}

export const geminiService = new GeminiService();
