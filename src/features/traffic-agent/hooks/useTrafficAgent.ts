/**
 * Main hook for managing Traffic Agent functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  TrafficReport, 
  User, 
  Badge, 
  LeaderboardEntry, 
  GameStats, 
  ReportFormData,
  ReportType,
  ReportStatus,
  VoteType,
  BadgeRarity
} from '../types';

// Zustand store for persistent user data and reports
interface TrafficAgentStore {
  currentUser: User | null;
  reports: TrafficReport[];
  userStats: GameStats | null;
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  setCurrentUser: (user: User) => void;
  addReport: (report: TrafficReport) => void;
  updateReport: (reportId: string, updates: Partial<TrafficReport>) => void;
  addBadge: (badge: Badge) => void;
  updateStats: (stats: GameStats) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  voteOnReport: (reportId: string, voteType: VoteType) => void;
  clearData: () => void;
}

const useTrafficAgentStore = create<TrafficAgentStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      reports: [],
      userStats: null,
      badges: [],
      leaderboard: [],
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      addReport: (report) => set((state) => ({ 
        reports: [report, ...state.reports] 
      })),
      
      updateReport: (reportId, updates) => set((state) => ({
        reports: state.reports.map(report => 
          report.id === reportId ? { ...report, ...updates } : report
        )
      })),
      
      addBadge: (badge) => set((state) => ({
        badges: [...state.badges, badge]
      })),
      
      updateStats: (stats) => set({ userStats: stats }),
      
      setLeaderboard: (leaderboard) => set({ leaderboard }),
      
      voteOnReport: (reportId, voteType) => set((state) => {
        const updatedReports = state.reports.map(report => {
          if (report.id === reportId && state.currentUser) {
            const existingVoteIndex = report.votes.findIndex(
              vote => vote.voterId === state.currentUser!.id
            );
            
            let newVotes = [...report.votes];
            
            if (existingVoteIndex >= 0) {
              // Update existing vote
              newVotes[existingVoteIndex] = {
                ...newVotes[existingVoteIndex],
                voteType,
                timestamp: new Date()
              };
            } else {
              // Add new vote
              newVotes.push({
                id: `vote_${Date.now()}`,
                voterId: state.currentUser!.id,
                reportId,
                voteType,
                timestamp: new Date()
              });
            }
            
            const confirmVotes = newVotes.filter(v => v.voteType === VoteType.CONFIRM).length;
            const rejectVotes = newVotes.filter(v => v.voteType === VoteType.REJECT).length;
            
            return {
              ...report,
              votes: newVotes,
              verificationCount: confirmVotes,
              isVerified: confirmVotes >= 3 && confirmVotes > rejectVotes,
              status: confirmVotes >= 3 && confirmVotes > rejectVotes 
                ? ReportStatus.VERIFIED 
                : rejectVotes >= 3 && rejectVotes > confirmVotes
                ? ReportStatus.REJECTED
                : ReportStatus.PENDING
            };
          }
          return report;
        });
        
        return { reports: updatedReports };
      }),
      
      clearData: () => set({
        currentUser: null,
        reports: [],
        userStats: null,
        badges: [],
        leaderboard: []
      })
    }),
    {
      name: 'traffic-agent-store',
      version: 1
    }
  )
);

// Main hook interface
export const useTrafficAgent = () => {
  const store = useTrafficAgentStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // Submit a new traffic report
  const submitReport = useCallback(async (formData: ReportFormData) => {
    if (!store.currentUser) {
      throw new Error('User not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, this would upload images and send to backend
      const newReport: TrafficReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        images: [], // Would be populated after image upload
        reporterId: store.currentUser.id,
        timestamp: new Date(),
        status: ReportStatus.PENDING,
        votes: [],
        verificationCount: 0,
        isVerified: false
      };

      store.addReport(newReport);
      
      // Update user stats
      const updatedUser = {
        ...store.currentUser,
        reportsCount: store.currentUser.reportsCount + 1,
        points: store.currentUser.points + 10, // Base points for report
        lastActive: new Date()
      };
      
      store.setCurrentUser(updatedUser);
      
      // Check for new badges
      await checkAndAwardBadges(updatedUser);
      
      setLoading(false);
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
      setLoading(false);
      throw err;
    }
  }, [store]);

  // Vote on a report
  const voteOnReport = useCallback(async (reportId: string, voteType: VoteType) => {
    if (!store.currentUser) {
      throw new Error('User not initialized');
    }

    store.voteOnReport(reportId, voteType);
    
    // Update user stats
    const updatedUser = {
      ...store.currentUser,
      votesCount: store.currentUser.votesCount + 1,
      points: store.currentUser.points + 2, // Points for voting
      lastActive: new Date()
    };
    
    store.setCurrentUser(updatedUser);
  }, [store]);

  // Check and award badges based on achievements
  const checkAndAwardBadges = useCallback(async (user: User) => {
    const newBadges: Badge[] = [];
    const currentBadgeIds = store.badges.map(b => b.id);

    // First Report Badge
    if (user.reportsCount >= 1 && !currentBadgeIds.includes('first_report')) {
      newBadges.push({
        id: 'first_report',
        name: 'Báo cáo đầu tiên',
        description: 'Hoàn thành báo cáo giao thông đầu tiên',
        icon: '🚨',
        rarity: BadgeRarity.BRONZE,
        requirement: '1 báo cáo',
        earnedDate: new Date()
      });
    }

    // Active Reporter Badge
    if (user.reportsCount >= 10 && !currentBadgeIds.includes('active_reporter')) {
      newBadges.push({
        id: 'active_reporter',
        name: 'Điệp viên tích cực',
        description: 'Đã hoàn thành 10 báo cáo giao thông',
        icon: '🏆',
        rarity: BadgeRarity.SILVER,
        requirement: '10 báo cáo',
        earnedDate: new Date()
      });
    }

    // Expert Reporter Badge
    if (user.reportsCount >= 50 && !currentBadgeIds.includes('expert_reporter')) {
      newBadges.push({
        id: 'expert_reporter',
        name: 'Chuyên gia giao thông',
        description: 'Đã hoàn thành 50 báo cáo giao thông',
        icon: '💎',
        rarity: BadgeRarity.GOLD,
        requirement: '50 báo cáo',
        earnedDate: new Date()
      });
    }

    // Community Helper Badge
    if (user.votesCount >= 20 && !currentBadgeIds.includes('community_helper')) {
      newBadges.push({
        id: 'community_helper',
        name: 'Hỗ trợ cộng đồng',
        description: 'Đã bình chọn 20 báo cáo của người khác',
        icon: '🤝',
        rarity: BadgeRarity.SILVER,
        requirement: '20 bình chọn',
        earnedDate: new Date()
      });
    }

    // Add new badges
    newBadges.forEach(badge => store.addBadge(badge));

    // Update user with new badges
    if (newBadges.length > 0) {
      const updatedUser = {
        ...user,
        badges: [...user.badges, ...newBadges],
        points: user.points + (newBadges.length * 50) // Bonus points for badges
      };
      store.setCurrentUser(updatedUser);
    }
  }, [store]);

  // Calculate user level based on points
  const calculateLevel = useCallback((points: number) => {
    return Math.floor(points / 100) + 1;
  }, []);

  // Get reports near a location
  const getNearbyReports = useCallback((location: { lat: number; lng: number }, radiusKm = 5) => {
    return store.reports.filter(report => {
      const distance = calculateDistance(location, report.location);
      return distance <= radiusKm;
    });
  }, [store.reports]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      // Initialize user if not exists
      if (!store.currentUser) {
        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          username: `Agent${Math.floor(Math.random() * 10000)}`,
          points: 0,
          level: 1,
          badges: [],
          reportsCount: 0,
          verifiedReportsCount: 0,
          votesCount: 0,
          joinDate: new Date(),
          lastActive: new Date()
        };
        
        store.setCurrentUser(newUser);
        
        // Initialize stats
        const initialStats: GameStats = {
          totalPoints: 0,
          level: 1,
          pointsToNextLevel: 100,
          totalReports: 0,
          verifiedReports: 0,
          totalVotes: 0,
          badges: [],
          rank: 0,
          streakDays: 0
        };
        
        store.updateStats(initialStats);
      }
      
      // Generate mock leaderboard only once on mount
      if (store.leaderboard.length === 0) {
        const mockEntries: LeaderboardEntry[] = [
          { rank: 1, user: { username: 'TrafficHero01' }, points: 1250, reportsCount: 25, verifiedReportsCount: 22 },
          { rank: 2, user: { username: 'SafetyGuard99' }, points: 1100, reportsCount: 22, verifiedReportsCount: 19 },
          { rank: 3, user: { username: 'RoadWatcher' }, points: 950, reportsCount: 19, verifiedReportsCount: 16 },
          { rank: 4, user: { username: 'CityPatrol' }, points: 800, reportsCount: 16, verifiedReportsCount: 14 },
          { rank: 5, user: { username: 'EagleEye' }, points: 750, reportsCount: 15, verifiedReportsCount: 12 }
        ];

        store.setLeaderboard(mockEntries);
      }
    };
    
    initialize();
  }, []); // Empty dependency array - only run once on mount

  return {
    // State
    currentUser: store.currentUser,
    reports: store.reports,
    userStats: store.userStats,
    badges: store.badges,
    leaderboard: store.leaderboard,
    loading,
    error,
    
    // Actions
    submitReport,
    voteOnReport,
    getNearbyReports,
    calculateLevel,
    
    // Utils
    clearAllData: store.clearData
  };
}; 