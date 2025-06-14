import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { chatStorage, ChatSession } from '@/lib/chat-storage';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  className?: string;
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SessionItem({ session, isActive, onClick, onDelete }: SessionItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-l-2 border-yellow-500'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white text-xs">
            💬
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {session.title}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(session.updatedAt)}
            </p>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {session.messages.length}
            </Badge>
          </div>
        </div>
        
        {(isHovered || isActive) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity size-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            🗑️
          </Button>
        )}
      </div>
    </div>
  );
}

interface SessionGroupProps {
  title: string;
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

function SessionGroup({ title, sessions, currentSessionId, onSelectSession, onDeleteSession }: SessionGroupProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
        {title}
      </h3>
      <div className="space-y-1">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onClick={() => onSelectSession(session.id)}
            onDelete={() => onDeleteSession(session.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatSidebar({
  isOpen,
  onToggle,
  currentSessionId,
  onSelectSession,
  onNewChat,
  className
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<{ [key: string]: ChatSession[] }>({});
  const [filteredSessions, setFilteredSessions] = useState<{ [key: string]: ChatSession[] }>({});

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = chatStorage.searchSessions(searchQuery);
      setFilteredSessions({ 'Kết quả tìm kiếm': searchResults });
    } else {
      setFilteredSessions(sessions);
    }
  }, [searchQuery, sessions]);

  const loadSessions = () => {
    const groupedSessions = chatStorage.getSessionsGrouped();
    setSessions(groupedSessions);
  };

  const handleDeleteSession = (sessionId: string) => {
    chatStorage.deleteSession(sessionId);
    loadSessions();
    
    // If deleting current session, create a new one
    if (sessionId === currentSessionId) {
      onNewChat();
    }
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả lịch sử chat?')) {
      chatStorage.clearAllSessions();
      loadSessions();
      onNewChat();
    }
  };

  const handleExport = () => {
    const data = chatStorage.exportSessions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'g-lawbot-chat-history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalSessions = Object.values(sessions).flat().length;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-transform duration-300 flex flex-col',
        'w-80 lg:w-72',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        className
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-white">🤖</span>
              </div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                G-LawBot
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              ✕
            </Button>
          </div>
          
          {/* New Chat Button */}
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
          >
            <span className="mr-2">➕</span>
            Chat mới
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Input
            placeholder="Tìm kiếm chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Session List */}
        <ScrollArea className="flex-1 p-4">
          {Object.keys(filteredSessions).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">Chưa có lịch sử chat</p>
              <p className="text-xs mt-1">Bắt đầu chat mới để lưu lịch sử</p>
            </div>
          ) : (
            Object.entries(filteredSessions).map(([groupName, groupSessions]) => (
              <SessionGroup
                key={groupName}
                title={groupName}
                sessions={groupSessions}
                currentSessionId={currentSessionId}
                onSelectSession={onSelectSession}
                onDeleteSession={handleDeleteSession}
              />
            ))
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs">
              {totalSessions} cuộc trò chuyện
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex-1 text-xs"
              disabled={totalSessions === 0}
            >
              📤 Xuất
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              disabled={totalSessions === 0}
            >
              🗑️ Xóa tất cả
            </Button>
          </div>
          
          <Separator className="my-3" />
          
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>G-Traffic Heroes 2025</p>
            <p>Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    </>
  );
}
