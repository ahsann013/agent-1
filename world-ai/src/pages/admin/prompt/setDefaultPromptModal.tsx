import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import promptService from "@/services/prompt.service";
import Helpers from "@/config/helpers";
import { PROMPT_CATEGORIES } from "@/constants/promptCategories";

interface SetDefaultPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prompts: any[];
}

const SetDefaultPromptModal = ({
  isOpen,
  onClose,
  onSuccess,
  prompts,
}: SetDefaultPromptModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Get prompts for selected category
  const categoryPrompts = prompts.filter(
    (prompt) => prompt.category === selectedCategory
  );

  const handleSave = async () => {
    if (!selectedPromptId) {
      Helpers.showToast("Please select a prompt", "error");
      return;
    }

    setLoading(true);
    try {
      // First, set isDefault to false for all prompts in the category
      const promptsToUpdate = categoryPrompts.filter(
        (p) => p.id.toString() !== selectedPromptId
      );
      for (const prompt of promptsToUpdate) {
        await promptService.updatePrompt(prompt.id, {
          ...prompt,
          isDefault: false,
        });
      }

      // Then set the selected prompt as default
      await promptService.updatePrompt(parseInt(selectedPromptId), {
        isDefault: true,
      });

      Helpers.showToast("Default prompt updated successfully!", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Default Prompt by Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Category</label>
            <Select
              value={selectedCategory}
              onValueChange={(value: any) => {
                setSelectedCategory(value);
                setSelectedPromptId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Prompt</label>
              <Select
                value={selectedPromptId}
                onValueChange={setSelectedPromptId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a prompt" />
                </SelectTrigger>
                <SelectContent>
                  {categoryPrompts.map((prompt) => (
                    <SelectItem
                      key={prompt.id}
                      value={prompt.id.toString()}
                    >
                      {prompt.name} {prompt.isDefault ? "(Current Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetDefaultPromptModal; 