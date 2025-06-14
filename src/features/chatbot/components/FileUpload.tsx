import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FileAttachment } from '@/lib/chat-storage';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

const defaultAcceptedTypes = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'video/mp4',
  'video/avi',
  'video/quicktime'
];

export function FileUpload({
  onFilesUploaded,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = defaultAcceptedTypes,
  className
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Check file limits
    const totalFiles = uploadedFiles.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Chỉ được upload tối đa ${maxFiles} files`);
      return;
    }

    // Create uploading file objects
    const newUploadingFiles: UploadingFile[] = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Process each file
    for (const uploadingFile of newUploadingFiles) {
      try {
        await processFile(uploadingFile);
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, error: 'Lỗi khi xử lý file' }
              : f
          )
        );
      }
    }
  }, [uploadedFiles.length, maxFiles]);

  const processFile = async (uploadingFile: UploadingFile): Promise<void> => {
    const { file } = uploadingFile;

    // Simulate upload progress
    const updateProgress = (progress: number) => {
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id ? { ...f, progress } : f
        )
      );
    };

    // Convert file to data URL/blob URL for preview
    return new Promise((resolve, reject) => {
      // Simulate upload with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Create file URL
          const url = URL.createObjectURL(file);
          
          const fileAttachment: FileAttachment = {
            id: uploadingFile.id,
            name: file.name,
            type: getFileType(file.type),
            size: file.size,
            url: url,
            mimeType: file.type
          };

          // Add to uploaded files
          setUploadedFiles(prev => {
            const newFiles = [...prev, fileAttachment];
            onFilesUploaded(newFiles);
            return newFiles;
          });

          // Remove from uploading
          setUploadingFiles(prev => 
            prev.filter(f => f.id !== uploadingFile.id)
          );

          resolve();
        } else {
          updateProgress(progress);
        }
      }, 100);
    });
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    return 'file';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.url); // Clean up blob URL
      }
      const newFiles = prev.filter(f => f.id !== fileId);
      onFilesUploaded(newFiles);
      return newFiles;
    });
  };

  const getFileIcon = (type: string): string => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'pdf': return '📄';
      case 'document': return '📝';
      case 'spreadsheet': return '📊';
      default: return '📎';
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-2xl">
            {isDragActive ? '📤' : '📎'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isDragActive
                ? 'Thả files vào đây...'
                : 'Kéo thả files hoặc click để chọn'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hỗ trợ: Ảnh, PDF, Word, Excel, Audio, Video (tối đa {formatFileSize(maxSize)})
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Đang upload...
          </h4>
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {getFileIcon(getFileType(uploadingFile.file.type))}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {uploadingFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={uploadingFile.progress} className="flex-1 h-2" />
                    <span className="text-xs text-gray-500">
                      {Math.round(uploadingFile.progress)}%
                    </span>
                  </div>
                  {uploadingFile.error && (
                    <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Files đã upload ({uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-lg">
                  {getFileIcon(file.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  🗑️
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Limits Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>• Tối đa {maxFiles} files, mỗi file tối đa {formatFileSize(maxSize)}</p>
        <p>• Hỗ trợ: JPG, PNG, GIF, PDF, DOCX, XLSX, MP3, MP4, TXT</p>
        <p>• Files sẽ được phân tích bởi Gemini AI để trả lời câu hỏi</p>
      </div>
    </div>
  );
}
