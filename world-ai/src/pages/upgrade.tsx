import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import stripeService from "@/services/stripe.service";
import useUserStore from "@/store/useUserStore";
import { useNavigate } from "react-router-dom";

const UpgradePage = () => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) {
      return navigate('/login');
    }

    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await stripeService.createCustomerWithBalance(
        user.email,
        user.name,
        amount
      );
      alert('Upgrade successful!');
      navigate('/chat/new');
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-8">Upgrade Your Account</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="0"
            step="0.01"
            placeholder="Enter amount"
          />
        </div>
        <Button
          className="w-full"
          onClick={handleUpgrade}
          disabled={loading || !user}
        >
          {loading ? 'Processing...' : 'Upgrade Now'}
        </Button>
        {!user && (
          <p className="text-sm text-muted-foreground">
            Please sign in to upgrade your account
          </p>
        )}
      </div>
    </div>
  );
};

export default UpgradePage; 