import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import stripeService, { type Transaction } from "@/services/stripe.service";
import { Card } from "@/components/ui/card";

const Transaction = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await stripeService.getTransactions();
        setTransactions(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Format date from UNIX timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Format amount from cents to dollars
  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase() || 'USD',
    });
    return formatter.format(amount / 100);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No transactions found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Refunded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                  <TableCell>{formatDate(transaction.created)}</TableCell>
                  <TableCell>{formatAmount(transaction.amount, transaction.currency)}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                 < TableCell>{transaction.billing_details.email || '-'}</TableCell>
                  <TableCell>{transaction.payment_method || '-'}</TableCell>
                  <TableCell>
                    {transaction.receipt_url ? (
                      <a 
                        href={transaction.receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Receipt
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {transaction.refunded ? (
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        Refunded
                      </span>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default Transaction;
