import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  facesService,
  AuthorizedFace as AuthorizedFaceType,
} from "@/lib/api/facesService";
import { AddPersonDialog } from "@/components/AddNewPersonDialog";

interface FaceProps {
  id: string;
  name: string;
  imageUrl?: string;
  role: "primary" | "caregiver" | "family" | "other";
  onDelete: (id: string) => void;
}

const getRandomColor = (str: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-indigo-500",
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Take absolute value and mod with colors length
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const AuthorizedFace = ({ id, name, imageUrl, role, onDelete }: FaceProps) => {
  const handleDelete = () => {
    onDelete(id);
  };

  const bgColor = getRandomColor(name);

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg group hover:bg-accent/50">
      <div className="relative h-16 w-16 flex-shrink-0">
        {imageUrl ? (
          <div
            className="h-full w-full rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div
            className={cn(
              "h-full w-full rounded-full flex items-center justify-center text-white",
              bgColor
            )}
          >
            <span className="font-medium text-xl">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow min-w-0">
        <span className="font-medium truncate text-lg">{name}</span>
        <span className="text-sm text-muted-foreground capitalize">{role}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
};

const Faces = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [faces, setFaces] = useState<AuthorizedFaceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  useEffect(() => {
    const loadFaces = async () => {
      try {
        setIsLoading(true);
        const data = await facesService.getAllFaces();
        setFaces(data || []);
      } catch (error) {
        console.error("Failed to load faces:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaces();
  }, []);

  const filteredFaces = faces.filter(
    (face) =>
      face.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      face.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePersonAdded = (newPerson: AuthorizedFaceType) => {
    setFaces((currentFaces) => [...currentFaces, newPerson]);
  };

  const handleDeleteFace = async (id: string) => {
    try {
      await facesService.removeFace(id);
      setFaces((currentFaces) => currentFaces.filter((face) => face.id !== id));
    } catch (error) {
      console.error("Failed to delete face:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Authorized Faces
          </h1>
          <div className="flex gap-2">
            <Button
              className="w-full"
              onClick={() => setIsAddPersonOpen(true)}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Person
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Face Recognition</CardTitle>
            <CardDescription>
              Manage people who are authorized to be recognized by the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6 relative">
              <Search className="h-5 w-5 absolute left-3 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredFaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFaces.map((face) => (
                  <AuthorizedFace
                    key={face.id}
                    id={face.id}
                    name={face.name}
                    role={face.role}
                    imageUrl={face.face_image}
                    onDelete={handleDeleteFace}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No faces match your search"
                    : "No faces have been added yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <AddPersonDialog
          open={isAddPersonOpen}
          onOpenChange={setIsAddPersonOpen}
          onPersonAdded={handlePersonAdded}
        />
      </div>
    </DashboardLayout>
  );
};

export default Faces;
