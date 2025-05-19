
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
import { Plus, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { facesService, AuthorizedFace as AuthorizedFaceType } from "@/lib/api/facesService";

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

export function AuthorizedFace({ id, name, imageUrl, role, onDelete }: FaceProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(id);
  };

  const bgColor = getRandomColor(name);

  return (
    <div className="flex items-center gap-3 group">
      <div className="relative h-12 w-12 flex-shrink-0">
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

// Form schema for adding a new person
const addPersonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["primary", "caregiver", "family", "other"]),
  image: z.instanceof(File).optional(),
});

type AddPersonFormValues = z.infer<typeof addPersonSchema>;

export function AuthorizedFacesCard() {
  const [faces, setFaces] = useState<AuthorizedFaceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadFaces = async () => {
      try {
        setIsLoading(true);
        const data = await facesService.getAllFaces();
        setFaces(data);
      } catch (error) {
        console.error("Failed to load faces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaces();
  }, []);

  const form = useForm<AddPersonFormValues>({
    resolver: zodResolver(addPersonSchema),
    defaultValues: {
      name: "",
      role: "primary",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: AddPersonFormValues) => {
    try {
      const newFace = await facesService.addFace({
        name: data.name,
        role: data.role,
        face_image: data.image,
      });
      
      setFaces(currentFaces => [...currentFaces, newFace]);
      setIsAddPersonOpen(false);
      form.reset();
      setPreviewImage(null);
    } catch (error) {
      console.error("Failed to add face:", error);
    }
  };

  const handleDeleteFace = async (id: string) => {
    try {
      await facesService.removeFace(id);
      setFaces(currentFaces => currentFaces.filter(face => face.id !== id));
    } catch (error) {
      console.error("Failed to delete face:", error);
    }
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
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : faces.length > 0 ? (
              <div className="space-y-4">
                {faces.map((face) => (
                  <AuthorizedFace 
                    key={face.id} 
                    id={face.id} 
                    name={face.name} 
                    role={face.role}
                    imageUrl={face.image_url}
                    onDelete={handleDeleteFace}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">No authorized faces added yet</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-6">
          <Button className="w-full" onClick={() => setIsAddPersonOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Person
          </Button>
        </CardFooter>
      </Card>

      {/* Add New Person Dialog */}
      <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
            <DialogDescription>
              Add a new person who will be recognized by the security system.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Person Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="primary" id="primary" />
                          <Label htmlFor="primary">Elderly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="caregiver" id="caregiver" />
                          <Label htmlFor="caregiver">Caregiver</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="family" id="family" />
                          <Label htmlFor="family">Family Member</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other Trusted Person</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Label htmlFor="picture">Face Image</Label>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="face-image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-muted/50 hover:bg-muted"
                    >
                      {previewImage ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="max-h-[120px] max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-5">
                          <User className="w-8 h-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">
                            Click to upload face image
                          </p>
                        </div>
                      )}
                      <Input
                        id="face-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddPersonOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Person</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
