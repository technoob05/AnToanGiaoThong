/**
 * Main Traffic Agent Interface Component
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  Plus, 
  Trophy, 
  User, 
  Target, 
  MapPin,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Medal,
  Settings
} from 'lucide-react';
import { TrafficMap } from './TrafficMap';
import { ReportForm } from './ReportForm';
import { useTrafficAgent } from '../hooks/useTrafficAgent';
import { useGeolocation } from '../hooks/useGeolocation';
import { Location, TrafficReport, ReportFormData, BadgeRarity } from '../types';

interface TrafficAgentInterfaceProps {
  className?: string;
}

export const TrafficAgentInterface = ({ className = '' }: TrafficAgentInterfaceProps) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  
  const { 
    currentUser, 
    reports, 
    badges, 
    leaderboard, 
    submitReport, 
    loading, 
    error 
  } = useTrafficAgent();
  
  const { location: userLocation, requestLocation } = useGeolocation();

  // Handle location selection for new reports
  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    if (!showReportForm) {
      setShowReportForm(true);
      setActiveTab('report');
    }
  }, [showReportForm]);

  // Handle report submission
  const handleReportSubmit = useCallback(async (formData: ReportFormData) => {
    try {
      await submitReport(formData);
      setShowReportForm(false);
      setSelectedLocation(null);
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  }, [submitReport]);

  // Cancel report creation
  const handleReportCancel = useCallback(() => {
    setShowReportForm(false);
    setSelectedLocation(null);
    setActiveTab('map');
  }, []);

  // Handle new report button
  const handleNewReport = useCallback(() => {
    if (!userLocation) {
      requestLocation();
    }
    setActiveTab('report');
    setShowReportForm(true);
  }, [userLocation, requestLocation]);

  // Get badge rarity color
  const getBadgeRarityColor = (rarity: BadgeRarity) => {
    switch (rarity) {
      case BadgeRarity.BRONZE: return 'bg-orange-100 text-orange-800';
      case BadgeRarity.SILVER: return 'bg-gray-100 text-gray-800';
      case BadgeRarity.GOLD: return 'bg-yellow-100 text-yellow-800';
      case BadgeRarity.PLATINUM: return 'bg-purple-100 text-purple-800';
      case BadgeRarity.DIAMOND: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Điệp viên Giao thông</h1>
              <p className="text-sm text-gray-600">Chào {currentUser.username}!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User Stats */}
            <div className="flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-500" />
              <div className="text-sm">
                <div className="font-semibold text-blue-900">{currentUser.points} điểm</div>
                <div className="text-blue-600">Level {currentUser.level}</div>
              </div>
            </div>
            
            {/* New Report Button */}
            <Button 
              onClick={handleNewReport}
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Báo cáo mới
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar - Stats & Leaderboard */}
        <div className="w-80 bg-gray-50 border-r overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3 p-1 m-2">
              <TabsTrigger value="map" className="text-xs">
                <Map className="w-4 h-4 mr-1" />
                Bản đồ
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                <Trophy className="w-4 h-4 mr-1" />
                Thống kê
              </TabsTrigger>
              <TabsTrigger value="report" className="text-xs">
                <Plus className="w-4 h-4 mr-1" />
                Báo cáo
              </TabsTrigger>
            </TabsList>

            {/* Map Tab - Reports List */}
            <TabsContent value="map" className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Báo cáo gần đây</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={
                            report.isVerified 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {report.isVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(report.timestamp).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{report.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {report.location.address || 'Không có địa chỉ'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {reports.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Chưa có báo cáo nào</p>
                      <p className="text-xs">Hãy tạo báo cáo đầu tiên!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="p-4 space-y-4">
              {/* Personal Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Thành tích cá nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentUser.reportsCount}
                      </div>
                      <div className="text-xs text-blue-600">Tổng báo cáo</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentUser.verifiedReportsCount}
                      </div>
                      <div className="text-xs text-green-600">Đã xác minh</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {currentUser.points}
                      </div>
                      <div className="text-xs text-orange-600">Tổng điểm</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentUser.level}
                      </div>
                      <div className="text-xs text-purple-600">Level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Huy hiệu ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {badges.map((badge) => (
                      <div 
                        key={badge.id}
                        className="p-2 bg-white rounded-lg border text-center"
                      >
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <div className="text-xs font-medium">{badge.name}</div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${getBadgeRarityColor(badge.rarity)}`}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  {badges.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Medal className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Chưa có huy hiệu nào</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Leaderboard */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Bảng xếp hạng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry) => (
                    <div 
                      key={entry.rank}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        entry.user.username === currentUser.username 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-white border'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold">
                        {entry.rank <= 3 ? (
                          <Star className={`w-4 h-4 ${
                            entry.rank === 1 ? 'text-yellow-500' :
                            entry.rank === 2 ? 'text-gray-400' :
                            'text-orange-400'
                          }`} />
                        ) : (
                          entry.rank
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{entry.user.username}</div>
                        <div className="text-xs text-gray-500">{entry.points} điểm</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {entry.verifiedReportsCount} xác minh
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report" className="p-4">
              {showReportForm && selectedLocation ? (
                <ReportForm
                  location={selectedLocation}
                  onSubmit={handleReportSubmit}
                  onCancel={handleReportCancel}
                  loading={loading}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tạo báo cáo mới</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-4">
                      Click vào bản đồ để chọn vị trí báo cáo
                    </p>
                    <Button 
                      onClick={() => setActiveTab('map')}
                      variant="outline"
                    >
                      Chuyển đến bản đồ
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <TrafficMap
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            showReportForm={showReportForm}
            className="h-full"
          />
          
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 