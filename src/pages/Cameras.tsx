import { DashboardLayout } from "@/components/DashboardLayout";
import { CameraStatusCard } from "@/components/dashboard/CameraStatusCard";
import { AddCameraDialog } from "@/components/dashboard/AddCameraDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Mock data
const cameras = [
  {
    id: "1",
    name: "Living Room",
    ipAddress: "192.168.1.100",
    url: "rtsp://user:pass@192.168.1.100:554/stream1",
    isConnected: true,
  },
  {
    id: "2",
    name: "Kitchen",
    ipAddress: "192.168.1.101",
    url: "rtsp://user:pass@192.168.1.101:554/stream1",
    isConnected: true,
  },
  {
    id: "3",
    name: "Front Door",
    ipAddress: "192.168.1.102",
    url: "rtsp://user:pass@192.168.1.102:554/stream1",
    isConnected: false,
  },
  {
    id: "4",
    name: "Garage",
    ipAddress: "192.168.1.103",
    url: "rtsp://user:pass@192.168.1.103:554/stream1",
    isConnected: true,
  },
  {
    id: "5",
    name: "Backyard",
    ipAddress: "192.168.1.104",
    url: "rtsp://user:pass@192.168.1.104:554/stream1",
    isConnected: false,
  },
];

const Cameras = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.ipAddress.includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Cameras</h1>
          <AddCameraDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Camera Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6 relative">
              <Search className="h-5 w-5 absolute left-3 text-muted-foreground" />
              <Input
                placeholder="Search cameras by name or IP..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCameras.map((camera) => (
                <CameraStatusCard key={camera.id} {...camera} />
              ))}
              <div className="flex items-center justify-center h-full min-h-[200px] border-2 border-dashed rounded-lg border-muted p-4">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Add Camera</h3>
                  <p className="text-sm text-muted-foreground max-w-[150px]">
                    Add a new camera to monitor another area
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cameras;
