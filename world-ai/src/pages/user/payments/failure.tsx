import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailurePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md text-center">
      <div className="space-y-4">
        <XCircle className="w-16 h-16 mx-auto text-red-500" />
        <h1 className="text-3xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground">
          We're sorry, but your payment could not be processed. Please try again.
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <Button variant="outline" onClick={() => navigate("/upgrade")}>
            Try Again
          </Button>
          <Button onClick={() => navigate("/chat")}>Return to Chat</Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
