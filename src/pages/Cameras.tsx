import { DashboardLayout } from "@/components/DashboardLayout";
import { CameraStatusCard } from "@/components/dashboard/CameraStatusCard";
import { AddCameraDialog } from "@/components/dashboard/AddCameraDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { camerasService } from "@/lib/api/camerasService";
import { toast } from "@/hooks/use-toast";

const Cameras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCameras = async () => {
      try {
        setIsLoading(true);
        const fetchedCameras = await camerasService.getAllCameras();
        setCameras(fetchedCameras.results);
      } catch (error) {
        toast({
          title: "Error Loading Cameras",
          description: "Could not retrieve camera list",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCameras();
  }, []);

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.stream_url.includes(searchQuery)
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

            {isLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading cameras...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCameras.map((camera) => (
                  <CameraStatusCard
                    key={camera.id}
                    id={camera.id.toString()}
                    name={camera.name}
                    stream_url={camera.stream_url} // You might want to add this to the backend response
                    isConnected={camera.status === "online"}
                  />
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cameras;
