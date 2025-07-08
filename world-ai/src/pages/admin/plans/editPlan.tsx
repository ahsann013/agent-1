import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Helpers from "@/config/helpers";
import stripeService from "@/services/stripe.service";
import { ArrowLeft, Plus, X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  unitAmount: number;
  unitAmountDecimal: number;
  interval?: string;
  featured: boolean;
  features: string[];
  credits?: number;
  metadata?: {
    credits?: string | number;
  };
}

const EditPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [features, setFeatures] = useState<string[]>([""]);
  const [formData, setFormData] = useState<Plan>({
    id: "",
    name: "",
    description: "",
    unitAmount: 0,
    unitAmountDecimal: 0,
    interval: "month",
    featured: false,
    features: [""],
    metadata: {
      credits: 0
    }
  });

  useEffect(() => {
    if (id) {
      fetchPlan();
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      // Get all products first
      const products = await stripeService.getProducts();
      
      // Find the product with matching ID
      const product = products.find(p => p.id === id);
      
      if (!product) {
        throw new Error("Plan not found");
      }
      
      setFormData(product);
      setFeatures(product.features);
      setIsLoading(false);
    } catch (error: any) {
      Helpers.showToast(error.message || "Failed to fetch plan", "error");
      navigate("/admin/plans");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "credits") {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          credits: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeatureField = () => {
    setFeatures([...features, ""]);
  };

  const removeFeatureField = (index: number) => {
    if (features.length > 1) {
      const newFeatures = [...features];
      newFeatures.splice(index, 1);
      setFeatures(newFeatures);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate price is a number
    let price = parseFloat(formData.unitAmount.toString());
    if (isNaN(price)) {
      Helpers.showToast("Price must be a valid number", "error");
      setIsSubmitting(false);
      return;
    }

    // Filter out empty features
    const filteredFeatures = features.filter(feature => feature.trim() !== "");
    if (filteredFeatures.length === 0) {
      Helpers.showToast("Please add at least one feature", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      // Update product using Stripe service
      if (id) {
        const creditsValue = formData.metadata?.credits ? 
          typeof formData.metadata.credits === 'string' ? 
            parseInt(formData.metadata.credits) : 
            formData.metadata.credits 
          : undefined;
            
        await stripeService.updateProduct(id, {
          name: formData.name,
          description: formData.description,
          unitAmount: formData.unitAmountDecimal,
          interval: formData.interval === "one-time" ? undefined : formData.interval,
          features: filteredFeatures,
          featured: formData.featured,
          credits: creditsValue
        });
      }
      
      Helpers.showToast("Plan updated successfully!", "success");
      navigate("/admin/plans");
    } catch (error: any) {
      Helpers.showToast(error.message || "Failed to update plan", "error");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/plans")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
            Edit Plan: {formData.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Basic, Premium, Enterprise"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitAmountDecimal">Price</Label>
                <Input
                  id="unitAmountDecimal"
                  name="unitAmountDecimal"
                  value={formData.unitAmountDecimal}
                  onChange={handleInputChange}
                  placeholder="e.g. 9.99 (enter 0 for free)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval">Billing Cycle</Label>
                <select
                  id="interval"
                  name="interval"
                  value={formData.interval || "one-time"}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="week">Weekly</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  name="credits"
                  value={formData.metadata?.credits || ''}
                  onChange={handleInputChange}
                  placeholder="Number of credits for this plan"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the plan..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label>Features</Label>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      required={index === 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeatureField(index)}
                      disabled={features.length === 1 && index === 0}
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeatureField}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={handleSwitchChange("featured")}
                />
                <Label htmlFor="featured">Featured Plan</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/plans")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-background"></div>
                    Saving...
                  </>
                ) : (
                  "Save Plan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPlan; 