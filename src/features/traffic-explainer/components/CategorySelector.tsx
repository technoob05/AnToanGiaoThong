import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  BookOpen, 
  AlertTriangle, 
  Lightbulb,
  Car,
  Users,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrafficCategory, ExamplePrompt } from "../types";

interface CategorySelectorProps {
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
}

export const CategorySelector = ({ onSelectPrompt, isLoading }: CategorySelectorProps) => {
  const categories: TrafficCategory[] = [
    {
      id: 'safety',
      title: 'An Toàn Giao Thông',
      description: 'Những nguyên tắc cơ bản để đảm bảo an toàn',
      icon: <Shield className="h-6 w-6" />,
      color: 'border-red-200 hover:border-red-300',
      gradient: 'from-red-500/10 to-red-500/5'
    },
    {
      id: 'rules',
      title: 'Luật Giao Thông',
      description: 'Quy tắc và luật lệ cần tuân thủ',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'border-blue-200 hover:border-blue-300',
      gradient: 'from-blue-500/10 to-blue-500/5'
    },
    {
      id: 'signs',
      title: 'Biển Báo Giao Thông',
      description: 'Hiểu rõ ý nghĩa các biển báo',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'border-yellow-200 hover:border-yellow-300',
      gradient: 'from-yellow-500/10 to-yellow-500/5'
    },
    {
      id: 'tips',
      title: 'Mẹo Hay',
      description: 'Kinh nghiệm và mẹo lái xe an toàn',
      icon: <Lightbulb className="h-6 w-6" />,
      color: 'border-green-200 hover:border-green-300',
      gradient: 'from-green-500/10 to-green-500/5'
    }
  ];

  const examplePrompts: ExamplePrompt[] = [
    {
      id: '1',
      text: 'Tại sao phải đội mũ bảo hiểm khi đi xe máy?',
      icon: <Shield className="h-4 w-4" />,
      category: 'safety',
      difficulty: 'beginner',
      tags: ['mũ bảo hiểm', 'xe máy', 'an toàn']
    },
    {
      id: '2',
      text: 'Tác hại của việc vượt đèn đỏ và cách phòng tránh',
      icon: <Users className="h-4 w-4" />,
      category: 'rules',
      difficulty: 'beginner',
      tags: ['đèn đỏ', 'luật giao thông']
    },
    {
      id: '3',
      text: 'Những biển báo giao thông quan trọng nhất',
      icon: <AlertTriangle className="h-4 w-4" />,
      category: 'signs',
      difficulty: 'intermediate',
      tags: ['biển báo', 'hiểu biết']
    },
    {
      id: '4',
      text: 'Nguyên nhân và cách phòng tránh tai nạn giao thông',
      icon: <Car className="h-4 w-4" />,
      category: 'safety',
      difficulty: 'intermediate',
      tags: ['tai nạn', 'phòng tránh']
    },
    {
      id: '5',
      text: 'Kỹ thuật lái xe an toàn trong thời tiết xấu',
      icon: <Lightbulb className="h-4 w-4" />,
      category: 'tips',
      difficulty: 'advanced',
      tags: ['thời tiết', 'kỹ thuật lái']
    },
    {
      id: '6',
      text: 'Quy tắc nhường đường và ưu tiên tham gia giao thông',
      icon: <BookOpen className="h-4 w-4" />,
      category: 'rules',
      difficulty: 'intermediate',
      tags: ['nhường đường', 'ưu tiên']
    }
  ];

  const getDifficultyColor = (difficulty: ExamplePrompt['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getDifficultyLabel = (difficulty: ExamplePrompt['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
    }
  };

  return (
    <div className="space-y-8">
      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={cn(
              "transition-all duration-200 cursor-pointer",
              category.color,
              "hover:shadow-md"
            )}>
              <CardContent className="p-4">
                <div className={cn(
                  "rounded-lg p-3 mb-3 bg-gradient-to-br",
                  category.gradient
                )}>
                  <div className="flex items-center justify-center">
                    {category.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-center">
                  {category.title}
                </h3>
                <p className="text-xs text-gray-600 text-center">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Popular Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Câu Hỏi Phổ Biến
          </h3>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Cập nhật mới
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examplePrompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cn(
                  "cursor-pointer border-2 transition-all duration-200",
                  "hover:shadow-lg hover:border-orange-300",
                  "bg-gradient-to-br from-white to-gray-50/30",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isLoading && onSelectPrompt(prompt.text)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0">
                      {prompt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {prompt.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Badge 
                              key={tagIndex}
                              variant="outline" 
                              className="text-xs text-gray-500 border-gray-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Badge 
                          className={cn(
                            "text-xs border",
                            getDifficultyColor(prompt.difficulty)
                          )}
                        >
                          {getDifficultyLabel(prompt.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="text-center space-y-2"
      >
        <p className="text-sm text-gray-600">
          💡 <strong>Mẹo:</strong> Bạn cũng có thể nhập câu hỏi tùy chỉnh của riêng mình ở phần trên
        </p>
        <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
          <span>Được hỗ trợ bởi</span>
          <Badge variant="outline" className="text-xs">
            Google Gemini AI
          </Badge>
        </div>
      </motion.div>
    </div>
  );
};
