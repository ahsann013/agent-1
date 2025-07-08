//@ts-nocheck
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Star,CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Helpers from "@/config/helpers";
import llmService from "@/services/llm.service";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LLM {
    id: number;
    name: string;
    provider: string;
    type: string;
    isDefault: boolean;
    isPremium: boolean;
    isActive: boolean;
}

const LLMTablePage = () => {
    const [llms, setLlms] = useState<LLM[]>([]);
    const [selectedLLM, setSelectedLLM] = useState<LLM | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<string>("all");
    const [filteredLLMs, setFilteredLLMs] = useState<LLM[]>([]);

  
    const fetchLLMs = async () => {
        try {
            const response = await llmService.getAllLLMs();
            setLlms(response);
            setIsLoading(false);
        } catch (error: any) {
            Helpers.showToast(error.message, "error");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLLMs();
    }, []);

    useEffect(() => {
        if (selectedType === "all") {
            setFilteredLLMs(llms);
        } else {
            setFilteredLLMs(llms.filter(llm => llm.type === selectedType));
        }
    }, [selectedType, llms]);

    const handleDelete = async () => {
        if (selectedLLM) {
            try {
                await llmService.deleteLLM(selectedLLM.id);
                setLlms(llms.filter(llm => llm.id !== selectedLLM.id));
                setIsDeleteModalOpen(false);
                Helpers.showToast("LLM deleted successfully!", "success");
            } catch (error: any) {
                Helpers.showToast(error.message, "error");
            }
        }
    };
    const handleToggleStatus = async (llmId: number) => {
        try {
            await llmService.toggleModelStatus(llmId);
            setLlms(llms.map(llm => 
                llm.id === llmId ? { ...llm, status: llm.status === 'active' ? 'inactive' : 'active' } : llm
            ));
            Helpers.showToast("Model status updated successfully!", "success");
        } catch (error: any) {
            Helpers.showToast(error.message, "error");
        }
    };

    const handleSetDefault = async (llmId: number) => {
        try {
            await llmService.setDefaultLLM(llmId);
            setLlms(llms.map(llm => ({
                ...llm,
                isDefault: llm.id === llmId
            })));
            Helpers.showToast("Default LLM updated successfully!", "success");
            fetchLLMs();
        } catch (error: any) {
            Helpers.showToast(error.message, "error");
        }
    };

    const uniqueTypes = Array.from(new Set(llms.map(llm => llm.type)));

    if (isLoading) {
        return (
            <div className="flex h-[450px] items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Large Language Models </h2>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            {uniqueTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => navigate("/admin/add-llm")}>
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
            </div>
            <div className="space-y-4">
                <div className="rounded-md border ">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Name</TableHead>
                                <TableHead className="w-[120px]">Provider</TableHead>
                                <TableHead className="w-[120px]">Type</TableHead>
                                <TableHead className="w-[100px]">Default</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead> 
                                <TableHead className="w-[100px]">Premium</TableHead>
                                <TableHead className="w-[80px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLLMs.map((llm) => (
                                <TableRow key={llm.id}>
                                    <TableCell className="max-w-[200px]">{llm.name.length > 20 ? `${llm.name.substring(0, 25)}...` : llm.name}</TableCell>
                                    <TableCell>{llm.provider}</TableCell>
                                    <TableCell>{llm.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={`${llm.isDefault ? "default" : "secondary"} text-white`}>
                                            {llm.isDefault ? "Default" : "No"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={`${llm.status === "active" ? "default" : "secondary"} text-white`}>
                                            {llm.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={`${llm.isPremium ? "default" : "secondary"} text-white`}>
                                            {llm.isPremium ? "Premium" : "Free"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!llm.isDefault && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleSetDefault(llm.id)}
                                                title="Set as Default"
                                            >
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleStatus(llm.id)}
                                            title={`${llm.status === "active" ? "Deactivate" : "Activate"} Model`}
                                        >
                                            <CheckCircle className={`h-4 w-4 font-bold ${llm.status === "active" ? "text-green-500" : "text-red-500"}`} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedLLM(llm);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the LLM model
                            {selectedLLM && ` "${selectedLLM.name}"`}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LLMTablePage;