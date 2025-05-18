
import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, Plus, Edit, LogIn, Blocks, Bell, Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for users
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
    status: "active",
    cameras: 3,
    alerts: 5,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Somewhere, USA",
    status: "active",
    cameras: 2,
    alerts: 0,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1 (555) 567-8901",
    address: "789 Pine Rd, Nowhere, USA",
    status: "blocked",
    cameras: 1,
    alerts: 12,
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+1 (555) 234-5678",
    address: "321 Elm St, Everywhere, USA",
    status: "active",
    cameras: 4,
    alerts: 3,
  },
];

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">User Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Full Name</label>
                <Input className="sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Email</label>
                <Input type="email" className="sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Phone</label>
                <Input type="tel" className="sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <label className="sm:text-right">Address</label>
                <Input className="sm:col-span-3" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Cameras</TableHead>
              <TableHead className="text-center">Alerts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "outline" : "destructive"}>
                    {user.status === "active" ? "Active" : "Blocked"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{user.cameras}</TableCell>
                <TableCell className="text-center">{user.alerts}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" title="Edit User">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Manage Cameras">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Notification Settings">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Login as User">
                    <LogIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Block User">
                    <Blocks className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">{user.name}</CardTitle>
                <Badge variant={user.status === "active" ? "outline" : "destructive"}>
                  {user.status === "active" ? "Active" : "Blocked"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-1 text-sm">
                <div className="text-muted-foreground">Email:</div>
                <div className="truncate">{user.email}</div>
                
                <div className="text-muted-foreground">Phone:</div>
                <div>{user.phone}</div>
                
                <div className="text-muted-foreground">Cameras:</div>
                <div>{user.cameras}</div>
                
                <div className="text-muted-foreground">Alerts:</div>
                <div>{user.alerts}</div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 min-w-0">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-0">
                  <Camera className="h-4 w-4 mr-1" />
                  Cameras
                </Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-0">
                  <Bell className="h-4 w-4 mr-1" />
                  Alerts
                </Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-0">
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-0">
                  <Blocks className="h-4 w-4 mr-1" />
                  {user.status === "active" ? "Block" : "Unblock"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
