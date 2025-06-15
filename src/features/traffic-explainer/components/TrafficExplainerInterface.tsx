import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { GoogleGenAI } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal, Lightbulb, Car, Users, Shield, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  text: string;
  image: string | null;
  mimeType: string | null;
}

export const TrafficExplainerInterface = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const slideIdCounterRef = useRef<number>(0);
  const chatRef = useRef<any>(null);

  const examplePrompts = [
    { icon: <Car size={14} />, text: "Giải thích tại sao phải đội mũ bảo hiểm khi đi xe máy" },
    { icon: <Users size={14} />, text: "Tác hại của việc vượt đèn đỏ và cách phòng tránh" },
    { icon: <Shield size={14} />, text: "Những biển báo giao thông quan trọng nhất" },
    { icon: <AlertTriangle size={14} />, text: "Nguyên nhân và cách phòng tránh tai nạn giao thông" },
  ];

  // Configure marked
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }, []);

  // Load API key from environment variables on component mount
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        // This assumes you've set up your Vite app to expose this env variable safely
        // using VITE_ prefix (equivalent to NEXT_PUBLIC_ in Next.js)
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
          initializeChat(apiKey);
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setError("Không thể tải API key từ biến môi trường.");
      }
    };
    
    initializeAPI();
  }, []);

  const parseAndRenderMarkdown = async (markdown: string): Promise<string> => {
    try {
      const sanitized = markdown.replace(/<script.*?>.*?<\/script>/gi, "");
      const parsedHtml = await marked.parse(sanitized);
      
      const textContent = parsedHtml
        .replace(/<\/?h[1-6]>/gi, "")
        .replace(/<\/?p>/gi, "")
        .replace(/<\/?li>/gi, "• ")
        .replace(/<\/?[uo]l>/gi, "<br>")
        .replace(/<strong>(.*?)<\/strong>/gi, "$1")
        .replace(/<em>(.*?)<\/em>/gi, "$1")
        .trim();
      
      return `<p>${textContent}</p>`;
    } catch (e) {
      console.error("Markdown parsing error:", e);
      return markdown;
    }
  };

  // Initialize the chat instance with API key
  const initializeChat = (key: string) => {
    if (!key) return;
    
    try {
      const aiInstance = new GoogleGenAI({apiKey: key});
      chatRef.current = aiInstance.chats.create({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
        history: [],
      });
    } catch (err) {
      console.error("Failed to initialize chat:", err);
      setError("Không thể khởi tạo Google AI client. Vui lòng kiểm tra cấu hình API key.");
    }
  };

  const generateExplanation = async (currentPrompt: string) => {
    if (!currentPrompt.trim() || isLoading) return;
    
    if (!chatRef.current) {
      setError("API chưa được khởi tạo. Vui lòng kiểm tra cấu hình môi trường.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSlides([]);
    slideIdCounterRef.current = 0;

    // Reset chat history
    if (chatRef.current && chatRef.current.history) {
      chatRef.current.history.length = 0;
    }

    // Updated instructions for traffic safety theme
    const additionalInstructions = `

You are a traffic safety expert. Please respond ONLY in Vietnamese language. Use cute kitten stories as examples to explain traffic safety concepts.

Instructions:
- Respond exclusively in Vietnamese (tiếng Việt)
- Keep each sentence short but conversational, comfortable and engaging
- Create cute, minimalist illustrations for each sentence using black ink on white background
- Use adorable kitten characters to demonstrate traffic safety rules
- Make the explanation easy to understand for Vietnamese readers
- No commentary needed, just start explaining directly
- Continue until the explanation is complete
- All text must be in Vietnamese language

Remember: Your entire response must be in Vietnamese language only.`;

    const fullPrompt = currentPrompt + additionalInstructions;

    try {
      // Send message stream using chat interface
      const result = await chatRef.current.sendMessageStream({
        message: fullPrompt,
      });

      let text = '';
      let img = null;

      // Process the stream
      for await (const chunk of result as any) {
        for (const candidate of chunk.candidates) {
          for (const part of candidate.content.parts ?? []) {
            if (part.text) {
              text += part.text;
            } else if (part.inlineData) {
              // Create image from inline data
              img = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";
              
              // If we have both text and image, create a slide
              if (text && img) {
                const renderedText = await parseAndRenderMarkdown(text);
                const newSlide: Slide = {
                  id: slideIdCounterRef.current++,
                  text: renderedText,
                  image: img,
                  mimeType: mimeType,
                };
                setSlides(prev => [...prev, newSlide]);
                text = ''; // Reset text
                img = null; // Reset image
              }
            }
          }
        }
      }

      // Handle any remaining text without an image
      if (text.trim()) {
        const renderedText = await parseAndRenderMarkdown(text);
        const finalSlide: Slide = {
          id: slideIdCounterRef.current++,
          text: renderedText,
          image: null,
          mimeType: null,
        };
        setSlides(prev => [...prev, finalSlide]);
      }
    } catch (err: any) {
      console.error("Failed to generate explanation:", err);
      
      // Parse error
      let detailedError = err.message || "Đã xảy ra lỗi không xác định.";
      try {
        const regex = /{"error":(.*)}/gm;
        const match = regex.exec(err.toString());
        if (match && match[1]) {
          const parsedError = JSON.parse(match[1]);
          detailedError = parsedError.message || detailedError;
        }
      } catch (parseErr) {
        // If error parsing fails, use the original error message
      }
      
      setError(detailedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    generateExplanation(prompt);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    generateExplanation(example);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4" 
              style={{
                background: "linear-gradient(135deg, #ef4444, #f97316, #eab308)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Inter', sans-serif"
              }}>
            🛡️ Trợ Lý An Toàn Giao Thông
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Nhận giải thích sinh động và dễ hiểu về các quy tắc an toàn giao thông
          </p>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8">
          {/* Input Section */}
          <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2" style={{
                background: "linear-gradient(135deg, #ef4444, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                <Car className="h-6 w-6 text-orange-500" />
                Hỏi về An Toàn Giao Thông
              </CardTitle>
              <CardDescription className="text-base">
                Đặt câu hỏi về luật giao thông, biển báo, hoặc cách phòng tránh tai nạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Textarea
                  id="prompt-input"
                  placeholder="Ví dụ: Tại sao không được sử dụng điện thoại khi lái xe?"
                  value={prompt}
                  onChange={handlePromptChange}
                  rows={4}
                  className="resize-none bg-white border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-base"
                  disabled={isLoading}
                  aria-label="Nhập câu hỏi của bạn"
                />
                <div className="flex flex-col space-y-4">
                  <div>
                    <Label className="text-sm text-gray-700 mb-3 block font-semibold">
                      💡 Thử các câu hỏi mẫu:
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {examplePrompts.map((ex, index) => (
                        <Badge
                          key={ex.text}
                          variant="outline"
                          className={cn(
                            "cursor-pointer hover:bg-orange-50 transition-all duration-200 flex items-center gap-2 py-3 px-4 bg-white border-2 text-sm font-medium hover:scale-105",
                            index % 4 === 0 ? "border-red-200 text-red-600 hover:border-red-300" : 
                            index % 4 === 1 ? "border-orange-200 text-orange-600 hover:border-orange-300" : 
                            index % 4 === 2 ? "border-yellow-200 text-yellow-600 hover:border-yellow-300" :
                            "border-green-200 text-green-600 hover:border-green-300"
                          )}
                          onClick={() => handleExampleClick(ex.text)}
                        >
                          {ex.icon}
                          <span>{ex.text}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="px-8 py-3 text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang tạo giải thích...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Tạo Giải Thích
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in border-2 border-red-200">
              <Terminal className="h-5 w-5" />
              <AlertTitle className="text-lg">Lỗi</AlertTitle>
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading States */}
          {isLoading && (
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-center">
                <Skeleton className="h-10 w-1/2 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Results Display */}
          {!isLoading && slides.length > 0 && (
            <div className="space-y-8 animate-in fade-in">
              <h2 className="text-2xl font-bold text-center relative">
                <span className="bg-white px-6 relative z-10 text-gray-800">📚 Bài Giảng An Toàn Giao Thông</span>
                <Separator className="absolute top-1/2 w-full left-0 -z-0" />
              </h2>
              
              <Tabs defaultValue="cards" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
                  <TabsTrigger value="cards" className="text-base">Xem Thẻ</TabsTrigger>
                  <TabsTrigger value="scroll" className="text-base">Cuộn Ngang</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cards" className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slides.map((slide, index) => (
                      <Card key={slide.id} className="overflow-hidden border shadow-md hover:shadow-lg transition-shadow bg-white">
                        <CardContent className="p-6 flex flex-col items-center">
                          {slide.image && (
                            <div className="flex justify-center mb-4">
                              <div className="flex items-center justify-center w-64 h-64">
                                <img
                                  src={`data:${slide.mimeType};base64,${slide.image}`}
                                  alt="AI generated illustration"
                                  className="object-contain max-h-full max-w-full"
                                />
                              </div>
                            </div>
                          )}
                          {!slide.image && (
                            /* Traffic Safety Icon fallback */
                            <div className="flex justify-center mb-4">
                              <div className={cn(
                                "flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl",
                                index % 4 === 0 ? "bg-red-500" : 
                                index % 4 === 1 ? "bg-orange-500" : 
                                index % 4 === 2 ? "bg-yellow-500" : "bg-green-500"
                              )}>
                                {index % 4 === 0 ? "🚦" : 
                                 index % 4 === 1 ? "🛡️" : 
                                 index % 4 === 2 ? "⚠️" : "✅"}
                              </div>
                            </div>
                          )}
                          <div 
                            className={cn(
                              "mt-2 text-center w-full",
                              // Random colors for each card's text, similar to the reference
                              index % 3 === 0 ? "text-blue-600" : 
                              index % 3 === 1 ? "text-emerald-600" : "text-amber-600"
                            )}
                            style={{
                              fontFamily: "'Comic Sans MS', 'Comic Sans', cursive, sans-serif",
                              fontWeight: "normal"
                            }}
                            dangerouslySetInnerHTML={{ __html: slide.text }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="scroll" className="mt-8">
                  <ScrollArea className="w-full rounded-lg">
                    <div className="flex space-x-6 p-4">
                      {slides.map((slide, index) => (
                        <Card
                          key={slide.id}
                          className="min-w-[300px] max-w-[350px] flex-shrink-0 bg-white border shadow-md"
                        >
                          <CardContent className="p-6 flex flex-col items-center">
                            {slide.image && (
                              <div className="flex justify-center mb-4">
                                <div className="flex items-center justify-center w-64 h-64">
                                  <img
                                    src={`data:${slide.mimeType};base64,${slide.image}`}
                                    alt="AI generated illustration"
                                    className="object-contain max-h-full max-w-full"
                                  />
                                </div>
                              </div>
                            )}
                            {!slide.image && (
                              <div className="flex justify-center mb-4">
                                <div className={cn(
                                  "flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl",
                                  index % 4 === 0 ? "bg-red-500" : 
                                  index % 4 === 1 ? "bg-orange-500" : 
                                  index % 4 === 2 ? "bg-yellow-500" : "bg-green-500"
                                )}>
                                  {index % 4 === 0 ? "🚦" : 
                                   index % 4 === 1 ? "🛡️" : 
                                   index % 4 === 2 ? "⚠️" : "✅"}
                                </div>
                              </div>
                            )}
                            <div 
                              className={cn(
                                "mt-2 text-center w-full",
                                index % 3 === 0 ? "text-blue-600" : 
                                index % 3 === 1 ? "text-emerald-600" : "text-amber-600"
                              )}
                              style={{
                                fontFamily: "'Comic Sans MS', 'Comic Sans', cursive, sans-serif",
                                fontWeight: "normal"
                              }}
                              dangerouslySetInnerHTML={{ __html: slide.text }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              
              <CardFooter className="pt-2 justify-center">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lightbulb size={12} />
                  <span>Giải thích An toàn Giao thông được tạo bởi AI với minh họa tùy chỉnh</span>
                </p>
              </CardFooter>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 