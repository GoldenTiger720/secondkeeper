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
import { useState } from "react";
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

interface FaceProps {
  id: string;
  name: string;
  imageUrl?: string;
  role: "primary" | "caregiver" | "family" | "other";
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

export function AuthorizedFace({ id, name, imageUrl, role }: FaceProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    toast({
      title: "Face Removed",
      description: `${name} has been removed from authorized faces.`,
    });
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
  const faces: FaceProps[] = [
    {
      id: "1",
      name: "Mary Johnson",
      role: "primary",
      imageUrl: "/images/authorized_people/mary.png",
    },
    {
      id: "2",
      name: "Robert Williams",
      role: "caregiver",
      imageUrl: "/images/authorized_people/robert.png",
    },
    {
      id: "3",
      name: "Susan Lee",
      role: "family",
      imageUrl: "/images/authorized_people/susan.png",
    },
    {
      id: "4",
      name: "David Garcia",
      role: "other",
      imageUrl: "/images/authorized_people/david.png",
    },
  ];

  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const onSubmit = (data: AddPersonFormValues) => {
    // Simulate sending data to server
    console.log("Submitting new person:", data);

    // Create form data to send image
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("role", data.role);
    if (data.image) {
      formData.append("image", data.image);
    }

    // In a real app, we would send formData to the server
    // fetch('/api/faces', { method: 'POST', body: formData })

    toast({
      title: "Person Added",
      description: `${data.name} has been added as a ${data.role}.`,
    });

    setIsAddPersonOpen(false);
    form.reset();
    setPreviewImage(null);
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
            <div className="space-y-4">
              {faces.map((face) => (
                <AuthorizedFace key={face.id} {...face} />
              ))}
            </div>
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
