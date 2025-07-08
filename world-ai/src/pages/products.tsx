import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import stripeService from "@/services/stripe.service";
import useUserStore from "@/store/useUserStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import ChatHeader, { ChatHeaderRef } from "@/components/chat/chatHeader";
import { useChatHeader } from "@/pages/user/chat/chatLayout";
import Helpers from "@/config/helpers";
import authService from "@/services/auth.service";

interface Product {
  id: string;
  name: string;
  priceId: string;
  unitAmount: number;
  description: string;
  features: string[];
  featured: boolean;
  active: boolean;
}

interface Subscription {
  id: string;
  productId: string;
  planName: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancelAtPeriodEnd: boolean;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [subscribedProductId, setSubscribedProductId] = useState<string | null>(
    null
  );
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const { user, setUser } = useUserStore();
  const { headerRef } = useChatHeader() || { headerRef: null };
  const localHeaderRef = useRef<ChatHeaderRef>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data: Product[] = await stripeService.getProducts();
        // Filter to show only active products
        setProducts(data.filter((product) => product.active));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubscription = async () => {
      if (user?.stripeCustomerId) {
        try {
          const subscriptionData = await stripeService.getSubscription(
            user.stripeCustomerId
          );
          if (subscriptionData) {
            setSubscribedProductId(subscriptionData.productId);
            setSubscription(subscriptionData.subscriptions.data[0]);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        }
      }
    };

    fetchProducts();
    fetchSubscription();
  }, [user]);

  const handleCheckout = async (priceId: string, productId: string) => {
    try {
      setCheckoutLoading(productId);
      const { url } = await stripeService.createCheckoutSession(priceId);
      window.location.href = url;
      await fetchAndUpdateUser();
    } catch (error: any) {
      console.error("Error during checkout:", error);
      Helpers.showToast(error.message, "error");
      setCheckoutLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setCancelingSubscription(true);
      await stripeService.cancelSubscription(subscription.id);

      // Update local state to show cancellation status
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              cancelAtPeriodEnd: true,
            }
          : null
      );
      await fetchAndUpdateUser();
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setCancelingSubscription(false);
    }
  };

  const fetchAndUpdateUser = async () => {
    const updatedUser = await authService.getProfile();
    setUser(updatedUser.user || updatedUser);
  };

  function formatDate(timestamp: number) {
    // JavaScript timestamps are in milliseconds, so we might need to multiply by 1000
    const date = new Date(timestamp * 1000);

    // Get various date and time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    // Format the date and time as a string (you can customize this format)
    const formattedDate = `${year}-${month}-${day} `;

    return formattedDate;
  }

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-background overflow-hidden max-w-[100vw]">
      <ChatHeader
        ref={headerRef || localHeaderRef}
        onToggleSidebar={() => {}}
        variant="pricing"
      />
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          {subscription && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground/90">
                Your Subscription
              </h2>
              <Card className="justify-between bg-card shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{subscription.planName || "Current Plan"}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        subscription.status === "active"
                          ? "bg-green-100 text-green-800"
                          : subscription.status === "trialing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {subscription.cancelAtPeriodEnd
                      ? "Your subscription will end at the current billing period"
                      : "Your subscription will automatically renew"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current period
                      </p>
                      <p className="font-medium">
                        Start: {formatDate(subscription.current_period_start)} •
                        End: {formatDate(subscription.current_period_end)}
                      </p>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <AlertCircle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">
                            Subscription Cancellation Scheduled
                          </p>
                          <p className="text-sm text-amber-700">
                            Your subscription will end on{" "}
                            {formatDate(subscription.current_period_end)}.
                            You'll continue to have access until then.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {!subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                      onClick={handleCancelSubscription}
                      disabled={cancelingSubscription}
                    >
                      {cancelingSubscription ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        "Cancel Subscription"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Plan
          </h1>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading plans...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`${
                    product.featured
                      ? "border-2 border-primary shadow-lg shadow-primary/20"
                      : "border border-border"
                  } 
                  transition-transform duration-300 hover:scale-105 flex flex-col h-full`}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <div className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      ${product.unitAmount / 100}{" "}
                      <span className="text-sm text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <ul className="space-y-3 mt-auto">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6">
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleCheckout(product.priceId, product.id)
                      }
                      disabled={
                        !user ||
                        subscribedProductId === product.id ||
                        checkoutLoading === product.id
                      }
                    >
                      {checkoutLoading === product.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : subscribedProductId === product.id ? (
                        "Current Plan"
                      ) : user ? (
                        "Get Started"
                      ) : (
                        "Sign Up to Subscribe"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
