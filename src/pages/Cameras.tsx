import { DashboardLayout } from "@/components/DashboardLayout";
import { CameraStatusCard } from "@/components/dashboard/CameraStatusCard";
import { AddCameraDialog } from "@/components/dashboard/AddCameraDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Search, RefreshCw, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { camerasService } from "@/lib/api/camerasService";
import { toast } from "@/hooks/use-toast";

const Cameras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCameras = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      const fetchedCameras = await camerasService.getAllCameras();

      if (fetchedCameras.results) {
        setCameras(fetchedCameras.results);
      } else if (Array.isArray(fetchedCameras)) {
        setCameras(fetchedCameras);
      } else {
        setCameras([]);
      }

      if (showToast) {
        toast({
          title: "Cameras Refreshed",
          description: "Camera list has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error loading cameras:", error);
      toast({
        title: "Error Loading Cameras",
        description: "Could not retrieve camera list. Please try again.",
        variant: "destructive",
      });
      setCameras([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadCameras(true);
  }, [loadCameras]);

  const handleCameraUpdated = useCallback(() => {
    loadCameras();
  }, [loadCameras]);

  const handleCameraDeleted = useCallback(() => {
    loadCameras();
  }, [loadCameras]);

  const handleCameraAdded = useCallback(() => {
    loadCameras();
  }, [loadCameras]);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.stream_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCameras = cameras.filter(
    (camera) => camera.status === "online"
  ).length;
  const totalCameras = cameras.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cameras</h1>
            <p className="text-muted-foreground">
              Manage your security cameras and view live streams
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <AddCameraDialog onCameraAdded={handleCameraAdded} />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Cameras
                  </p>
                  <p className="text-2xl font-bold">{totalCameras}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Online
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {onlineCameras}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Offline
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {totalCameras - onlineCameras}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Camera Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Camera Management</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6 relative">
              <Search className="h-5 w-5 absolute left-3 text-muted-foreground" />
              <Input
                placeholder="Search cameras by name or stream URL..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  <p className="text-muted-foreground">Loading cameras...</p>
                </div>
              </div>
            ) : (
              /* Camera Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCameras.length > 0 ? (
                  filteredCameras.map((camera) => (
                    <CameraStatusCard
                      key={camera.id}
                      id={camera.id.toString()}
                      name={camera.name}
                      stream_url={camera.stream_url}
                      isConnected={camera.status === "online"}
                      onCameraUpdated={handleCameraUpdated}
                      onCameraDeleted={handleCameraDeleted}
                    />
                  ))
                ) : searchQuery ? (
                  /* No Search Results */
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No cameras found
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      No cameras match your search criteria. Try adjusting your
                      search terms.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  /* No Cameras */
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No cameras configured
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-4">
                      Add your first camera to start monitoring. You can connect
                      IP cameras, RTSP streams, or local devices.
                    </p>
                    <AddCameraDialog
                      onCameraAdded={handleCameraAdded}
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Camera
                        </Button>
                      }
                    />
                  </div>
                )}

                {/* Add Camera Placeholder (only show when there are existing cameras) */}
                {filteredCameras.length > 0 && !searchQuery && (
                  <div className="flex items-center justify-center h-full min-h-[200px] border-2 border-dashed rounded-lg border-muted p-4 hover:border-muted-foreground/50 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">
                        Add Another Camera
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-[150px]">
                        Connect more cameras to expand your monitoring coverage
                      </p>
                      <AddCameraDialog
                        onCameraAdded={handleCameraAdded}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Camera
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cameras;
