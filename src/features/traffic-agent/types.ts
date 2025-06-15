/**
 * Traffic Agent Gamification System Types
 */

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: number; // Thêm timestamp để theo dõi thời gian lấy vị trí
}

export interface TrafficReport {
  id: string;
  location: Location;
  type: ReportType;
  description: string;
  images: string[]; // URLs to uploaded images
  reporterId: string; // Anonymous user ID
  timestamp: Date;
  status: ReportStatus;
  votes: Vote[];
  verificationCount: number;
  isVerified: boolean;
}

export enum ReportType {
  FADED_LINES = 'faded_lines',
  BROKEN_ROAD = 'broken_road',
  TRAFFIC_LIGHT_ISSUE = 'traffic_light_issue',
  POTHOLE = 'pothole',
  MISSING_SIGN = 'missing_sign',
  DEBRIS = 'debris',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  RESOLVED = 'resolved'
}

export interface Vote {
  id: string;
  voterId: string; // Anonymous voter ID
  reportId: string;
  voteType: VoteType;
  timestamp: Date;
}

export enum VoteType {
  CONFIRM = 'confirm',
  REJECT = 'reject'
}

export interface User {
  id: string;
  username: string; // Anonymous display name
  points: number;
  level: number;
  badges: Badge[];
  reportsCount: number;
  verifiedReportsCount: number;
  votesCount: number;
  joinDate: Date;
  lastActive: Date;
  school?: string; // Optional school association
  grade?: string; // Optional grade level
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  requirement: string;
  earnedDate?: Date;
}

export enum BadgeRarity {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

export interface LeaderboardEntry {
  rank: number;
  user: Partial<User>;
  points: number;
  reportsCount: number;
  verifiedReportsCount: number;
}

export interface GameStats {
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  totalReports: number;
  verifiedReports: number;
  totalVotes: number;
  badges: Badge[];
  rank: number;
  streakDays: number;
}

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ReportFormData {
  location: Location;
  type: ReportType;
  description: string;
  images: File[];
}

export interface ImageAnalysisResult {
  isTrafficRelated: boolean;
  detectedIssues: string[];
  confidence: number;
  description: string;
  isValidFormat?: boolean; // Thêm flag để check format
} 