import  { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Helpers from "@/config/helpers";
import { Loader2 } from "lucide-react";
import PricingService from "@/services/pricing.service";
import { useNavigate } from "react-router-dom";

interface PricingItem {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  isActive?: boolean;
  serviceIdentifier?: string;
  categoryName?: string;
}

const PricingPage = () => {
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);
  const navigate = useNavigate();

  // Fetch pricing data from the API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const response = await PricingService.getAllPricing();
        if (response.success && response.data) {
          setPricingItems(response.data);
        }
      } catch (error: any) {
        console.error("Error fetching pricing data:", error);
        Helpers.showToast("Failed to load pricing data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handlePriceChange = (id: number, value: string) => {
    setPricingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, price: parseFloat(value) || 0 } : item
      )
    );
  };

  const handleEdit = (id: number) => {
    setIsEditing(id);
  };

  const handleSave = async (id: number) => {
    try {
      setSaving(true);
      const itemToUpdate = pricingItems.find(item => item.id === id);
      if (!itemToUpdate) return;

      const response = await PricingService.updatePricing(id, { 
        price: itemToUpdate.price 
      });

      if (response.success) {
        setIsEditing(null);
        Helpers.showToast("Price updated successfully", "success");
      } else {
        throw new Error(response.message || "Failed to update price");
      }
    } catch (error: any) {
      console.error("Error saving price:", error);
      Helpers.showToast(error.message || "Failed to update price", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const pricingItemsToUpdate = pricingItems.map(item => ({
        id: item.id,
        price: item.price
      }));

      const response = await PricingService.updateBatchPricing(pricingItemsToUpdate);

      if (response.success) {
        setIsEditing(null);
        Helpers.showToast("All prices updated successfully", "success");
      } else {
        throw new Error(response.message || "Failed to update prices");
      }
    } catch (error: any) {
      console.error("Error saving prices:", error);
      Helpers.showToast(error.message || "Failed to update prices", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setInitializing(true);
      const response = await PricingService.initializeDefaultPricing();

      if (response.success) {
        // Refresh the pricing data
        const pricingResponse = await PricingService.getAllPricing();
        if (pricingResponse.success && pricingResponse.data) {
          setPricingItems(pricingResponse.data);
        }
        Helpers.showToast("Default prices initialized successfully", "success");
      } else {
        throw new Error(response.message || "Failed to initialize default prices");
      }
    } catch (error: any) {
      console.error("Error initializing default prices:", error);
      Helpers.showToast(error.message || "Failed to initialize default prices", "error");
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pricing Configuration</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => navigate("/admin/pricing/create")}
            variant="outline"
          >
            Create New Pricing
          </Button>
          <Button 
            onClick={handleInitializeDefaults} 
            variant="outline"
            disabled={initializing || saving || loading}
          >
            {initializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Defaults"
            )}
          </Button>
          <Button 
            onClick={handleSaveAll}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save All Changes"
            )}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Services Pricing</CardTitle>
          <CardDescription>
            Configure the pricing for different AI operations. Prices are in credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="w-[200px]">Service</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead className="w-[150px]">Price (credits)</TableHead>
                  <TableHead className="w-[200px]">Unit</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No pricing data found. Click "Initialize Defaults" to add the default pricing.
                    </TableCell>
                  </TableRow>
                ) : (
                  pricingItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {isEditing === item.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="w-24"
                          />
                        ) : (
                          Number(item.price).toFixed(2) 
                        )}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.categoryName || '-'}</TableCell>
                      <TableCell>
                        {isEditing === item.id ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(item.id)}
                            disabled={saving}
                          >
                            {saving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Save"
                            )}
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(item.id)}
                            disabled={isEditing !== null || saving}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Define API call functions directly in the componen


export default PricingPage;
