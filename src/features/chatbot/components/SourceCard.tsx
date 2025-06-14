import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DocumentChunk } from '@/lib/pdf-processor';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SourceCardProps {
  sources: DocumentChunk[];
  confidence: 'high' | 'medium' | 'low';
}

interface SourceItemProps {
  source: DocumentChunk;
  index: number;
  onViewDetails: (source: DocumentChunk) => void;
}

function SourceItem({ source, index, onViewDetails }: SourceItemProps) {
  return (
    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0">
        <div className="size-6 sm:size-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
          {index}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
            📄 {source.metadata.source}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
          {source.metadata.article && (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 px-1.5 py-0.5">
              {source.metadata.article}
            </Badge>
          )}
          
          {source.metadata.section && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 px-1.5 py-0.5">
              {source.metadata.section}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 px-1.5 py-0.5">
            📍 Trang {source.metadata.page}
          </Badge>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {source.content.substring(0, 100)}...
        </p>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(source)}
          className="text-xs h-auto p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          👁️ Xem chi tiết
        </Button>
      </div>
    </div>
  );
}

interface SourceDetailModalProps {
  source: DocumentChunk | null;
  isOpen: boolean;
  onClose: () => void;
}

function SourceDetailModal({ source, isOpen, onClose }: SourceDetailModalProps) {
  if (!isOpen || !source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">📋 Chi tiết tài liệu</CardTitle>
              <p className="text-blue-100 text-sm mt-1">{source.metadata.source}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 size-8 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              {source.metadata.article && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {source.metadata.article}
                </Badge>
              )}
              
              {source.metadata.section && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {source.metadata.section}
                </Badge>
              )}
              
              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                📍 Trang {source.metadata.page}
              </Badge>
            </div>
            
            <Separator />
            
            {/* Content */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">📖 Nội dung:</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {source.content}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SourceCard({ sources, confidence }: SourceCardProps) {
  const [selectedSource, setSelectedSource] = useState<DocumentChunk | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (sources.length === 0) return null;

  const handleViewDetails = (source: DocumentChunk) => {
    setSelectedSource(source);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSource(null);
  };

  const confidenceConfig = {
    high: {
      color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
      icon: '🎯',
      text: 'Độ tin cậy cao'
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
      icon: '⚡',
      text: 'Độ tin cậy trung bình'
    },
    low: {
      color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
      icon: '⚠️',
      text: 'Độ tin cậy thấp'
    }
  };

  const config = confidenceConfig[confidence];

  return (
    <>
      <Card className="border-l-4 border-l-blue-500 shadow-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              📚 Nguồn tham khảo
            </CardTitle>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={cn("border", config.color)}>
                    {config.icon} {config.text}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mức độ liên quan của thông tin với câu hỏi</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Tìm thấy {sources.length} tài liệu liên quan từ luật giao thông Việt Nam
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {sources.map((source, index) => (
            <SourceItem
              key={source.id}
              source={source}
              index={index + 1}
              onViewDetails={handleViewDetails}
            />
          ))}
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <span className="mt-0.5">ℹ️</span>
              <span>
                Thông tin được trích xuất từ <strong>Luật Giao thông đường bộ Việt Nam</strong> và 
                các văn bản pháp luật liên quan. Vui lòng tham khảo văn bản gốc để có thông tin chính xác nhất.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <SourceDetailModal 
        source={selectedSource}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
