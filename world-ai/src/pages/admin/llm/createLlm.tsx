//@ts-nocheck
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import llmService from "@/services/llm.service";
import { useEffect } from "react";
import { useState } from "react";
import Helpers from "@/config/helpers";
import { MODEL_TYPES } from "@/constants/promptCategories";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Edit, Star, StarOff, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    provider: z.string({
        required_error: "Please select a provider.",
    }),
    isPremium: z.boolean().default(false),
    type: z.string().min(1, {
        message: "Model type is required.",
    }),
});


export function CreateLLMPage() {
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            provider: "",
            isPremium: false,
            type: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await llmService.createLLM(values);
            Helpers.showToast("LLM created successfully", "success");
            navigate("/admin/llm"); 
        } catch (error) {
            console.error("Error creating LLM:", error);
            Helpers.showToast(error.message, "error");
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Create New LLM</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>LLM Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model Type</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.setValue('name', '');
                                                    form.setValue('provider', '');
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a model type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MODEL_TYPES.map((type) => (
                                                        <SelectItem key={type.id} value={type.enum}>
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model Name</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    // Automatically set provider when model is selected
                                                    const selectedModel = MODEL_TYPES
                                                        .find(type => type.enum === form.watch('type'))
                                                        ?.models.find(model => model.name === value);
                                                    if (selectedModel) {
                                                        form.setValue('provider', selectedModel.platform);
                                                    }
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MODEL_TYPES.find(type => type.enum === form.watch('type'))?.models.map((model) => (
                                                        <SelectItem key={model.name} value={model.name}>
                                                            {model.name} ({model.cost})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Select from available models for the chosen type
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="provider"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provider</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled />
                                        </FormControl>
                                        <FormDescription>
                                            Provider is automatically set based on the selected model
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPremium"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Premium Model</FormLabel>
                                            <FormDescription>
                                                Mark this model as premium for restricted access
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit">Create Model</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export function LLMListPage() {
    const [llms, setLlms] = useState<Array<{
        id: number;
        name: string;
        provider: string;
        type: string;
        isDefault: boolean;
        isPremium: boolean;
    }>>([]);

    const fetchLLMs = async () => {
        try {
            const response = await llmService.getLLMs();
            setLlms(response);
        } catch (error) {
            Helpers.showToast("Failed to fetch LLMs", "error");
        }
    };

    useEffect(() => {
        fetchLLMs();
    }, []);

    const handleSetDefault = async (id: number) => {
        try {
            await llmService.setDefault(id);
            await fetchLLMs(); // Refresh the list
            Helpers.showToast("Default LLM updated successfully", "success");
        } catch (error) {
            Helpers.showToast("Failed to update default LLM", "error");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await llmService.deleteLLM(id);
            await fetchLLMs(); // Refresh the list
            Helpers.showToast("LLM deleted successfully", "success");
        } catch (error) {
            Helpers.showToast("Failed to delete LLM", "error");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">LLM Models</h2>
                <Button onClick={() => navigate("/admin/llm/create")}>
                    Create New LLM
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>LLM Models List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead>Premium</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {llms.map((llm) => (
                                <TableRow key={llm.id}>
                                    <TableCell>{llm.name}</TableCell>
                                    <TableCell>{llm.provider}</TableCell>
                                    <TableCell>
                                        {MODEL_TYPES.find(type => type.enum === llm.type)?.name || llm.type}
                                    </TableCell>
                                    <TableCell>
                                        {llm.isDefault ? (
                                            <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                        ) : (
                                            <StarOff className="h-4 w-4 text-gray-300" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {llm.isPremium ? "Yes" : "No"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => navigate(`/admin/llm/edit/${llm.id}`)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleSetDefault(llm.id)}
                                                    disabled={llm.isDefault}
                                                >
                                                    <Star className="mr-2 h-4 w-4" />
                                                    Set as Default
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(llm.id)}
                                                    className="text-red-600"
                                                    disabled={llm.isDefault}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}