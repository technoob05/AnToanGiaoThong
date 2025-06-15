# Traffic Explainer - Trợ Lý Giải Thích An Toàn Giao Thông 🛡️

## Tổng Quan

Tính năng AI Explainer được nâng cấp hoàn toàn với UX/UI hiện đại, giúp giải thích các khái niệm, quy tắc và tình huống về an toàn giao thông một cách sinh động và dễ hiểu với minh họa AI tùy chỉnh.

## ✨ Tính Năng Mới

### 🎨 Giao Diện Hiện Đại
- **Thiết kế Material**: Card-based layout với shadow và animations mượt mà
- **Responsive Design**: Tối ưu cho desktop, tablet và mobile
- **Dark/Light Mode**: Hỗ trợ chế độ sáng/tối
- **Micro-interactions**: Hover effects, loading animations, transitions

### 🚀 Trải Nghiệm Người Dùng
- **Smart Loading**: Loading skeleton với progress indicator
- **Interactive Cards**: Hover effects, favorite system, share functionality
- **Category System**: Phân loại nội dung theo chủ đề (An toàn, Quy tắc, Biển báo, Mẹo hay)
- **Progress Tracking**: Theo dõi tiến độ học tập
- **Filter & Search**: Lọc theo danh mục, độ khó, yêu thích

### 🧠 AI Nâng Cao
- **Gemini 2.0 Flash**: Sử dụng model AI mới nhất
- **Custom Illustrations**: Tự động tạo minh họa cho mỗi slide
- **Smart Categorization**: Tự động phân loại nội dung
- **Contextual Learning**: Học theo ngữ cảnh Việt Nam

### 📱 Tương Tác Thông Minh
- **Favorite System**: Đánh dấu và quản lý slides yêu thích
- **Share Integration**: Chia sẻ nội dung qua Web Share API
- **View Modes**: Grid view và horizontal scroll view
- **Progress Tracking**: Theo dõi thời gian học và slides đã xem

## 🏗️ Kiến Trúc Kỹ Thuật

### Cấu Trúc Thư Mục
```
src/features/traffic-explainer/
├── components/
│   ├── TrafficExplainerInterface.tsx    # Main interface component
│   ├── SlideCard.tsx                    # Individual slide card
│   ├── LoadingAnimation.tsx             # Loading states & skeletons
│   └── CategorySelector.tsx             # Category selection component
├── hooks/
│   └── useTrafficExplainer.ts          # Main business logic hook
├── types.ts                            # TypeScript definitions
├── index.ts                            # Public exports
└── README.md                           # Documentation
```

### Công Nghệ Sử Dụng

#### Core Technologies
- **React 19**: Latest React features (use hook, Suspense)
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Modern utility-first styling
- **Framer Motion**: Advanced animations and transitions
- **shadcn/ui**: High-quality UI components

#### AI & APIs
- **Google Gemini 2.0 Flash**: Advanced AI model
- **Custom Image Generation**: AI-generated illustrations
- **Markdown Processing**: Rich text formatting
- **Web Share API**: Native sharing capabilities

#### State Management
- **Custom Hooks**: Modular state management
- **Local Storage**: Persist user preferences
- **Progress Tracking**: Learning analytics

## 🎯 Tính Năng Chi Tiết

### 1. Category System
```typescript
interface TrafficCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}
```

**Categories:**
- 🛡️ **An Toàn**: Nguyên tắc cơ bản về an toàn giao thông
- 📋 **Quy Tắc**: Luật lệ và quy định cần tuân thủ  
- 🚦 **Biển Báo**: Hiểu biết về các loại biển báo
- 💡 **Mẹo Hay**: Kinh nghiệm và kỹ thuật lái xe

### 2. Slide Management
```typescript
interface Slide {
  id: number;
  text: string;
  image: string | null;
  mimeType: string | null;
  category?: 'safety' | 'rules' | 'signs' | 'tips';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  keywords?: string[];
}
```

**Features:**
- Auto-categorization based on content
- Difficulty level assignment
- Keyword extraction
- Image optimization
- Favorite marking
- Share functionality

### 3. Progress Tracking
```typescript
interface LearningProgress {
  totalSlides: number;
  currentSlide: number;
  timeSpent: number;
  completedCategories: string[];
  favoriteSlides: number[];
}
```

**Metrics:**
- Completion percentage
- Time spent learning
- Category completion status
- Favorite slides count
- Learning streak

### 4. Interactive Features

#### Slide Card Interactions
- **Hover Effects**: Subtle animations on hover
- **Image Zoom**: Click to expand illustrations
- **Quick Actions**: Favorite, share, view options
- **Category Badges**: Visual category identification

#### Filter & Search
- **Category Filter**: Filter by traffic category
- **Difficulty Filter**: Filter by learning level
- **Favorite Filter**: Show only bookmarked slides
- **Keyword Search**: Search within content

#### View Modes
- **Grid View**: Traditional card grid layout
- **Scroll View**: Horizontal scrolling carousel
- **Full Screen**: Focus mode for individual slides

## 🎨 Design System

### Color Scheme
```css
/* Primary Gradient */
background: linear-gradient(135deg, #ef4444, #f97316, #eab308);

/* Category Colors */
--safety: #ef4444    /* Red - Safety */
--rules: #3b82f6     /* Blue - Rules */
--signs: #eab308     /* Yellow - Signs */
--tips: #10b981      /* Green - Tips */
```

### Typography
- **Headers**: Inter font family, gradient text effects
- **Body**: Inter for readability
- **Cards**: Comic Sans MS for friendly feel
- **UI Elements**: System fonts for performance

### Animations
- **Entry Animations**: Staggered fade-in effects
- **Hover States**: Scale and shadow transitions
- **Loading States**: Skeleton screens with pulse
- **Micro-interactions**: Button press feedback

## 🚀 Performance Optimizations

### Code Splitting
- Lazy loading for non-critical components
- Dynamic imports for AI processing
- Image optimization and caching

### Memory Management
- Cleanup in useEffect hooks
- Proper event listener removal
- Optimized re-renders with useMemo/useCallback

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios

## 📖 Sử Dụng

### Basic Usage
```tsx
import { TrafficExplainerInterface } from '@/features/traffic-explainer';

function App() {
  return <TrafficExplainerInterface />;
}
```

### Custom Hook Usage
```tsx
import { useTrafficExplainer } from '@/features/traffic-explainer';

function CustomComponent() {
  const {
    slides,
    isLoading,
    error,
    progress,
    generateExplanation,
    toggleFavorite,
    setCurrentSlide,
  } = useTrafficExplainer();

  // Custom implementation
}
```

### Component Props
```tsx
// SlideCard component
interface SlideCardProps {
  slide: Slide;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (slideId: number) => void;
  onView?: (slideId: number) => void;
}

// CategorySelector component
interface CategorySelectorProps {
  onSelectPrompt: (prompt: string) => void;
  isLoading: boolean;
}
```

## 🔧 Cấu Hình

### Environment Variables
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### API Configuration
```typescript
// In useTrafficExplainer.ts
const aiInstance = new GoogleGenAI({apiKey: key});
const chat = aiInstance.chats.create({
  model: 'gemini-2.0-flash-exp',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  }
});
```

## 🧪 Testing

### Component Testing
```bash
# Run component tests
npm run test -- src/features/traffic-explainer

# Run with coverage
npm run test:coverage -- src/features/traffic-explainer
```

### E2E Testing
```bash
# Run end-to-end tests
npm run test:e2e
```

## 🚢 Deployment

### Build Optimization
```bash
# Build for production
npm run build

# Analyze bundle
npm run build:analyze
```

### Performance Monitoring
- Core Web Vitals tracking
- User interaction analytics
- Error boundary monitoring
- AI response time tracking

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use semantic commit messages
3. Write comprehensive tests
4. Document complex logic
5. Optimize for accessibility

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Implement proper error handling
- Add JSDoc comments for exports

## 📝 Changelog

### v2.0.0 (Current)
- ✨ Complete UX/UI redesign
- 🚀 Framer Motion animations
- 🎯 Smart categorization
- 📱 Mobile-first responsive design
- ⚡ Performance optimizations
- 🧠 Enhanced AI integration

### v1.0.0 (Legacy)
- Basic Q&A functionality
- Simple card layout
- Manual example prompts
- Basic error handling

## 🔮 Roadmap

### Upcoming Features
- **Voice Input**: Speech-to-text integration
- **Offline Mode**: Service worker caching
- **Social Features**: Community sharing
- **Gamification**: Points and achievements
- **Multi-language**: English translation support
- **Advanced Analytics**: Learning insights dashboard

### Technical Improvements
- **Performance**: Further optimization
- **Accessibility**: WCAG 2.1 AAA compliance
- **Testing**: 100% test coverage
- **Documentation**: Interactive storybook

---

**Được phát triển với ❤️ cho an toàn giao thông Việt Nam**
