//@ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Helpers from "@/config/helpers";
import { Loader2 } from "lucide-react";
import PricingService from "@/services/pricing.service";

const CreatePricingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    serviceIdentifier: "",
    categoryName: "",
    isActive: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await PricingService.createPricing({
        ...formData,
        price: parseFloat(formData.price)
      });

      if (response.success) {
        Helpers.showToast("Service pricing created successfully", "success");
        navigate("/admin/pricing");
      } else {
        throw new Error(response.message || "Failed to create service pricing");
      }
    } catch (error: any) {
      console.error("Error creating service pricing:", error);
      Helpers.showToast(error.message || "Failed to create service pricing", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create Service Pricing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Service Pricing</CardTitle>
          <CardDescription>
            Create a new service pricing entry. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter service name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter service description"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (credits) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price in credits"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., per token, per image"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceIdentifier">Service Identifier *</Label>
                <Input
                  id="serviceIdentifier"
                  name="serviceIdentifier"
                  value={formData.serviceIdentifier}
                  onChange={handleInputChange}
                  placeholder="e.g., text-generation, image-generation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryName">Category *</Label>
                <Input
                  id="categoryName"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  placeholder="e.g., AI Models, Image Generation"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) => handleSelectChange("isActive", value === "active")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/pricing")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Pricing"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePricingPage; 