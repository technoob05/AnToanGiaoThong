import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Car, 
  Lightbulb, 
  Terminal, 
  Sparkles, 
  Grid3X3, 
  List,
  BarChart3,
  Heart,
  Filter,
  RefreshCw,
  Share2,
  ImagePlus,
  MapPin,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useTrafficExplainer } from "../hooks/useTrafficExplainer";
import { SlideCard } from "./SlideCard";
import { LoadingAnimation } from "./LoadingAnimation";
import { CategorySelector } from "./CategorySelector";
import { Slide } from "../types";

export const TrafficExplainerInterface = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'scroll'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<Slide['category'] | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    slides,
    isLoading,
    error,
    progress,
    generateExplanation,
    toggleFavorite,
    setCurrentSlide,
    isTrafficRelatedImage,
    geolocation,
  } = useTrafficExplainer();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (prompt.trim()) {
      generateExplanation(prompt, selectedImage || undefined);
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    generateExplanation(examplePrompt, selectedImage || undefined);
  };

  // Xử lý upload hình ảnh
  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isTrafficRelatedImage(file)) {
        setSelectedImage(file);
        
        try {
          const preview = await handleImageUpload(file);
          setImagePreview(preview);
        } catch (error) {
          console.error('Error processing image:', error);
          alert('Không thể xử lý hình ảnh. Vui lòng thử lại.');
        }
      } else {
        alert('Vui lòng chọn file hình ảnh hợp lệ (JPEG, PNG, WEBP)');
      }
    }
  };

  // Xóa hình ảnh đã chọn
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mở file selector
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setPrompt("");
    setCategoryFilter('all');
    setShowFavoritesOnly(false);
    handleRemoveImage();
  };

  const handleShare = async () => {
    if (navigator.share && slides.length > 0) {
      try {
        await navigator.share({
          title: 'Bài học An Toàn Giao Thông',
          text: `Tôi vừa học được ${slides.length} điều thú vị về an toàn giao thông!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const filteredSlides = slides.filter(slide => {
    if (showFavoritesOnly && !progress.favoriteSlides.includes(slide.id)) {
      return false;
    }
    if (categoryFilter !== 'all' && slide.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const favoriteCount = progress.favoriteSlides.length;
  const completionPercentage = slides.length > 0 ? Math.round((progress.currentSlide / slides.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Enhanced Header Section */}
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4" 
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #f97316, #eab308)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "'Inter', sans-serif"
                    }}>
                  🛡️ Trợ Lý An Toàn Giao Thông
                </h1>
              </motion.div>
              
              <motion.p 
                className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Nhận giải thích sinh động và dễ hiểu về các quy tắc an toàn giao thông với 
                <Badge variant="outline" className="mx-2 text-sm">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI + Minh Họa
                </Badge>
                tùy chỉnh
              </motion.p>

              {/* Stats Bar */}
              {slides.length > 0 && (
                <motion.div 
                  className="flex justify-center items-center gap-6 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span>{slides.length} slides</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{favoriteCount} yêu thích</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <span>{completionPercentage}% hoàn thành</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-2xl border-2 border-orange-200 bg-gradient-to-br from-white via-orange-50/50 to-white overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-orange-100 to-red-100">
                <CardTitle className="text-2xl flex items-center gap-3" style={{
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  <Car className="h-7 w-7 text-orange-500" />
                  Hỏi về An Toàn Giao Thông
                </CardTitle>
                <CardDescription className="text-base">
                  Đặt câu hỏi về luật giao thông, biển báo, hoặc cách phòng tránh tai nạn
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ví dụ: Tại sao không được sử dụng điện thoại khi lái xe?"
                      value={prompt}
                      onChange={handlePromptChange}
                      rows={4}
                      className="resize-none bg-white border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-base text-gray-900 placeholder:text-gray-500"
                      disabled={isLoading}
                    />

                    {/* Upload hình ảnh và thông tin vị trí */}
                    <div className="space-y-4">
                      {/* Upload hình ảnh */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            📸 Thêm hình ảnh giao thông (không bắt buộc)
                          </label>
                          {imagePreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveImage}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />

                        {!imagePreview ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleImageUploadClick}
                            className="w-full h-20 border-2 border-dashed border-orange-300 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 text-gray-700"
                            disabled={isLoading}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <ImagePlus className="h-6 w-6 text-orange-500" />
                              <span className="text-sm">
                                Chọn ảnh đường phố, biển báo, vạch kẻ đường...
                              </span>
                              <span className="text-xs text-gray-500">
                                (JPEG, PNG, WEBP - Không khắt khe về nội dung)
                              </span>
                            </div>
                          </Button>
                        ) : (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg border-2 border-orange-200"
                            />
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              ✓ Đã chọn ảnh
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Thông tin vị trí */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            📍 Vị trí hiện tại
                          </label>
                          {geolocation.location && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <MapPin className="h-3 w-3 mr-1" />
                              Đã lấy vị trí
                            </Badge>
                          )}
                        </div>

                        {geolocation.location ? (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                              <div className="text-sm text-gray-700">
                                <div className="font-medium">{geolocation.location.address}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {geolocation.location.latitude.toFixed(4)}, {geolocation.location.longitude.toFixed(4)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : geolocation.isLoading ? (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <motion.div 
                                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <span className="text-sm text-blue-700">Đang lấy vị trí...</span>
                            </div>
                          </div>
                        ) : geolocation.error ? (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div className="text-sm text-yellow-700">
                                <div className="font-medium">Không thể lấy vị trí</div>
                                <div className="text-xs mt-1">{geolocation.error}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Vị trí sẽ được lấy tự động khi bạn gửi câu hỏi
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          type="submit" 
                          disabled={isLoading || !prompt.trim()}
                          className="px-8 py-3 text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isLoading ? (
                            <>
                              <motion.div 
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Tạo Giải Thích
                            </>
                          )}
                        </Button>
                        
                        {slides.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={handleReset}
                            className="px-4 py-3"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Làm mới
                          </Button>
                        )}
                      </div>

                      {slides.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={handleShare}
                          className="px-4 py-3"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Chia sẻ
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Selector - Show when no slides */}
          {!isLoading && slides.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <CategorySelector 
                onSelectPrompt={handleExampleClick}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-2 border-red-200 bg-red-50">
                  <Terminal className="h-5 w-5" />
                  <AlertTitle className="text-lg">Có lỗi xảy ra</AlertTitle>
                  <AlertDescription className="text-base">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Animation */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingAnimation 
                  stage="generating"
                  progress={progress.timeSpent > 0 ? Math.min(90, (progress.timeSpent / 30000) * 100) : 0}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Display */}
          <AnimatePresence>
            {!isLoading && slides.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Results Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      📚 Bài Giảng An Toàn Giao Thông
                    </h2>
                    <p className="text-gray-600">
                      {filteredSlides.length} trong {slides.length} slides
                      {favoriteCount > 0 && ` • ${favoriteCount} yêu thích`}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {/* Filter Controls */}
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as Slide['category'] | 'all')}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="all">Tất cả</option>
                        <option value="safety">An Toàn</option>
                        <option value="rules">Quy Tắc</option>
                        <option value="signs">Biển Báo</option>
                        <option value="tips">Mẹo Hay</option>
                      </select>
                    </div>

                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    >
                      <Heart className={cn(
                        "h-4 w-4 mr-1",
                        showFavoritesOnly ? "fill-current" : ""
                      )} />
                      Yêu thích
                    </Button>

                    {/* View Mode Toggle */}
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'scroll')}>
                      <TabsList className="grid grid-cols-2 h-9">
                        <TabsTrigger value="grid" className="text-xs">
                          <Grid3X3 className="h-3 w-3 mr-1" />
                          Lưới
                        </TabsTrigger>
                        <TabsTrigger value="scroll" className="text-xs">
                          <List className="h-3 w-3 mr-1" />
                          Cuộn
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* Progress Bar */}
                {slides.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Tiến độ học tập</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                )}

                {/* Content */}
                <Tabs value={viewMode} className="w-full">
                  <TabsContent value="grid" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSlides.map((slide, index) => (
                        <SlideCard
                          key={slide.id}
                          slide={slide}
                          index={index}
                          isFavorite={progress.favoriteSlides.includes(slide.id)}
                          onToggleFavorite={toggleFavorite}
                          onView={(slideId) => {
                            const slideIndex = slides.findIndex(s => s.id === slideId);
                            if (slideIndex !== -1) {
                              setCurrentSlide(slideIndex);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="scroll" className="mt-6">
                    <ScrollArea className="w-full rounded-lg">
                      <div className="flex space-x-6 p-4">
                        {filteredSlides.map((slide, index) => (
                          <div key={slide.id} className="min-w-[350px] max-w-[400px] flex-shrink-0">
                            <SlideCard
                              slide={slide}
                              index={index}
                              isFavorite={progress.favoriteSlides.includes(slide.id)}
                              onToggleFavorite={toggleFavorite}
                              onView={(slideId) => {
                                const slideIndex = slides.findIndex(s => s.id === slideId);
                                if (slideIndex !== -1) {
                                  setCurrentSlide(slideIndex);
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                {/* Footer */}
                <motion.div 
                  className="text-center py-6 border-t bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Được tạo bởi AI với minh họa tùy chỉnh • Học an toàn, lái xe văn minh</span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
