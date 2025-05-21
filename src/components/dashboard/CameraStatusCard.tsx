import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CameraStatusProps {
  id: string;
  name: string;
  ipAddress: string;
  url: string;
  isConnected: boolean;
}

export function CameraStatusCard({
  id,
  name,
  ipAddress,
  url,
  isConnected,
}: CameraStatusProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{name}</CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="status-connected">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="status-disconnected">
                Disconnected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1 text-sm">
            <div className="text-muted-foreground">IP Address:</div>
            <div className="col-span-2 font-mono text-xs">{ipAddress}</div>
          </div>
          <div className="grid grid-cols-3 gap-1 text-sm">
            <div className="text-muted-foreground">Stream URL:</div>
            <div className="col-span-2 font-mono text-xs truncate" title={url}>
              {url}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="sm" className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  View Stream
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isConnected
                  ? "Open live camera feed"
                  : "Camera is currently offline"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit camera</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete camera</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
