import { Button } from "@/components/ui/button";
import { Coins, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface CreditTrackerProps {
  credits: number  ;
  maxCredits?: number;
  compact?: boolean;
}

const CreditTracker = ({ credits, maxCredits, compact = false }: CreditTrackerProps) => {
  const navigate = useNavigate();
  const percentage = (credits / (maxCredits || 1000)) * 100;
  const isLow = percentage < 20;

  if (compact) {
    return (
      <div className="text-sm font-medium">
        <span className="font-bold text-orange-500">{credits}</span>/{maxCredits}
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-cente  gap-3 min-w-[10px]">
                <Coins className={`h-5 w-5 ${isLow ? 'text-destructive' : 'text-primary'}`} />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-md text-primary">
                      {credits}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {maxCredits}
                    </span>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex flex-col gap-1">
              <p className="font-medium">Credit Balance</p>
              <p className="text-xs text-muted-foreground">
                {credits} credits remaining
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isLow && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/products")}
            className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Upgrade</span>
          </Button>
        )}
      </div>
    );
  }
};

export default CreditTracker; 