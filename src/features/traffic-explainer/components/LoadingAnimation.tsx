import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, Sparkles } from "lucide-react";

interface LoadingAnimationProps {
  stage?: 'thinking' | 'generating' | 'illustrating';
  progress?: number;
}

export const LoadingAnimation = ({ stage = 'thinking', progress = 0 }: LoadingAnimationProps) => {
  const getStageInfo = () => {
    switch (stage) {
      case 'thinking':
        return {
          icon: Brain,
          message: 'AI đang suy nghĩ...',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        };
      case 'generating':
        return {
          icon: Zap,
          message: 'Đang tạo nội dung...',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10'
        };
      case 'illustrating':
        return {
          icon: Sparkles,
          message: 'Đang vẽ minh họa...',
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10'
        };
    }
  };

  const stageInfo = getStageInfo();
  const Icon = stageInfo.icon;

  return (
    <div className="space-y-8">
      {/* Main loading card */}
      <Card className="overflow-hidden border-2 border-dashed border-gray-300">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Animated icon */}
            <motion.div
              className={`p-4 rounded-full ${stageInfo.bgColor}`}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon className={`h-8 w-8 ${stageInfo.color}`} />
            </motion.div>

            {/* Loading message */}
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-700">
                {stageInfo.message}
              </h3>
              <p className="text-sm text-gray-500">
                Vui lòng đợi trong giây lát...
              </p>
            </motion.div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="w-full max-w-sm space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-gray-500">
                  {Math.round(progress)}% hoàn thành
                </p>
              </div>
            )}

            {/* Floating dots animation */}
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${stageInfo.color.replace('text-', 'bg-')}`}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: i * 0.1,
              ease: "easeOut"
            }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {/* Skeleton header */}
                <div className="flex items-center justify-between">
                  <motion.div
                    className="h-6 w-20 bg-gray-200 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="flex gap-2">
                    <motion.div
                      className="h-6 w-6 bg-gray-200 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: 0.1,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="h-6 w-6 bg-gray-200 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </div>

                {/* Skeleton image */}
                <motion.div
                  className="h-32 bg-gray-200 rounded-lg flex items-center justify-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: 0.3,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </motion.div>

                {/* Skeleton text lines */}
                <div className="space-y-2">
                  {[1, 2, 3].map(lineIndex => (
                    <motion.div
                      key={lineIndex}
                      className={`h-4 bg-gray-200 rounded ${
                        lineIndex === 3 ? 'w-3/4' : 'w-full'
                      }`}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: 0.4 + lineIndex * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                {/* Skeleton tags */}
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3].map(tagIndex => (
                    <motion.div
                      key={tagIndex}
                      className="h-5 w-12 bg-gray-200 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: 0.7 + tagIndex * 0.05,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                {/* Skeleton footer */}
                <div className="flex justify-between items-center pt-2">
                  <motion.div
                    className="h-3 w-16 bg-gray-200 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: 0.8,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="h-3 w-20 bg-gray-200 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: 0.9,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
