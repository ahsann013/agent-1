//@ts-nocheck
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import Card components
import { CheckCircle, CreditCard, Package, Coins, AlertTriangle, Loader2 } from "lucide-react"; // Add more icons
import { useEffect, useState } from "react";
import api from "@/services/api"; // Assuming 'api' is your configured Axios instance or similar

// Define an interface for the expected payment details structure based on your usage
interface ProductDetails {
    name: string;
    description: string;
    metadata: {
        credits: string | number; // Can be string or number
    };
}

interface InvoiceDetails {
    number: string;
    amount_paid: number; // Assuming amount is in cents
    currency: string; // Assuming currency is available, e.g., 'usd'
}

interface PaymentDetails {
    product: ProductDetails;
    invoice: InvoiceDetails;
    // Add other fields if available and needed
}


const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");

    // State for loading, error, and payment details
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Start in loading state
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError("No session ID provided.");
            setLoading(false);
            return; // Exit if no session ID
        }

        setLoading(true); // Set loading true when starting fetch
        setError(null); // Reset error state

        api.get(`/stripe/success?session_id=${sessionId}`)
            .then(response => {
                // **Important**: Check the actual structure of response.data
                // If the structure is { message: "...", paymentDetails: {...} } like the image, use response.data.paymentDetails
                // If the structure is directly the payment details object, use response.data
                // Based on your original code `response.data.paymentDetails`, let's assume it's nested.
                // If your API returns the object directly, change this to: setPaymentDetails(response.data);
                if(response){
                setPaymentDetails(response.data);
                } else {
                     setError("Received unexpected data format from server.");
                }
            })
            .catch(err => {
                console.error('Error fetching payment details:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch payment details.');
            })
            .finally(() => {
                setLoading(false); // Stop loading regardless of success or error
            });

    }, [sessionId]); // Dependency array includes sessionId

    // Helper function to format currency
    const formatCurrency = (amount: number, currencyCode: string = 'usd') => {
        // Assuming amount is in the smallest unit (e.g., cents)
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode.toUpperCase(), // Ensure currency code is uppercase
        }).format(amount / 100); // Divide by 100
    };


    // === Render Loading State ===
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
                <p className="text-lg text-muted-foreground">Loading payment details...</p>
            </div>
        );
    }

    // === Render Error State ===
    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-md text-center">
                 <div className="flex flex-col items-center space-y-4 p-6 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                    <AlertTriangle className="w-12 h-12 mx-auto text-red-500 dark:text-red-400" />
                    <h1 className="text-2xl font-bold text-red-800 dark:text-red-200">Payment Details Error</h1>
                    <p className="text-red-700 dark:text-red-300">
                        {error}
                    </p>
                    <Button variant="outline" onClick={() => navigate("/chat/new")} className="mt-4">
                         Go Back
                     </Button>
                 </div>
            </div>
        );
    }

    // === Render Success State ===
    // Use default values or handle cases where details might be partially missing
    const productName = paymentDetails?.product?.name ?? "Purchased Item";
    const creditsAdded = paymentDetails?.creditsAdded ?? "N/A";
    const invoiceNumber = paymentDetails?.invoice?.number ?? "N/A";
    const amountPaid = (paymentDetails?.paymentDetails?.data[0].price.unit_amount);
    const currencyCode = paymentDetails?.invoice?.currency ?? "usd"; // Default to USD if not provided
    const formattedAmount = amountPaid !== undefined ? formatCurrency(amountPaid, currencyCode) : "N/A";


    return (
        <div className="container mx-auto px-4 py-8 flex justify-center items-start min-h-screen pt-10">
            <Card className="w-full max-w-lg shadow-lg"> {/* Use Card component */}
                 <CardHeader className="bg-green-50 dark:bg-green-900/30 p-6 rounded-t-lg">
                    <div className="flex items-center space-x-3">
                         <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                         <div>
                            <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">Payment Successful!</CardTitle>
                            <CardDescription className="text-green-700 dark:text-green-300">
                                Thank you! Your transaction has been completed.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                    {/* Credits Added Section */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-2">
                            <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-800 dark:text-blue-200">Credits Added:</span>
                        </div>
                        <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{creditsAdded}</span>
                    </div>

                    {/* Purchase Details Section */}
                     <div className="border-t pt-4 space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Purchase Summary</h3>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-muted-foreground">
                                <Package className="h-4 w-4 mr-2" /> Item:
                            </span>
                            <span className="font-medium text-right">{productName}</span>
                        </div>
                         {/* You can add product description if needed and available */}
                         {/* <p className="text-sm text-muted-foreground pl-6">{paymentDetails?.product?.description}</p> */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-muted-foreground">
                                <CreditCard className="h-4 w-4 mr-2" /> Amount Paid:
                            </span>
                            <span className="font-medium">{formattedAmount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 text-muted-foreground">
                             <span>Invoice Number:</span>
                             <span className="font-mono">{invoiceNumber}</span>
                         </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end rounded-b-lg border-t">
                     {/* Keep your navigation button here */}
                    <Button onClick={() => navigate("/chat/new")}>
                        Return to Chat
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentSuccessPage;