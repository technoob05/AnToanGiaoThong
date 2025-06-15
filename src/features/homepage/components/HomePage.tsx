import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 dark:from-red-950/20 dark:via-yellow-950/20 dark:to-green-950/20">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-black/70 border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="size-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">🚦</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                G-Traffic Heroes
              </h1>
              <p className="text-sm text-muted-foreground">Anh hùng Giao thông</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              🏆 Cuộc thi ATGT 2025
            </Badge>
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="size-32 bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 rounded-3xl flex items-center justify-center animate-pulse">
                  <span className="text-6xl">🚦</span>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-red-500 text-white animate-bounce">LIVE</Badge>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 bg-clip-text text-transparent">
                G-Traffic Heroes
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              🇻🇳 Anh hùng Giao thông Việt Nam
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Ứng dụng AI thông minh giúp bạn trở thành <strong>điệp viên giao thông</strong> ẩn danh, 
              học luật ATGT qua chatbot AI, làm quiz tương tác và góp phần xây dựng giao thông an toàn cho cộng đồng.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/traffic-agent')}
                className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                🕵️ Làm Điệp viên Giao thông
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/chatbot')}
                className="border-2 border-red-200 hover:border-red-400 px-8 py-4 text-lg font-semibold hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                🤖 Thử G-LawBot AI
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">1,234+</div>
                <div className="text-sm text-muted-foreground">Điểm báo cáo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">567+</div>
                <div className="text-sm text-muted-foreground">Anh hùng ATGT</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">89%</div>
                <div className="text-sm text-muted-foreground">An toàn hơn</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-muted-foreground">AI hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🎮 Tính năng độc đáo</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kết hợp AI, gamification và học tập thích ứng để tạo ra trải nghiệm học ATGT thú vị nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {/* Feature 1 */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 cursor-pointer"
              onClick={() => navigate('/traffic-agent')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto size-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🕵️</span>
                </div>
                <CardTitle className="text-xl font-bold text-red-700 dark:text-red-300">
                  Điệp viên Giao thông
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                  Báo cáo điểm nguy hiểm ẩn danh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> GPS định vị chính xác
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> AI xác minh ảnh báo cáo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Thưởng điểm và huy hiệu
                  </li>
                </ul>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/traffic-agent');
                  }}
                >
                  🚀 Bắt đầu báo cáo
                </Button>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/20 cursor-pointer"
              onClick={() => navigate('/chatbot')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto size-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🤖</span>
                </div>
                <CardTitle className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                  G-LawBot AI
                </CardTitle>
                <CardDescription className="text-yellow-600 dark:text-yellow-400">
                  Chatbot luật giao thông thông minh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Gemini AI 2.0-flash
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Trả lời tức thì 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Gợi ý chủ động theo vị trí
                  </li>
                </ul>
                <Button 
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();  
                    navigate('/chatbot');
                  }}
                >
                  💬 Trò chuyện ngay
                </Button>
              </CardContent>
            </Card>

            {/* Feature 3 - Quiz Generator */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 cursor-pointer"
              onClick={() => navigate('/quiz-generator')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto size-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📚</span>
                </div>
                <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  Quiz Pháp Luật
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400">
                  Tạo bài kiểm tra thông minh từ AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Tạo quiz từ PDF/DOCX
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Adaptive learning AI
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Phân tích kết quả chi tiết
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/quiz-generator');
                  }}
                >
                  📝 Tạo Quiz ngay
                </Button>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20">
              <CardHeader className="text-center">
                <div className="mx-auto size-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏫</span>
                </div>
                <CardTitle className="text-xl font-bold text-green-700 dark:text-green-300">
                  Liên kết Cộng đồng
                </CardTitle>
                <CardDescription className="text-green-600 dark:text-green-400">
                  Kết nối trường học - CSGT - gia đình
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Dashboard đa vai trò
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Báo cáo thời gian thực
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Xếp hạng trường/lớp
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 5 - Traffic Explainer */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 cursor-pointer"
              onClick={() => navigate('/traffic-explainer')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto size-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎓</span>
                </div>
                <CardTitle className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  Trợ Lý Giải Thích
                </CardTitle>
                <CardDescription className="text-purple-600 dark:text-purple-400">
                  AI giải thích ATGT sinh động
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Giải thích trực quan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Ví dụ thực tế dễ hiểu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Bài học tương tác
                  </li>
                </ul>
                <Button 
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/traffic-explainer');
                  }}
                >
                  🎯 Học ngay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">🏆 Bảng xếp hạng Anh hùng</h2>
            <p className="text-xl text-muted-foreground">
              Top những người đóng góp nhiều nhất cho ATGT Việt Nam
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold">🥇 Tuần này</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Nguyễn Văn A", school: "THPT Lê Hồng Phong", points: 2847, medal: "🥇" },
                    { rank: 2, name: "Trần Thị B", school: "ĐH Bách Khoa", points: 2156, medal: "🥈" },
                    { rank: 3, name: "Lê Văn C", school: "THCS Chu Văn An", points: 1943, medal: "🥉" },
                    { rank: 4, name: "Phạm Thị D", school: "THPT Trường Chinh", points: 1789, medal: "🏅" },
                    { rank: 5, name: "Hoàng Văn E", school: "ĐH Kinh tế", points: 1654, medal: "🏅" },
                  ].map((user) => (
                    <div key={user.rank} className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{user.medal}</span>
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.school}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        {user.points.toLocaleString()} điểm
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            🚀 Sẵn sàng trở thành Anh hùng Giao thông?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn bạn trẻ Việt Nam đang góp phần xây dựng giao thông an toàn và văn minh
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/traffic-agent')}
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              🕵️ Làm Điệp viên ngay
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/chatbot')}
              className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 text-lg font-semibold"
            >
              🤖 Thử AI Chat
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">G-Traffic Heroes</h3>
            <p className="text-gray-400">Cuộc thi Thiết kế sản phẩm tuyên truyền ATGT lần 5 năm 2025</p>
          </div>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>🏆 Hội Liên hiệp Thanh niên Việt Nam TP.HCM</span>
            <span>🔬 Trung tâm Phát triển Khoa học và Công nghệ Trẻ</span>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            © 2025 G-Traffic Heroes. Tạo bởi AI và tình yêu với giao thông Việt Nam 🇻🇳
          </div>
        </div>
      </footer>
    </div>
  );
}
