import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  MessageCircle,
  Shield,
  Lightbulb,
  BookOpen,
  Menu,
  X,
  Car,
  Sparkles,
  GraduationCap,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  gradient: string;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: "/",
      label: "Trang Chủ",
      icon: <Home className="h-5 w-5" />,
      description: "Khám phá tất cả tính năng",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      path: "/chatbot",
      label: "Chat Bot",
      icon: <MessageCircle className="h-5 w-5" />,
      description: "Trò chuyện với AI",
      badge: "AI",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      path: "/traffic-agent",
      label: "Traffic Agent",
      icon: <Shield className="h-5 w-5" />,
      description: "Trợ lý giao thông thông minh",
      badge: "Agent",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      path: "/traffic-explainer",
      label: "Giải Thích GT",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Học an toàn giao thông",
      badge: "New",
      gradient: "from-orange-500 to-red-600"
    },
    {
      path: "/quiz-generator",
      label: "Tạo Quiz",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Tạo câu hỏi tự động",
      badge: "Quiz",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  const currentPage = navItems.find(item => item.path === location.pathname);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Car className="h-5 w-5" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Traffic Heroes
                </h1>
                <p className="text-xs text-gray-500">AI Learning Platform</p>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className="relative group">
                    <motion.div
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r text-white shadow-lg"
                          : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                      )}
                      style={isActive ? { backgroundImage: `linear-gradient(to right, ${item.gradient.split(' ')[1]}, ${item.gradient.split(' ')[3]})` } : {}}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={cn(
                        "transition-transform",
                        isActive && "text-white"
                      )}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className={cn(
                          "text-xs px-2 py-0.5",
                          isActive ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"
                        )}>
                          {item.badge}
                        </Badge>
                      )}
                    </motion.div>
                    
                    {/* Tooltip */}
                    <motion.div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 0, y: -5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      {item.description}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hidden xl:flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>Nâng cấp Pro</span>
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <GraduationCap className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <Car className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Traffic Heroes
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="w-10 h-10 p-0"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-3 space-y-2">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
                          isActive
                            ? "bg-gradient-to-r text-white shadow-md"
                            : "hover:bg-gray-50 text-gray-700"
                        )}
                        style={isActive ? { backgroundImage: `linear-gradient(to right, ${item.gradient.split(' ')[1]}, ${item.gradient.split(' ')[3]})` } : {}}
                      >
                        <span className={isActive ? "text-white" : "text-gray-600"}>
                          {item.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className={cn(
                                "text-xs",
                                isActive ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"
                              )}>
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className={cn(
                            "text-sm",
                            isActive ? "text-white/80" : "text-gray-500"
                          )}>
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
                
                <Separator className="my-3" />
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="px-4 py-2"
                >
                  <Button variant="outline" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Nâng cấp Pro
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page Header - Only show on non-home pages */}
      {location.pathname !== "/" && currentPage && (
        <div className="pt-20 lg:pt-24">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="container mx-auto px-4 py-6">
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-lg bg-gradient-to-r"
                  style={{ backgroundImage: `linear-gradient(to right, ${currentPage.gradient.split(' ')[1]}, ${currentPage.gradient.split(' ')[3]})` }}
                >
                  {currentPage.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentPage.label}</h1>
                  <p className="text-gray-600">{currentPage.description}</p>
                </div>
                {currentPage.badge && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {currentPage.badge}
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-200",
        location.pathname === "/" ? "pt-20 lg:pt-24" : "pt-0"
      )}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">Traffic Heroes AI</p>
                <p className="text-sm text-gray-400">Học an toàn giao thông với AI</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2025 Traffic Heroes</span>
              <Separator orientation="vertical" className="h-4 bg-gray-600" />
              <span className="flex items-center space-x-1">
                <Bot className="h-4 w-4" />
                <span>Powered by Gemini AI</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
