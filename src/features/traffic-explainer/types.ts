export interface Slide {
  id: number;
  text: string;
  image: string | null;
  mimeType: string | null;
  category?: 'safety' | 'rules' | 'signs' | 'tips';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  keywords?: string[];
  location?: LocationData;
}

export interface TrafficCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

export interface ExamplePrompt {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface LearningProgress {
  totalSlides: number;
  currentSlide: number;
  timeSpent: number;
  completedCategories: string[];
  favoriteSlides: number[];
  hasLocationPermission?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}
