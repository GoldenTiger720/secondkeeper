import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useToast } from "@/hooks/use-toast";
import { toast } from "@/lib/notifications";
import { useState, useEffect } from "react";
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

export function AuthorizedFace({
  id,
  name,
  imageUrl,
  role,
  onDelete,
}: FaceProps) {
  const handleDelete = () => {
    onDelete(id);
  };

  const bgColor = getRandomColor(name);

  return (
    <div className="flex items-center gap-3 group hover:bg-muted/50 rounded-md p-2">
      <div className="relative h-12 w-12 flex-shrink-0">
        {imageUrl ? (
          <div
            className="h-full w-full rounded-full bg-cover bg-center border"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div
            className={cn(
              "h-full w-full rounded-full flex items-center justify-center text-white",
              bgColor
            )}
          >
            <span className="font-medium text-lg">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow min-w-0">
        <span className="font-medium truncate">{name}</span>
        <span className="text-xs text-muted-foreground capitalize">{role}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AuthorizedFacesCard() {
  const [faces, setFaces] = useState<AuthorizedFaceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  // const { toast } = useToast();

  useEffect(() => {
    const loadFaces = async () => {
      try {
        setIsLoading(true);
        const response = await facesService.getAllFaces();

        // Handle both array response and object with data property
        const facesData = Array.isArray(response)
          ? response
          : (response as { results?: AuthorizedFaceType[] }).results || [];
        setFaces(facesData);
      } catch (error) {
        console.error("Failed to load faces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaces();
  }, []);

  const handleDeleteFace = async (id: string) => {
    try {
      await facesService.removeFace(id);
      setFaces((currentFaces) => currentFaces.filter((face) => face.id !== id));
    } catch (error) {
      console.error("Failed to delete face:", error);
      toast.error("Failed to remove face");
    }
  };

  const handlePersonAdded = (newPerson: AuthorizedFaceType) => {
    setFaces((currentFaces) => [...currentFaces, newPerson]);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Authorized Faces</CardTitle>
          <CardDescription>
            People who can be recognized by the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 px-6">
          <ScrollArea className="h-64 pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : faces.length > 0 ? (
              <div className="space-y-4">
                {faces.map((face) => (
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
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">
                  No authorized faces added yet
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-6">
          <Button
            className="w-full"
            onClick={() => setIsAddPersonOpen(true)}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Person
          </Button>
        </CardFooter>
      </Card>

      <AddPersonDialog
        open={isAddPersonOpen}
        onOpenChange={setIsAddPersonOpen}
        onPersonAdded={handlePersonAdded}
      />
    </>
  );
}
