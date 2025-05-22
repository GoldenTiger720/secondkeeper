import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { AddCameraDialog } from "@/components/dashboard/AddCameraDialog";
import { CameraStatusCard } from "@/components/dashboard/CameraStatusCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { AuthorizedFacesCard } from "@/components/dashboard/AuthorizedFaces";
import { Bell, Calendar, Camera, Clock, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const alerts = [
  {
    id: "1",
    type: "fall" as const,
    status: "new" as const,
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    camera: "Living Room",
    videoUrl: "/videos/detected/fall_clip.mp4",
    thumbnailUrl: "/images/thumnail/fall_clip.png",
  },
  {
    id: "2",
    type: "violence" as const,
    status: "confirmed" as const,
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    camera: "Living Room",
    videoUrl: "/videos/detected/violence_clip.mp4",
    thumbnailUrl: "/images/thumnail/violence_clip.png",
  },
  {
    id: "3",
    type: "choking" as const,
    status: "dismissed" as const,
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    camera: "Front Door",
    videoUrl: "/videos/detected/choking_clip.mp4",
    thumbnailUrl: "/images/thumnail/choking_clip.png",
  },
  {
    id: "4",
    type: "fire" as const,
    status: "confirmed" as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    camera: "Garage",
    videoUrl: "/videos/detected/fire_clip.mp4",
    thumbnailUrl: "/images/thumnail/fire_clip.png",
  },
];

const cameras = [
  {
    id: "1",
    name: "Living Room",
    stream_url: "rtsp://user:pass@192.168.1.100:554/stream1",
    isConnected: true,
  },
  {
    id: "2",
    name: "Kitchen",
    stream_url: "rtsp://user:pass@192.168.1.101:554/stream1",
    isConnected: true,
  },
  {
    id: "3",
    name: "Front Door",
    stream_url: "rtsp://user:pass@192.168.1.102:554/stream1",
    isConnected: false,
  },
];

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
  return (
    <DashboardLayout>
      {/* Add the style tag for badge animation */}
      <style dangerouslySetInnerHTML={{ __html: badgePulseStyle }} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Cameras"
            value={cameras.filter((c) => c.isConnected).length}
            description={`${cameras.length} total cameras configured`}
            icon={<Camera className="h-4 w-4" />}
          />
          <StatCard
            title="Alerts Today"
            value={alerts.length}
            trend={{ value: 12, isPositive: false }}
            icon={<Bell className="h-4 w-4" />}
          />
          <StatCard
            title="Uptime"
            value="99.2%"
            description="Last 30 days"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Last Check"
            value="2 mins ago"
            description="System performing normally"
            icon={<ShieldAlert className="h-4 w-4" />}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Recent Alerts
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} {...alert} />
          ))}
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
