//@ts-nocheck
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Star, StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Helpers from "@/config/helpers";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import promptService from "@/services/prompt.service";
import EditPromptModal from "./editPromptModel";
import DeletePromptModal from "./deletePromptModal";
import SetDefaultPromptModal from "./setDefaultPromptModal";

interface Prompt {
  id: number;
  name: string;
  prompt: string;
  status: boolean;
  category: string;
  isDefault?: boolean;
}

const PromptTable = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSetDefaultModalOpen, setIsSetDefaultModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await promptService.getAllPrompts();
      setPrompts(response);
    } catch (error: any) {
      Helpers.showToast(error.message, "error");
    }
  };

  const handleDelete = async () => {
    if (selectedPrompt) {
      try {
        await promptService.deletePrompt(selectedPrompt.id);
        setPrompts(prompts.filter(prompt => prompt.id !== selectedPrompt.id));
        setIsDeleteModalOpen(false);
        Helpers.showToast("Prompt deleted successfully!", "success");
      } catch (error: any) {
        Helpers.showToast(error.message, "error");
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
          Prompts
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSetDefaultModalOpen(true)}
          >
            <Star className="h-4 w-4 mr-2" />
            Set Default
          </Button>
          <Button onClick={() => navigate("/admin/add-prompt")}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Prompt
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell>{prompt.name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {prompt.prompt}
                    </TableCell>
                    <TableCell>{prompt.category}</TableCell>
                    <TableCell>
                      <Badge variant={prompt.status ? "default" : "destructive"}>
                        {prompt.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {prompt.isDefault && (
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Prompt Modal */}
      <EditPromptModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchPrompts}
        promptId={selectedPrompt?.id || null}
      />

      {/* Delete Prompt Modal */}
      <DeletePromptModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        promptName={selectedPrompt?.name || ""}
      />

      {/* Set Default Prompt Modal */}
      <SetDefaultPromptModal
        isOpen={isSetDefaultModalOpen}
        onClose={() => setIsSetDefaultModalOpen(false)}
        onSuccess={fetchPrompts}
        prompts={prompts}
      />
    </div>
  );
};

export default PromptTable;

