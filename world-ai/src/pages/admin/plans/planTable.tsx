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
import { Edit, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Helpers from "@/config/helpers";
import stripeService from "@/services/stripe.service";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";

interface Plan {
  id: string;
  name: string;
  description: string;
  unitAmount: number;
  interval?: string;
  metadata: {
    credits?: number;
  }
  featured: boolean;
  features: string[];
  stripeProductId?: string;
  active: boolean;
  credits?: number;
}

const PlanTable = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      // Get plans from Stripe through our API
      const products = await stripeService.getProducts();
      setPlans(products);
      setIsLoading(false);
    } catch (error: any) {
      Helpers.showToast(error.message || "Failed to fetch plans", "error");
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (selectedPlan && selectedPlan.stripeProductId) {
      try {
        // Delete the product from Stripe
        await api.delete(`/stripe/products/${selectedPlan.stripeProductId}`);
        setPlans(plans.filter(plan => plan.id !== selectedPlan.id));
        setIsDeleteDialogOpen(false);
        Helpers.showToast("Plan deleted successfully!", "success");
      } catch (error: any) {
        Helpers.showToast(error.response?.data?.error || "Failed to delete plan", "error");
      }
    }
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      const updatedPlan = await stripeService.toggleProductStatus(planId);
      setPlans(plans.map(plan => plan.id === planId ? updatedPlan : plan));
      Helpers.showToast(`Plan ${updatedPlan.active ? 'activated' : 'deactivated'} successfully!`, "success");
    } catch (error: any) {
      Helpers.showToast(error.message || "Failed to toggle plan status", "error");
    }
  };

  // Map interval to display text
  const getBillingText = (interval?: string) => {
    if (!interval) return "One-time";
    switch (interval) {
      case "month": return "Monthly";
      case "year": return "Yearly";
      default: return interval.charAt(0).toUpperCase() + interval.slice(1);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
            Subscription Plans
          </CardTitle>
          <Button
            onClick={() => navigate('/admin/plans/add')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span className="ml-2 text-muted-foreground">Loading plans...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No plans found. Create your first plan!
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                      <TableCell>
                        {plan.unitAmount === 0 
                          ? "Free" 
                          : `$${plan.unitAmount/100}`}
                      </TableCell>
                      <TableCell>{getBillingText(plan.interval)}</TableCell>
                      <TableCell>{plan.metadata.credits || '-'}</TableCell>
                      <TableCell>
                        {plan.featured ? (
                          <Badge variant="outline" className="bg-primary/20 text-primary">
                            Featured
                          </Badge>
                        ) : (
                          "No"
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.active ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(plan.id)}
                            className={`h-8 w-8 border-border/50 ${plan.active ? 'text-green-600' : 'text-gray-500'}`}
                            title={plan.active ? "Deactivate plan" : "Activate plan"}
                          >
                            {plan.active ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/admin/plans/edit/${plan.id}`)}
                            className="h-8 w-8 border-border/50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                    
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{selectedPlan?.name}" plan. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlanTable;
