import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";
import { Slide, LearningProgress, LocationData } from "../types";
import { useGeolocation } from "./useGeolocation";

// Types for Gemini API responses
interface GeminiChunk {
  candidates: Array<{
    content: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          data: string;
          mimeType: string;
        };
      }>;
    };
  }>;
}

export const useTrafficExplainer = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LearningProgress>({
    totalSlides: 0,
    currentSlide: 0,
    timeSpent: 0,
    completedCategories: [],
    favoriteSlides: [],
    hasLocationPermission: false,
  });
  
  const slideIdCounterRef = useRef<number>(0);
  const chatRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const geolocation = useGeolocation();

  // Configure marked
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }, []);

  // Initialize API
  useEffect(() => {
    const initializeAPI = async () => {
      try {
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

  const parseAndRenderMarkdown = useCallback(async (markdown: string): Promise<string> => {
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
  }, []);

  const initializeChat = useCallback((key: string) => {
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
  }, []);

  const categorizeSlide = useCallback((text: string): Slide['category'] => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('biển báo') || lowerText.includes('đèn')) return 'signs';
    if (lowerText.includes('luật') || lowerText.includes('quy tắc')) return 'rules';
    if (lowerText.includes('mẹo') || lowerText.includes('kinh nghiệm')) return 'tips';
    return 'safety';
  }, []);



  // Kiểm tra hình ảnh có liên quan đến giao thông không - linh hoạt hơn
  const isTrafficRelatedImage = useCallback((file: File): boolean => {
    // Chấp nhận tất cả hình ảnh, không quá khắt khe
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(file.type.toLowerCase());
  }, []);

  const generateExplanation = useCallback(async (prompt: string, imageFile?: File) => {
    if (!prompt.trim() || isLoading) return;
    
    if (!chatRef.current) {
      setError("API chưa được khởi tạo. Vui lòng kiểm tra cấu hình môi trường.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSlides([]);
    slideIdCounterRef.current = 0;
    startTimeRef.current = Date.now();

    // Lấy vị trí hiện tại (không bắt buộc)
    let currentLocation: LocationData | undefined = undefined;
    try {
      const locationResult = await geolocation.getCurrentLocation();
      currentLocation = locationResult || undefined;
      if (currentLocation) {
        setProgress(prev => ({ ...prev, hasLocationPermission: true }));
      }
    } catch (err) {
      console.log('Location not available:', err);
    }

    // Reset chat history
    if (chatRef.current && chatRef.current.history) {
      chatRef.current.history.length = 0;
    }

    // Chuẩn bị thông tin location
    const locationInfo = currentLocation 
      ? `\n\nThông tin vị trí hiện tại: ${currentLocation.address} (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`
      : '';

    // Chuẩn bị thông tin hình ảnh
    let imageInfo = '';
    let imageData = null;
    
    if (imageFile && isTrafficRelatedImage(imageFile)) {
      try {
        // Xử lý hình ảnh trực tiếp trong function
        const imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Không thể đọc file'));
          reader.readAsDataURL(imageFile);
        });
        
        imageData = imageBase64.split(',')[1]; // Loại bỏ data:image/...;base64,
        imageInfo = '\n\nHình ảnh đính kèm: Phân tích hình ảnh này và giải thích các vấn đề an toàn giao thông liên quan. Kể cả khi đường kẻ vạch mờ, biển báo cũ, hay bất kỳ tình huống giao thông nào khác.';
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Không thể xử lý hình ảnh. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }
    }

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
- If there's an image, analyze it thoroughly and explain all traffic safety aspects, even if road markings are blurry or unclear
- Accept any image that could be related to traffic, roads, vehicles, or street scenes
- Be helpful and not overly strict about image content

Remember: Your entire response must be in Vietnamese language only.${locationInfo}${imageInfo}`;

    const fullPrompt = prompt + additionalInstructions;

    try {
      // Chuẩn bị message với hình ảnh nếu có
      const messageContent: {
        message: string | {
          parts: Array<{
            text?: string;
            inlineData?: {
              data: string;
              mimeType: string;
            };
          }>;
        };
      } = {
        message: fullPrompt,
      };

      // Nếu có hình ảnh, thêm vào message
      if (imageData) {
        messageContent.message = {
          parts: [
            { text: fullPrompt },
            {
              inlineData: {
                data: imageData,
                mimeType: imageFile?.type || 'image/jpeg'
              }
            }
          ]
        };
      }

      const result = await chatRef.current.sendMessageStream(messageContent);

      let text = '';
      let img = null;
      const newSlides: Slide[] = [];

      for await (const chunk of result as AsyncIterable<GeminiChunk>) {
        for (const candidate of (chunk as GeminiChunk).candidates) {
          for (const part of candidate.content.parts ?? []) {
            if (part.text) {
              text += part.text;
            } else if (part.inlineData) {
              img = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";
              
              if (text && img) {
                const renderedText = await parseAndRenderMarkdown(text);
                const newSlide: Slide = {
                  id: slideIdCounterRef.current++,
                  text: renderedText,
                  image: img,
                  mimeType: mimeType,
                  category: categorizeSlide(text),
                  difficulty: 'beginner',
                  keywords: text.split(' ').slice(0, 5),
                  location: currentLocation,
                };
                newSlides.push(newSlide);
                setSlides(prev => [...prev, newSlide]);
                text = '';
                img = null;
              }
            }
          }
        }
      }

      if (text.trim()) {
        const renderedText = await parseAndRenderMarkdown(text);
        const finalSlide: Slide = {
          id: slideIdCounterRef.current++,
          text: renderedText,
          image: null,
          mimeType: null,
          category: categorizeSlide(text),
          difficulty: 'beginner',
          keywords: text.split(' ').slice(0, 5),
          location: currentLocation,
        };
        newSlides.push(finalSlide);
        setSlides(prev => [...prev, finalSlide]);
      }

      // Update progress
      setProgress(prev => ({
        ...prev,
        totalSlides: newSlides.length,
        timeSpent: Date.now() - startTimeRef.current,
      }));

    } catch (err: unknown) {
      console.error("Failed to generate explanation:", err);
      
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
      let detailedError = errorMessage;
      
      try {
        const regex = /{"error":(.*)}/gm;
        const match = regex.exec(String(err));
        if (match && match[1]) {
          const parsedError = JSON.parse(match[1]);
          detailedError = parsedError.message || detailedError;
        }
      } catch {
        // If error parsing fails, use the original error message
      }
      
      setError(detailedError);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, parseAndRenderMarkdown, categorizeSlide, geolocation, isTrafficRelatedImage]);

  const toggleFavorite = useCallback((slideId: number) => {
    setProgress(prev => ({
      ...prev,
      favoriteSlides: prev.favoriteSlides.includes(slideId)
        ? prev.favoriteSlides.filter(id => id !== slideId)
        : [...prev.favoriteSlides, slideId]
    }));
  }, []);

  const setCurrentSlide = useCallback((slideIndex: number) => {
    setProgress(prev => ({
      ...prev,
      currentSlide: slideIndex
    }));
  }, []);

  return {
    slides,
    isLoading,
    error,
    progress,
    generateExplanation,
    toggleFavorite,
    setCurrentSlide,
    isTrafficRelatedImage,
    geolocation,
  };
};
