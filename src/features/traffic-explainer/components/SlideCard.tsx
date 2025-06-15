import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, BookOpen, Zap, Eye, EyeOff, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slide } from "../types";

interface SlideCardProps {
  slide: Slide;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (slideId: number) => void;
  onView?: (slideId: number) => void;
}

export const SlideCard = ({ 
  slide, 
  index, 
  isFavorite, 
  onToggleFavorite,
  onView 
}: SlideCardProps) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const getCategoryConfig = (category: Slide['category']) => {
    switch (category) {
      case 'safety':
        return {
          color: 'bg-red-500',
          textColor: 'text-gray-800', // Sửa từ text-red-600 thành text-gray-800 để rõ hơn
          gradient: 'from-red-500/20 to-red-500/5',
          icon: '🛡️',
          label: 'An Toàn'
        };
      case 'rules':
        return {
          color: 'bg-blue-500',
          textColor: 'text-gray-800', // Sửa từ text-blue-600 thành text-gray-800 để rõ hơn
          gradient: 'from-blue-500/20 to-blue-500/5',
          icon: '📋',
          label: 'Quy Tắc'
        };
      case 'signs':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-gray-800', // Sửa từ text-yellow-600 thành text-gray-800 để rõ hơn
          gradient: 'from-yellow-500/20 to-yellow-500/5',
          icon: '🚦',
          label: 'Biển Báo'
        };
      case 'tips':
        return {
          color: 'bg-green-500',
          textColor: 'text-gray-800', // Sửa từ text-green-600 thành text-gray-800 để rõ hơn
          gradient: 'from-green-500/20 to-green-500/5',
          icon: '💡',
          label: 'Mẹo Hay'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-800', // Sửa từ text-gray-600 thành text-gray-800 để rõ hơn
          gradient: 'from-gray-500/20 to-gray-500/5',
          icon: '📖',
          label: 'Tổng Hợp'
        };
    }
  };

  const categoryConfig = getCategoryConfig(slide.category);

  const handleCardClick = () => {
    onView?.(slide.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bài học An Toàn Giao Thông',
          text: slide.text.replace(/<[^>]*>/g, ''),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card 
        className={cn(
          "overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer",
          "bg-gradient-to-br from-white to-gray-50/50",
          "hover:border-opacity-60 transform-gpu"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* Header with category badge */}
          <div className={cn(
            "px-4 py-3 bg-gradient-to-r",
            categoryConfig.gradient
          )}>
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs font-semibold border-0",
                  categoryConfig.color,
                  "text-white"
                )}
              >
                <span className="mr-1">{categoryConfig.icon}</span>
                {categoryConfig.label}
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(slide.id);
                  }}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isFavorite 
                        ? "fill-red-500 text-red-500" 
                        : "text-gray-400 hover:text-red-400"
                    )} 
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image section */}
          {slide.image && (
            <div className="relative bg-gray-50">
              <motion.div
                className="flex justify-center items-center p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="relative group/image">
                  <motion.img
                    src={`data:${slide.mimeType};base64,${slide.image}`}
                    alt="AI generated illustration"
                    className={cn(
                      "max-h-64 max-w-full object-contain rounded-lg shadow-md",
                      "transition-all duration-300",
                      isImageExpanded ? "scale-110" : "group-hover/image:scale-105"
                    )}
                    onLoad={() => setIsImageLoaded(true)}
                    style={{ 
                      filter: isImageLoaded ? 'none' : 'blur(4px)',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                  
                  {/* Image overlay controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsImageExpanded(!isImageExpanded);
                      }}
                    >
                      {isImageExpanded ? (
                        <EyeOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      {isImageExpanded ? 'Thu gọn' : 'Phóng to'}
                    </Button>
                  </div>
                  
                  {!isImageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Fallback icon for slides without images */}
          {!slide.image && (
            <div className="flex justify-center py-8 bg-gray-50">
              <motion.div
                className={cn(
                  "flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl shadow-lg",
                  categoryConfig.color
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {categoryConfig.icon}
              </motion.div>
            </div>
          )}

          {/* Content section */}
          <div className="p-6">
            <motion.div 
              className={cn(
                "text-center leading-relaxed",
                categoryConfig.textColor
              )}
              style={{
                fontFamily: "'Inter', 'Comic Sans MS', 'Comic Sans', cursive, sans-serif",
                fontSize: "16px",
                lineHeight: "1.6"
              }}
              dangerouslySetInnerHTML={{ __html: slide.text }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            />

            {/* Keywords tags */}
            {slide.keywords && slide.keywords.length > 0 && (
              <motion.div 
                className="flex flex-wrap gap-1 mt-4 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {slide.keywords.slice(0, 3).map((keyword, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="text-xs text-gray-500 border-gray-300"
                  >
                    {keyword}
                  </Badge>
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer with reading indicators */}
          <motion.div 
            className="px-6 pb-4 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                <span>Slide {index + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>{slide.difficulty === 'beginner' ? 'Cơ bản' : slide.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}</span>
              </div>
            </div>
            
            {/* Location info if available */}
            {slide.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-md px-2 py-1">
                <MapPin className="h-3 w-3 text-green-600" />
                <span className="truncate">
                  {slide.location.address || `${slide.location.latitude.toFixed(4)}, ${slide.location.longitude.toFixed(4)}`}
                </span>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
