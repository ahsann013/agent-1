import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit2 } from "lucide-react";
import Helpers from "@/config/helpers";
import promptService from "@/services/prompt.service";
import { useEffect, useState } from "react";
import { PROMPT_CATEGORIES } from "@/constants/promptCategories";

// Update the interface to match what the service expects
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
});

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promptId: number | null;
}

const EditPromptModal = ({ isOpen, onClose, onSuccess, promptId }: EditPromptModalProps) => {
  const [isActive, setIsActive] = useState(true);
  const [initialStatus, setInitialStatus] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      prompt: "",
      category: "General",
    },
  });

  useEffect(() => {
    if (isOpen && promptId) {
      fetchPromptDetails();
    }
  }, [isOpen, promptId]);

  const fetchPromptDetails = async () => {
    if (!promptId) return;
    
    try {
      const promptData = await promptService.getPromptById(promptId);
      form.reset({
        name: promptData.name,
        prompt: promptData.prompt,
        category: promptData.category || "General",
      });
      setIsActive(promptData.status);
      setInitialStatus(promptData.status);
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
      onClose();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!promptId) return;
    
    try {
      await promptService.updatePrompt(promptId, {
        name: values.name,
        prompt: values.prompt,
        category: values.category,
      });
      
      // If status has changed, toggle it
      if (isActive !== initialStatus) {
        await promptService.togglePromptStatus(promptId);
      }
      
      Helpers.showToast("Prompt updated successfully!", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      // Check if the error is due to a duplicate name
      if (error.message && error.message.includes("already exists")) {
        Helpers.showToast("A prompt with this name already exists. Please use a different name.", "error");
        form.setError("name", { 
          type: "manual", 
          message: "A prompt with this name already exists" 
        });
      } else {
        Helpers.showToast(error.message, "error");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background border border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit2 className="w-5 h-5 text-primary" />
            Edit Prompt
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prompt name" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your prompt.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the category this prompt belongs to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your prompt text"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The actual prompt text that will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  Toggle to set this prompt as active or inactive.
                </FormDescription>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border/50"
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPromptModal;
