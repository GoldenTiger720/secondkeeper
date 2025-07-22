import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { AuthorizedFacesCard } from "@/components/dashboard/AuthorizedFaces";
import { Bell, Calendar, Clock, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { alertsService, type Alert } from "@/lib/api/alertsService";
import { type Camera } from "@/lib/api/camerasService";


// Add CSS for the badge pulse animation
const badgePulseStyle = `
  @keyframes badgePulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }
  
  .alert-badge-pulse {
    animation: badgePulse 1s ease-in-out infinite;
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
  }
`;

const Index = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Handle authentication errors, server errors, or network errors
      if (event.reason?.response?.status === 401 || event.reason?.response?.status === 500 || !event.reason?.response) {
        localStorage.removeItem("secondkeeper_token");
        localStorage.removeItem("secondkeeper_access_token");
        localStorage.removeItem("safeguard_user");
        navigate('/login');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        setIsLoadingAlerts(true);
        const response = await alertsService.getRecentAlerts(4);
        console.log(response);
        setAlerts(response.alerts || []);
        setCameras(response.cameras || []);
      } catch (error) {
        console.error('Failed to fetch recent alerts:', error);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    fetchRecentAlerts();
  }, []);

  return (
    <DashboardLayout>
      {/* Add the style tag for badge animation */}
      <style dangerouslySetInnerHTML={{ __html: badgePulseStyle }} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <StatCard
            title="Active Cameras"
            value={cameras.filter((c) => c.status === "online").length}
            description={`${cameras.length} total cameras configured`}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Alerts Today"
            value={alerts.length}
            icon={<Bell className="h-4 w-4" />}
          />
          
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Recent Alerts
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoadingAlerts ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              Loading alerts...
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                id={alert.id.toString()}
                type={alert.alert_type}
                status={alert.status}
                timestamp={new Date(alert.detection_time)}
                camera={alert.camera_name}
                videoUrl={alert.video_file}
                thumbnailUrl={alert.thumbnail}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No recent alerts
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-medium">Upcoming System Checks</h2>
            <Card>
              <CardHeader className="px-6">
                <CardTitle className="text-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Schedule</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <p className="font-medium">Daily System Diagnostic</p>
                      <p className="text-sm text-muted-foreground">
                        Automated check of all cameras and sensors
                      </p>
                    </div>
                    <p className="text-sm font-medium">Today, 11:00 PM</p>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <p className="font-medium">Weekly Performance Review</p>
                      <p className="text-sm text-muted-foreground">
                        Analysis of detection accuracy and system health
                      </p>
                    </div>
                    <p className="text-sm font-medium">May 23, 10:00 AM</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Model Update Available</p>
                      <p className="text-sm text-muted-foreground">
                        New AI model with improved detection capabilities
                      </p>
                    </div>
                    <p className="text-sm font-medium">May 25, 2:00 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <AuthorizedFacesCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
