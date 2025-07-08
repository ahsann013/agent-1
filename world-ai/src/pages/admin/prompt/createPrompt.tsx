import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import promptService from "@/services/prompt.service";
import Helpers from "@/config/helpers";
import { PROMPT_CATEGORIES } from "@/constants/promptCategories";

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

export default function CreatePromptPage() {
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      prompt: "",
      category: "General",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await promptService.createPrompt({
        name: values.name,
        prompt: values.prompt,
        status: isActive,
        category: values.category, 
      });
      Helpers.showToast("Prompt created successfully!", "success");
      navigate("/admin/prompts");
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
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
          Create New Prompt
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
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

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/prompts")}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Prompt</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
