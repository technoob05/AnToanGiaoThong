import { v4 as uuidv4 } from 'uuid';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: StoredChatMessage[];
  isActive: boolean;
}

export interface StoredChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  sources?: any[];
  confidence?: 'high' | 'medium' | 'low';
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  mimeType: string;
}

class ChatStorageService {
  private readonly STORAGE_KEY = 'g-lawbot-sessions';
  private readonly MAX_SESSIONS = 50;

  // Get all chat sessions
  getSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  // Get a specific session
  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  // Create new chat session
  createSession(title?: string): ChatSession {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: title || this.generateSessionTitle(),
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      isActive: true
    };

    this.saveSession(newSession);
    return newSession;
  }

  // Save or update a session
  saveSession(session: ChatSession): void {
    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      session.updatedAt = new Date();
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session); // Add to beginning
      }

      // Limit number of sessions
      if (sessions.length > this.MAX_SESSIONS) {
        sessions.splice(this.MAX_SESSIONS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }

  // Add message to session
  addMessage(sessionId: string, message: StoredChatMessage): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    session.messages.push(message);
    
    // Update session title based on first user message
    if (session.messages.length === 1 && message.role === 'user') {
      session.title = this.generateTitleFromMessage(message.content);
    }

    this.saveSession(session);
  }

  // Delete a session
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  // Clear all sessions
  clearAllSessions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing sessions:', error);
    }
  }

  // Search sessions
  searchSessions(query: string): ChatSession[] {
    const sessions = this.getSessions();
    const queryLower = query.toLowerCase();
    
    return sessions.filter(session => {
      // Search in title
      if (session.title.toLowerCase().includes(queryLower)) return true;
      
      // Search in messages
      return session.messages.some(message => 
        message.content.toLowerCase().includes(queryLower)
      );
    });
  }

  // Get sessions grouped by date
  getSessionsGrouped(): { [key: string]: ChatSession[] } {
    const sessions = this.getSessions();
    const grouped: { [key: string]: ChatSession[] } = {};
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    sessions.forEach(session => {
      const sessionDate = new Date(session.updatedAt);
      
      if (sessionDate >= today) {
        if (!grouped['Hôm nay']) grouped['Hôm nay'] = [];
        grouped['Hôm nay'].push(session);
      } else if (sessionDate >= yesterday) {
        if (!grouped['Hôm qua']) grouped['Hôm qua'] = [];
        grouped['Hôm qua'].push(session);
      } else if (sessionDate >= weekAgo) {
        if (!grouped['7 ngày qua']) grouped['7 ngày qua'] = [];
        grouped['7 ngày qua'].push(session);
      } else if (sessionDate >= monthAgo) {
        if (!grouped['30 ngày qua']) grouped['30 ngày qua'] = [];
        grouped['30 ngày qua'].push(session);
      } else {
        if (!grouped['Cũ hơn']) grouped['Cũ hơn'] = [];
        grouped['Cũ hơn'].push(session);
      }
    });

    return grouped;
  }

  // Generate session title
  private generateSessionTitle(): string {
    const titles = [
      'Câu hỏi luật giao thông',
      'Tư vấn ATGT',
      'Hỏi đáp pháp luật',
      'Chat với G-LawBot',
      'Tìm hiểu quy định'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  // Generate title from first message
  private generateTitleFromMessage(content: string): string {
    // Take first 40 characters or until first question mark/period
    const truncated = content.length > 40 
      ? content.substring(0, 40) + '...'
      : content;
    
    return truncated.split(/[.?!]/)[0] || this.generateSessionTitle();
  }

  // Export sessions as JSON
  exportSessions(): string {
    const sessions = this.getSessions();
    return JSON.stringify(sessions, null, 2);
  }

  // Import sessions from JSON
  importSessions(jsonData: string): boolean {
    try {
      const sessions = JSON.parse(jsonData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      return true;
    } catch (error) {
      console.error('Error importing sessions:', error);
      return false;
    }
  }
}

export const chatStorage = new ChatStorageService();
