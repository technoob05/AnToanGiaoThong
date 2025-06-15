/**
 * Main Traffic Map Component using Leaflet and OSM
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, TrafficReport, ReportType, ReportStatus } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTrafficAgent } from '../hooks/useTrafficAgent';
import { reverseGeocode } from '../utils/geocoding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react';

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different report types
const createCustomIcon = (type: ReportType, status: ReportStatus) => {
  const getIconColor = () => {
    switch (status) {
      case ReportStatus.VERIFIED: return '#10B981'; // Green
      case ReportStatus.REJECTED: return '#EF4444'; // Red
      case ReportStatus.RESOLVED: return '#6B7280'; // Gray
      default: return '#F59E0B'; // Yellow for pending
    }
  };

  const getIconSymbol = () => {
    switch (type) {
      case ReportType.FADED_LINES: return '🛣️';
      case ReportType.BROKEN_ROAD: return '🕳️';
      case ReportType.TRAFFIC_LIGHT_ISSUE: return '🚦';
      case ReportType.POTHOLE: return '⚠️';
      case ReportType.MISSING_SIGN: return '🚧';
      case ReportType.DEBRIS: return '🗑️';
      default: return '❗';
    }
  };

  return L.divIcon({
    html: `
      <div style="
        background-color: ${getIconColor()};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-size: 14px;
      ">
        ${getIconSymbol()}
      </div>
    `,
    className: 'custom-traffic-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  html: `
    <div style="
      background-color: #3B82F6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  className: 'user-location-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

interface TrafficMapProps {
  onLocationSelect?: (location: Location) => void;
  onReportClick?: (report: TrafficReport) => void;
  selectedLocation?: Location | null;
  showReportForm?: boolean;
  className?: string;
}

// Component to handle map events
const MapEventHandler = ({ 
  onLocationSelect, 
  selectedLocation 
}: { 
  onLocationSelect?: (location: Location) => void;
  selectedLocation?: Location | null;
}) => {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      if (onLocationSelect) {
        const location: Location = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        
        // Get address for the location
        try {
          const address = await reverseGeocode(location);
          location.address = address;
        } catch (error) {
          console.error('Failed to get address:', error);
        }
        
        onLocationSelect(location);
      }
    }
  });

  // Center map on selected location
  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 16);
    }
  }, [selectedLocation, map]);

  return null;
};

// Component to center map on user location
const UserLocationHandler = ({ location }: { location: Location | null }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 15);
    }
  }, [location, map]);

  return location ? (
    <Marker 
      position={[location.lat, location.lng]} 
      icon={userLocationIcon}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">Vị trí của bạn</p>
          <p className="text-gray-600">
            {location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

// Report popup component
const ReportPopup = ({ 
  report, 
  onVote, 
  currentUserId 
}: { 
  report: TrafficReport;
  onVote?: (reportId: string, voteType: 'confirm' | 'reject') => void;
  currentUserId?: string;
}) => {
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.VERIFIED: return 'bg-green-100 text-green-800';
      case ReportStatus.REJECTED: return 'bg-red-100 text-red-800';
      case ReportStatus.RESOLVED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.VERIFIED: return <CheckCircle className="w-4 h-4" />;
      case ReportStatus.REJECTED: return <XCircle className="w-4 h-4" />;
      case ReportStatus.RESOLVED: return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: ReportType) => {
    const labels: Record<ReportType, string> = {
      [ReportType.FADED_LINES]: 'Vạch kẻ mờ',
      [ReportType.BROKEN_ROAD]: 'Đường hỏng',
      [ReportType.TRAFFIC_LIGHT_ISSUE]: 'Đèn giao thông lỗi',
      [ReportType.POTHOLE]: 'Ổ gà',
      [ReportType.MISSING_SIGN]: 'Thiếu biển báo',
      [ReportType.DEBRIS]: 'Rác thải/Vật cản',
      [ReportType.OTHER]: 'Khác'
    };
    return labels[type];
  };

  const userHasVoted = report.votes.some(vote => vote.voterId === currentUserId);
  const isOwnReport = report.reporterId === currentUserId;

  return (
    <div className="w-72 p-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getStatusColor(report.status)}>
            {getStatusIcon(report.status)}
            <span className="ml-1">
              {report.status === ReportStatus.PENDING && 'Chờ xác minh'}
              {report.status === ReportStatus.VERIFIED && 'Đã xác minh'}
              {report.status === ReportStatus.REJECTED && 'Bị từ chối'}
              {report.status === ReportStatus.RESOLVED && 'Đã giải quyết'}
            </span>
          </Badge>
          <span className="text-xs text-gray-500">
            {new Date(report.timestamp).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-1">{getTypeLabel(report.type)}</h3>
          <p className="text-sm text-gray-600">{report.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>📍 {report.location.address || 'Chưa có địa chỉ'}</span>
          <span>✅ {report.verificationCount} xác nhận</span>
        </div>

        {report.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {report.images.slice(0, 2).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Report ${index + 1}`}
                className="w-full h-20 object-cover rounded-md"
              />
            ))}
          </div>
        )}

        {!isOwnReport && !userHasVoted && report.status === ReportStatus.PENDING && onVote && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onVote(report.id, 'confirm')}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Xác nhận
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onVote(report.id, 'reject')}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Từ chối
            </Button>
          </div>
        )}

        {userHasVoted && (
          <div className="text-xs text-center text-gray-500 py-2">
            Bạn đã bình chọn cho báo cáo này
          </div>
        )}

        {isOwnReport && (
          <div className="text-xs text-center text-blue-600 py-2">
            Báo cáo của bạn
          </div>
        )}
      </div>
    </div>
  );
};

export const TrafficMap = ({
  onLocationSelect,
  onReportClick,
  selectedLocation,
  showReportForm = false,
  className = ''
}: TrafficMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const { location: userLocation, requestLocation, loading: locationLoading } = useGeolocation();
  const { reports, voteOnReport, currentUser } = useTrafficAgent();
  const [mapReady, setMapReady] = useState(false);

  // Default center (Vietnam)
  const defaultCenter: [number, number] = [21.0285, 105.8542]; // Hanoi
  const defaultZoom = 10;

  const handleVote = useCallback((reportId: string, voteType: 'confirm' | 'reject') => {
    voteOnReport(reportId, voteType === 'confirm' ? 'confirm' : 'reject');
  }, [voteOnReport]);

  const handleCenterOnUser = useCallback(() => {
    if (!userLocation) {
      requestLocation();
    }
  }, [userLocation, requestLocation]);

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
        zoom={userLocation ? 15 : defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* User location marker */}
        <UserLocationHandler location={userLocation} />

        {/* Traffic reports markers */}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createCustomIcon(report.type, report.status)}
            eventHandlers={{
              click: () => {
                onReportClick?.(report);
              }
            }}
          >
            <Popup>
              <ReportPopup
                report={report}
                onVote={handleVote}
                currentUserId={currentUser?.id}
              />
            </Popup>
          </Marker>
        ))}

        {/* Selected location marker for new reports */}
        {selectedLocation && showReportForm && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={L.divIcon({
              html: `
                <div style="
                  background-color: #DC2626;
                  width: 25px;
                  height: 25px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                  <div style="
                    width: 8px;
                    height: 8px;
                    background-color: white;
                    border-radius: 50%;
                  "></div>
                </div>
              `,
              className: 'selected-location-marker',
              iconSize: [25, 25],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Vị trí báo cáo mới</p>
                <p className="text-gray-600">
                  {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Map event handler */}
        <MapEventHandler 
          onLocationSelect={onLocationSelect} 
          selectedLocation={selectedLocation}
        />
      </MapContainer>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCenterOnUser}
          disabled={locationLoading}
          className="bg-white shadow-md"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Chú thích</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Chờ xác minh</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Đã xác minh</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Bị từ chối</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Đã giải quyết</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 