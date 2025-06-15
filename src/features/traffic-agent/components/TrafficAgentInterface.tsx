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
import { useGeolocation } from '@/features/traffic-explainer/hooks/useGeolocation';
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
  
  const geolocation = useGeolocation();

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
  const handleNewReport = useCallback(async () => {
    try {
      let currentLocation = geolocation.location;
      
      if (!currentLocation) {
        currentLocation = await geolocation.getCurrentLocation();
      }
      
      if (currentLocation) {
        setSelectedLocation({
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          address: currentLocation.address,
          timestamp: Date.now()
        });
        setActiveTab('report');
        setShowReportForm(true);
      } else {
        // Nếu không lấy được vị trí, vẫn cho phép tạo báo cáo với manual input
        setSelectedLocation(null);
        setActiveTab('report');
        setShowReportForm(true);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback: cho phép tạo báo cáo với manual input
      setSelectedLocation(null);
      setActiveTab('report');
      setShowReportForm(true);
    }
  }, [geolocation]);

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
      <div className="bg-white border-b shadow-sm p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-blue-500 p-1.5 md:p-2 rounded-lg">
              <Map className="w-5 h-5 md:w-6 md:h-6 text-blue-50" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Điệp viên Giao thông</h1>
              <p className="text-xs md:text-sm text-gray-600">Chào {currentUser.username}!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Location Info - Hidden on mobile, shown on tablet+ */}
            {geolocation.location ? (
              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                <div className="text-xs md:text-sm">
                  <div className="font-semibold text-green-800">Vị trí hiện tại</div>
                  <div className="text-green-700 max-w-24 md:max-w-32 truncate">
                    {geolocation.location.address || 'Đã xác định'}
                  </div>
                </div>
              </div>
            ) : geolocation.isLoading ? (
              <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs md:text-sm text-blue-700">Đang lấy vị trí...</div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 bg-yellow-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />
                <div className="text-xs md:text-sm text-yellow-700">Chưa có vị trí</div>
              </div>
            )}

            {/* User Stats */}
            <div className="flex items-center gap-2 md:gap-3 bg-blue-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              <div className="text-xs md:text-sm">
                <div className="font-semibold text-blue-900">{currentUser.points} điểm</div>
                <div className="text-blue-600">Level {currentUser.level}</div>
              </div>
            </div>
            
            {/* New Report Button */}
            <Button 
              onClick={handleNewReport}
              className="bg-green-500 hover:bg-green-600 px-3 md:px-4 py-2"
              size="sm"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Báo cáo mới</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar - Stats & Leaderboard */}
        <div className="w-full md:w-80 bg-gray-50 border-b md:border-r md:border-b-0 overflow-y-auto">
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
                        <span className="text-xs text-gray-600">
                          {new Date(report.timestamp).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{report.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {report.location.address || 'Không có địa chỉ'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {reports.length === 0 && (
                    <div className="text-center py-8 text-gray-600">
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
                    <div className="text-center py-4 text-gray-600">
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
                        <div className="text-xs text-gray-600">{entry.points} điểm</div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {entry.verifiedReportsCount} xác minh
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report" className="p-4">
              {showReportForm ? (
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
                      Chọn cách xác định vị trí cho báo cáo của bạn
                    </p>
                    <div className="space-y-2">
                      <Button 
                        onClick={handleNewReport}
                        className="w-full"
                        disabled={geolocation.isLoading}
                      >
                        {geolocation.isLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang lấy vị trí...
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 mr-2" />
                            Sử dụng vị trí hiện tại
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('map')}
                        variant="outline"
                        className="w-full"
                      >
                        Chọn vị trí trên bản đồ
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowReportForm(true);
                          setSelectedLocation(null); // Không có location, sẽ dùng manual input
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Nhập địa chỉ thủ công
                      </Button>
                    </div>
                    
                    {geolocation.error && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <strong>Không thể lấy vị trí:</strong> {geolocation.error}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Bạn có thể nhập địa chỉ thủ công hoặc chọn trên bản đồ
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative min-h-[400px] md:min-h-0">
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