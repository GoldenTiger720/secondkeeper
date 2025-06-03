import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { User } from "lucide-react";
import { toast } from "@/lib/notifications";
import {
  facesService,
  AuthorizedFace as AuthorizedFaceType,
} from "@/lib/api/facesService";

// Form schema for adding a new person
const addPersonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["primary", "caregiver", "family", "other"]),
  face_image: z.instanceof(File).optional(),
});

type AddPersonFormValues = z.infer<typeof addPersonSchema>;

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonAdded: (person: AuthorizedFaceType) => void;
}

export function AddPersonDialog({
  open,
  onOpenChange,
  onPersonAdded,
}: AddPersonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please select an image smaller than 5MB");
        return;
      }

      form.setValue("face_image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: AddPersonFormValues) => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("role", data.role);

      if (data.face_image) {
        formData.append("face_image", data.face_image);
      }

      // Call the API
      const response = await facesService.addFace(formData);

      // Handle response - extract the actual face data
      const newFace = response.data || response;
      console.log("New face added:", newFace);

      //   if (newFace.face_image && !newFace.image_url) {
      //     newFace.image_url = newFace.face_image;
      //   }

      // Notify parent component
      onPersonAdded(newFace);

      // Close modal and reset form
      handleModalClose();

      toast.success(`${data.name} has been added to authorized faces.`);
    } catch (error) {
      console.error("Failed to add face:", error);

      let errorMessage = "Failed to add person";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors.join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      form.reset();
      setPreviewImage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
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
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={isSubmitting}
                    />
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
                      disabled={isSubmitting}
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
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {previewImage ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="max-h-[120px] max-w-full object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-5">
                        <User className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Click to upload face image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 5MB, JPG/PNG only
                        </p>
                      </div>
                    )}
                    <Input
                      id="face-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                    />
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Person"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
