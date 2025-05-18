
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash, Eye } from "lucide-react";

// Mock camera data
const mockCameras = [
  {
    id: "1",
    name: "Front Door",
    ip: "192.168.1.100",
    url: "rtsp://user:pass@192.168.1.100:554/stream1",
    userId: "1",
    userName: "John Doe",
    status: "online",
  },
  {
    id: "2",
    name: "Living Room",
    ip: "192.168.1.101",
    url: "rtsp://user:pass@192.168.1.101:554/stream1",
    userId: "1",
    userName: "John Doe",
    status: "online",
  },
  {
    id: "3",
    name: "Kitchen",
    ip: "192.168.1.102",
    url: "rtsp://user:pass@192.168.1.102:554/stream1",
    userId: "2",
    userName: "Jane Smith",
    status: "offline",
  },
  {
    id: "4",
    name: "Backyard",
    ip: "192.168.1.103",
    url: "rtsp://user:pass@192.168.1.103:554/stream1",
    userId: "2",
    userName: "Jane Smith",
    status: "online",
  },
  {
    id: "5",
    name: "Bedroom",
    ip: "192.168.1.104",
    url: "rtsp://user:pass@192.168.1.104:554/stream1",
    userId: "3",
    userName: "Mike Johnson",
    status: "offline",
  },
];

// Mock users for filtering
const mockUsers = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Mike Johnson" },
  { id: "4", name: "Sarah Williams" },
];

const AdminCameras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [cameras, setCameras] = useState(mockCameras);

  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = 
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.ip.includes(searchQuery) ||
      camera.url.includes(searchQuery);
    
    const matchesUser = selectedUser ? camera.userId === selectedUser : true;
    
    return matchesSearch && matchesUser;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">Camera Management</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cameras..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select 
          value={selectedUser} 
          onValueChange={setSelectedUser}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {mockUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCameras.map(camera => (
          <Card key={camera.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {camera.name}
                </CardTitle>
                <Badge variant={camera.status === "online" ? "outline" : "destructive"}>
                  {camera.status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">User: {camera.userName}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-3 gap-1 text-sm">
                  <div className="text-muted-foreground">IP Address:</div>
                  <div className="sm:col-span-2 font-mono text-xs break-all">{camera.ip}</div>
                </div>
                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-3 gap-1 text-sm">
                  <div className="text-muted-foreground">Stream URL:</div>
                  <div className="sm:col-span-2 font-mono text-xs truncate break-all" title={camera.url}>
                    {camera.url}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="flex-1 min-w-[120px]">
                  <Eye className="mr-2 h-4 w-4" />
                  View Stream
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCameras;
