/**
 * Traffic Report Form Component
 */

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  X, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Sparkles,
  Edit
} from 'lucide-react';
import { Location, ReportType, ReportFormData } from '../types';
import { useGeolocation } from '@/features/traffic-explainer/hooks/useGeolocation';
import { 
  analyzeTrafficImage, 
  suggestReportType, 
  validateImageQuality,
  compressImage 
} from '../utils/image-analysis';
import { formatLocationDisplay } from '../utils/geocoding';

// Form validation schema
const reportFormSchema = z.object({
  type: z.nativeEnum(ReportType),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  images: z.array(z.instanceof(File)).min(1, 'Vui lòng tải lên ít nhất một hình ảnh').max(3, 'Tối đa 3 hình ảnh')
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
  location?: Location; // Làm optional, có thể lấy từ geolocation
  onSubmit: (data: ReportFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface ImageAnalysis {
  file: File;
  analysis: any;
  isValid: boolean;
  preview: string;
  suggestedType?: ReportType;
}

const reportTypeLabels: Record<ReportType, string> = {
  [ReportType.FADED_LINES]: 'Vạch kẻ đường mờ',
  [ReportType.BROKEN_ROAD]: 'Đường bị hỏng',
  [ReportType.TRAFFIC_LIGHT_ISSUE]: 'Đèn giao thông lỗi',
  [ReportType.POTHOLE]: 'Ổ gà trên đường',
  [ReportType.MISSING_SIGN]: 'Thiếu biển báo',
  [ReportType.DEBRIS]: 'Rác thải/Vật cản',
  [ReportType.OTHER]: 'Vấn đề khác'
};

export const ReportForm = ({ 
  location, 
  onSubmit, 
  onCancel, 
  loading = false 
}: ReportFormProps) => {
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [suggestedType, setSuggestedType] = useState<ReportType | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState<Location | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const geolocation = useGeolocation();

  // Sử dụng location từ props hoặc từ geolocation (không auto-use manual address)
  const currentLocation = location || (geolocation.location ? {
    lat: geolocation.location.latitude,
    lng: geolocation.location.longitude,
    address: geolocation.location.address,
    timestamp: Date.now()
  } : null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: ReportType.OTHER,
      description: '',
      images: []
    }
  });

  const watchedType = watch('type');

  // Handle geocoding manual address
  const handleGeocodeAddress = useCallback(async () => {
    if (!manualAddress.trim()) return;
    
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=1&countrycodes=vn`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const result = results[0];
        setGeocodedLocation({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: manualAddress,
          timestamp: Date.now()
        });
        setShowManualInput(false);
      } else {
        alert('Không thể tìm thấy địa chỉ này. Vui lòng kiểm tra lại hoặc nhập chi tiết hơn.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại.');
    } finally {
      setGeocoding(false);
    }
  }, [manualAddress]);

  // Handle image upload and analysis
  const handleImageUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    setAnalyzing(true);
    setAnalysisProgress(0);

    const newImages: ImageAnalysis[] = [];
    const totalFiles = Math.min(files.length, 3 - images.length);

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      try {
        // Compress image if needed
        const compressedFile = await compressImage(file);
        
        // Create preview
        const preview = URL.createObjectURL(compressedFile);
        
        // Analyze image
        setAnalysisProgress(((i + 0.5) / totalFiles) * 100);
        const analysis = await analyzeTrafficImage(compressedFile);
        const quality = await validateImageQuality(compressedFile);
        const suggested = suggestReportType(analysis);
        
        newImages.push({
          file: compressedFile,
          analysis,
          isValid: quality.isValid, // Bỏ điều kiện analysis.isTrafficRelated để linh hoạt hơn
          preview,
          suggestedType: suggested || undefined
        });

        setAnalysisProgress(((i + 1) / totalFiles) * 100);
      } catch (error) {
        console.error('Image analysis failed:', error);
        newImages.push({
          file,
          analysis: null,
          isValid: false,
          preview: URL.createObjectURL(file),
          suggestedType: undefined
        });
      }
    }

    setImages(prev => [...prev, ...newImages]);
    
    // Update form with new images
    const allImages = [...images, ...newImages];
    setValue('images', allImages.map(img => img.file));

    // Suggest report type based on analysis
    const validAnalyses = newImages.filter(img => img.analysis && img.isValid);
    if (validAnalyses.length > 0) {
      const mostConfidentAnalysis = validAnalyses.reduce((max, current) => 
        (current.analysis?.confidence || 0) > (max.analysis?.confidence || 0) ? current : max
      );
      
      if (mostConfidentAnalysis.suggestedType) {
        setSuggestedType(mostConfidentAnalysis.suggestedType);
        setValue('type', mostConfidentAnalysis.suggestedType);
      }
    }

    setAnalyzing(false);
  }, [images, setValue]);

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setValue('images', updated.map(img => img.file));
      return updated;
    });
  }, [setValue]);

  // Handle form submission
  const onFormSubmit = useCallback(async (data: ReportFormValues) => {
    const finalLocation = geocodedLocation || currentLocation;
    
    if (!finalLocation) {
      alert('Vui lòng xác định vị trí hoặc nhập địa chỉ thủ công để tạo báo cáo.');
      return;
    }

    const formData: ReportFormData = {
      location: finalLocation,
      type: data.type,
      description: data.description,
      images: data.images
    };

    await onSubmit(formData);
  }, [currentLocation, geocodedLocation, onSubmit]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const hasValidImages = images.some(img => img.isValid);
  const hasTrafficRelatedImages = images.some(img => img.analysis?.isTrafficRelated);

  return (
    <Card className="w-full max-w-2xl mx-auto m-2 md:m-4">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Báo cáo vấn đề giao thông
        </CardTitle>
        <div className="space-y-2">
          {/* Location Status */}
          <div className="space-y-3">
                         {/* Current Location Display */}
             {(currentLocation || geocodedLocation) ? (
               <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                     <MapPin className="w-5 h-5 text-green-600" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="font-semibold text-green-800 text-sm">
                         {geocodedLocation ? 'Địa chỉ đã xác nhận' : 'Vị trí hiện tại'}
                       </div>
                       {geocodedLocation && (
                         <Badge variant="outline" className="bg-white text-green-700 border-green-300 text-xs">
                           Thủ công
                         </Badge>
                       )}
                     </div>
                     <div className="text-green-700 text-sm break-words">
                       {formatLocationDisplay(geocodedLocation || currentLocation!)}
                     </div>
                   </div>
                 </div>
               </div>
                         ) : geolocation.isLoading ? (
               <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                     <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="font-semibold text-blue-800 text-sm">Đang lấy vị trí</div>
                     <div className="text-blue-600 text-sm">Vui lòng cho phép truy cập vị trí...</div>
                   </div>
                 </div>
               </div>
                         ) : (
               <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                     <MapPin className="w-5 h-5 text-orange-600" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="font-semibold text-orange-800 text-sm">Cần xác định vị trí</div>
                     <div className="text-orange-700 text-sm">Chọn một trong các cách sau để xác định vị trí báo cáo:</div>
                   </div>
                 </div>
                
                                 <div className="space-y-3">
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => geolocation.getCurrentLocation()}
                     className="w-full justify-start h-auto p-3 bg-white hover:bg-blue-50 border-blue-200 transition-colors"
                   >
                     <div className="flex items-center gap-3 w-full">
                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                         <MapPin className="w-5 h-5 text-blue-600" />
                       </div>
                       <div className="text-left flex-1 min-w-0">
                         <div className="font-semibold text-blue-900 text-sm">Sử dụng vị trí hiện tại</div>
                         <div className="text-blue-600 text-xs mt-0.5">Tự động lấy từ GPS của thiết bị</div>
                       </div>
                     </div>
                   </Button>
                   
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => setShowManualInput(true)}
                     className="w-full justify-start h-auto p-3 bg-white hover:bg-green-50 border-green-200 transition-colors"
                   >
                     <div className="flex items-center gap-3 w-full">
                       <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                         <Edit className="w-5 h-5 text-green-600" />
                       </div>
                       <div className="text-left flex-1 min-w-0">
                         <div className="font-semibold text-green-900 text-sm">Nhập địa chỉ thủ công</div>
                         <div className="text-green-600 text-xs mt-0.5">Gõ địa chỉ cụ thể của bạn</div>
                       </div>
                     </div>
                   </Button>
                 </div>
              </div>
            )}

                         {/* Manual Address Input Modal */}
             {showManualInput && (
               <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                       <Edit className="w-4 h-4 text-green-600" />
                     </div>
                     <h4 className="font-semibold text-gray-900">Nhập địa chỉ thủ công</h4>
                   </div>
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                       setShowManualInput(false);
                       setManualAddress('');
                       setGeocodedLocation(null);
                     }}
                     className="h-8 w-8 p-0"
                   >
                     <X className="w-4 h-4" />
                   </Button>
                 </div>
                 
                 <div className="space-y-4">
                   <div>
                     <Input
                       placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                       value={manualAddress}
                       onChange={(e) => setManualAddress(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           handleGeocodeAddress();
                         }
                       }}
                       disabled={geocoding}
                       className="w-full"
                     />
                     <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                       💡 <strong>Mẹo:</strong> Nhập địa chỉ càng chi tiết càng tốt bao gồm số nhà, tên đường, quận/huyện, và tỉnh/thành phố
                     </p>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-2">
                     <Button
                       type="button"
                       onClick={handleGeocodeAddress}
                       disabled={!manualAddress.trim() || geocoding}
                       className="flex-1 order-1"
                     >
                       {geocoding ? (
                         <>
                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                           Đang tìm kiếm...
                         </>
                       ) : (
                         <>
                           <MapPin className="w-4 h-4 mr-2" />
                           Xác nhận địa chỉ
                         </>
                       )}
                     </Button>
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => {
                         setShowManualInput(false);
                         setManualAddress('');
                       }}
                       className="order-2 sm:w-auto"
                     >
                       Hủy
                     </Button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 md:space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Hình ảnh minh chứng *</Label>
            
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Kéo thả hoặc click để tải lên hình ảnh
                </p>
                <p className="text-xs text-gray-600">
                  PNG, JPG, WEBP • Tối đa 3 hình ảnh • 5MB/file
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              />
            </div>

            {/* Analysis Progress */}
            {analyzing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Đang phân tích hình ảnh với AI...</span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
              </div>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    {/* Analysis Results */}
                    <div className="absolute bottom-2 left-2 right-2">
                      {image.analysis && (
                        <div className="flex gap-1">
                          {image.isValid ? (
                            <Badge variant="default" className="bg-green-500 text-green-50 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Hợp lệ
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Không hợp lệ
                            </Badge>
                          )}
                          {image.analysis.confidence > 0 && (
                            <Badge variant="outline" className="bg-white/90 text-xs">
                              {image.analysis.confidence}% tin cậy
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Analysis Alerts - Làm linh hoạt hơn */}
            {images.length > 0 && !hasTrafficRelatedImages && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Gợi ý:</strong> Hình ảnh tốt nhất cho báo cáo là ảnh chụp trực tiếp các vấn đề giao thông. 
                  Tuy nhiên, bạn vẫn có thể tiếp tục nếu ảnh này liên quan đến giao thông.
                </AlertDescription>
              </Alert>
            )}

            {errors.images && (
              <p className="text-sm text-red-500">{errors.images.message}</p>
            )}
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-semibold">
              Loại vấn đề *
              {suggestedType && (
                <Badge variant="outline" className="ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI gợi ý: {reportTypeLabels[suggestedType]}
                </Badge>
              )}
            </Label>
            <Select
              value={watchedType}
              onValueChange={(value) => setValue('type', value as ReportType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại vấn đề" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reportTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                    {value === suggestedType && (
                      <Badge variant="outline" className="ml-2">
                        <Sparkles className="w-3 h-3" />
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Mô tả chi tiết *
            </Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết vấn đề giao thông bạn phát hiện..."
              className="min-h-[100px]"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* AI Analysis Results */}
          {hasValidImages && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Phân tích AI</Label>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                {images.filter(img => img.analysis && img.isValid).map((image, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">Hình ảnh {index + 1}:</p>
                    <p className="text-gray-600">{image.analysis.description}</p>
                    {image.analysis.detectedIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {image.analysis.detectedIssues.map((issue: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 order-2 sm:order-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!isValid || loading || images.length === 0 || (!currentLocation && !geocodedLocation)}
              className="flex-1 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Gửi báo cáo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
