import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileAttachment } from '@/lib/chat-storage';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected?: (files: FileAttachment[]) => void;
  onFilesUploaded?: (files: FileAttachment[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export function FileUpload({ onFilesSelected, onFilesUploaded, disabled = false, maxFiles = 3, maxFileSize = 10 }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (files: FileList) => {
    const fileArray = Array.from(files);
    const processedFiles: FileAttachment[] = [];

    for (const file of fileArray.slice(0, maxFiles)) {
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File "${file.name}" quá lớn. Kích thước tối đa là ${maxFileSize}MB.`);
        continue;
      }

      // Check file type
      if (!isValidFileType(file.type)) {
        alert(`File "${file.name}" không được hỗ trợ. Chỉ hỗ trợ ảnh (JPG, PNG, GIF, WebP) và tài liệu (PDF, DOC, DOCX, TXT).`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        processedFiles.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: mapFileType(file.type),
          data: base64,
          size: file.size
        });
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Không thể xử lý file "${file.name}".`);
      }
    }

    if (processedFiles.length > 0) {
      const newFiles = [...selectedFiles, ...processedFiles].slice(0, maxFiles);
      setSelectedFiles(newFiles);
      onFilesSelected?.(newFiles);
      onFilesUploaded?.(newFiles);
    }
  };

  const mapFileType = (mimeType: string): 'image' | 'pdf' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const isValidFileType = (mimeType: string): boolean => {
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return allowedTypes.includes(mimeType);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected?.(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType === 'text/plain') return '📃';
    return '📎';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {/* File upload area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          isDragging && !disabled
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-600',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl">📎</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Nhấp để chọn file</span> hoặc kéo thả vào đây
          </div>
          <div className="text-xs text-gray-500">
            Hỗ trợ: JPG, PNG, PDF, DOC, TXT (tối đa {maxFileSize}MB)
          </div>
        </div>
      </div>

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Files đã chọn ({selectedFiles.length}/{maxFiles}):
          </div>
          <div className="space-y-1">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-auto p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={disabled}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
