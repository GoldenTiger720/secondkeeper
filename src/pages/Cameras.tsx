import { DashboardLayout } from "@/components/DashboardLayout";
import { CameraStatusCard } from "@/components/dashboard/CameraStatusCard";
import { AddCameraDialog } from "@/components/dashboard/AddCameraDialog";
import { EditCameraDialog } from "@/components/dashboard/EditCameraDialog";
import { DeleteCameraDialog } from "@/components/dashboard/DeleteCameraDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Search, RefreshCw, Plus, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { camerasService, Camera as CameraType } from "@/lib/api/camerasService";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Cameras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("5");

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);

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
    setEditDialogOpen(false);
  }, [loadCameras]);

  const handleCameraDeleted = useCallback(() => {
    loadCameras();
    setDeleteDialogOpen(false);
  }, [loadCameras]);

  const handleCameraAdded = useCallback(() => {
    loadCameras();
  }, [loadCameras]);

  const handleEditCamera = (camera: CameraType) => {
    setSelectedCamera(camera);
    setEditDialogOpen(true);
  };

  const handleDeleteCamera = (camera: CameraType) => {
    setSelectedCamera(camera);
    setDeleteDialogOpen(true);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.stream_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculation
  const totalItems = filteredCameras.length;
  const pageCount = Math.ceil(totalItems / parseInt(pageSize));
  const startIndex = (currentPage - 1) * parseInt(pageSize);
  const endIndex = Math.min(startIndex + parseInt(pageSize), totalItems);
  const paginatedCameras = filteredCameras.slice(startIndex, endIndex);

  // Generate pagination items
  const paginationItems = [];
  const showEllipsisStart = currentPage > 3;
  const showEllipsisEnd = currentPage < pageCount - 2;
  const maxPages = 5;

  let startPage = 1;
  let endPage = pageCount;

  if (pageCount > maxPages) {
    if (currentPage <= 3) {
      endPage = maxPages;
    } else if (currentPage >= pageCount - 2) {
      startPage = pageCount - maxPages + 1;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink
          onClick={() => handlePageChange(i)}
          isActive={currentPage === i}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center space-x-4">
                  <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Cameras
                  </p>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {totalCameras}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center space-x-4">
                  <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Online
                  </p>
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {onlineCameras}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center space-x-4">
                  <div className="p-2 sm:p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 rounded-full bg-red-500 dark:bg-red-400" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Offline
                  </p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
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
              /* Camera Table */
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        URL
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCameras.length > 0 ? (
                      paginatedCameras.map((camera, index) => (
                        <TableRow key={camera.id}>
                          <TableCell className="text-center font-medium">
                            {startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium truncate">
                                {camera.name}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell
                            className="hidden lg:table-cell font-mono text-xs truncate max-w-[300px]"
                            title={camera.stream_url}
                          >
                            {camera.stream_url}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {camera.status === "online" ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                Online
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200"
                              >
                                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                                Offline
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 inline-flex text-gray-500 hover:text-gray-700"
                              onClick={() => handleEditCamera(camera)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 inline-flex text-gray-500 hover:text-red-600"
                              onClick={() => handleDeleteCamera(camera)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : searchQuery ? (
                      /* No Search Results */
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center py-4">
                            <Search className="h-8 w-8 text-muted-foreground mb-2" />
                            <h3 className="font-medium text-muted-foreground">
                              No cameras found
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                              No cameras match your search criteria. Try
                              adjusting your search terms.
                            </p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => setSearchQuery("")}
                            >
                              Clear Search
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      /* No Cameras */
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center py-4">
                            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                            <h3 className="font-medium text-muted-foreground">
                              No cameras configured
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                              Add your first camera to start monitoring. You can
                              connect IP cameras, RTSP streams, or local
                              devices.
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
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {filteredCameras.length > 0 && !isLoading && (
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{endIndex} of {totalItems} cameras
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex  items-center gap-5">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                      value={pageSize}
                      onValueChange={handlePageSizeChange}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pageSize} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {["5", "10", "20", "30", "50"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mobile Pagination - Simple Previous/Next */}
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {pageCount}
                      </span>

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(pageCount, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === pageCount
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </div>
                  </div>

                  {/* Desktop Pagination - Full Navigation */}
                  <div className="hidden sm:block">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {showEllipsisStart && (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(1)}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          </>
                        )}

                        {paginationItems}

                        {showEllipsisEnd && (
                          <>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(pageCount)}
                              >
                                {pageCount}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                Math.min(pageCount, currentPage + 1)
                              )
                            }
                            className={
                              currentPage === pageCount
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Camera Dialog */}
      {selectedCamera && (
        <EditCameraDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSuccess={handleCameraUpdated}
          cameraId={selectedCamera.id}
          cameraName={selectedCamera.name}
          currentStreamUrl={selectedCamera.stream_url}
        />
      )}

      {/* Delete Camera Dialog */}
      {selectedCamera && (
        <DeleteCameraDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onSuccess={handleCameraDeleted}
          cameraId={selectedCamera.id}
          cameraName={selectedCamera.name}
        />
      )}
    </DashboardLayout>
  );
};

export default Cameras;
