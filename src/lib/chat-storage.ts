export interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'video' | 'audio' | 'document';
  size: number;
  data: string; // base64
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

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  updatedAt: Date;
  messages: StoredChatMessage[];
}

// Keep backward compatibility
export interface StoredChat extends ChatSession {}

export class ChatStorageService {
  private static instance: ChatStorageService;
  private storageKey = 'g-lawbot-chats';

  static getInstance(): ChatStorageService {
    if (!ChatStorageService.instance) {
      ChatStorageService.instance = new ChatStorageService();
    }
    return ChatStorageService.instance;
  }

  createSession(): ChatSession {
    const now = new Date();
    const session: ChatSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: 'Cuộc trò chuyện mới',
      timestamp: now,
      updatedAt: now,
      messages: []
    };
    this.saveSession(session);
    return session;
  }

  getSession(id: string): ChatSession | null {
    return this.getChat(id);
  }

  saveSession(session: ChatSession): void {
    this.saveChat(session);
  }

  addMessage(sessionId: string, message: StoredChatMessage): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.messages.push(message);
      session.updatedAt = new Date();
      
      // Update title if it's the first user message
      if (session.messages.length === 2 && message.role === 'user') {
        session.title = this.generateChatTitle(message.content);
      }
      
      this.saveSession(session);
    }
  }

  deleteSession(id: string): void {
    this.deleteChat(id);
  }

  clearAllSessions(): void {
    this.clearAllChats();
  }

  searchSessions(query: string): ChatSession[] {
    const sessions = this.getAllChats();
    const searchTerm = query.toLowerCase();
    
    return sessions.filter(session => {
      return session.title.toLowerCase().includes(searchTerm) ||
             session.messages.some(msg => msg.content.toLowerCase().includes(searchTerm));
    });
  }

  getSessionsGrouped(): { [key: string]: ChatSession[] } {
    const sessions = this.getAllChats();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: ChatSession[] } = {
      'Hôm nay': [],
      'Hôm qua': [],
      '7 ngày qua': [],
      'Cũ hơn': []
    };

    sessions.forEach(session => {
      const sessionDate = new Date(session.updatedAt);
      if (sessionDate >= today) {
        groups['Hôm nay'].push(session);
      } else if (sessionDate >= yesterday) {
        groups['Hôm qua'].push(session);
      } else if (sessionDate >= weekAgo) {
        groups['7 ngày qua'].push(session);
      } else {
        groups['Cũ hơn'].push(session);
      }
    });

    return groups;
  }

  exportSessions(): string {
    const sessions = this.getAllChats();
    return JSON.stringify(sessions, null, 2);
  }

  saveChat(chat: StoredChat): void {
    try {
      const chats = this.getAllChats();
      const existingIndex = chats.findIndex(c => c.id === chat.id);
      
      if (existingIndex >= 0) {
        chats[existingIndex] = chat;
      } else {
        chats.unshift(chat); // Add to beginning
      }
      
      // Keep only last 50 chats
      if (chats.length > 50) {
        chats.splice(50);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }

  getAllChats(): StoredChat[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const chats = JSON.parse(stored);
      return chats.map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
        updatedAt: new Date(chat.updatedAt || chat.lastActivity || chat.timestamp),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  }

  getChat(id: string): StoredChat | null {
    const chats = this.getAllChats();
    return chats.find(chat => chat.id === id) || null;
  }

  deleteChat(id: string): void {
    try {
      const chats = this.getAllChats();
      const filtered = chats.filter(chat => chat.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }

  clearAllChats(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing chats:', error);
    }
  }

  generateChatTitle(firstMessage: string): string {
    // Generate a meaningful title from the first message
    const cleaned = firstMessage.trim().substring(0, 50);
    if (cleaned.length < firstMessage.trim().length) {
      return cleaned + '...';
    }
    return cleaned || 'Cuộc trò chuyện mới';
  }

  createNewChat(): StoredChat {
    const now = new Date();
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: 'Cuộc trò chuyện mới',
      timestamp: now,
      updatedAt: now,
      messages: []
    };
  }
}

export const chatStorage = ChatStorageService.getInstance();
