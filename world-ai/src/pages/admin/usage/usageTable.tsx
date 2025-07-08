//@ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UsageData {
  id: string;
  user: {
    email: string;
  };
  totalUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    toolCalls: number;
  };
  individualUsages: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    toolCalls: number;
  };
  createdAt: string;
}

const UsageTable: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsageData | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await api.get('/usage');
        setUsageData(response.data);
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Usage Statistics</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Prompt Tokens</TableHead>
              <TableHead className="text-right">Completion Tokens</TableHead>
              <TableHead className="text-right">Total Tokens</TableHead>
              <TableHead className="text-right">Tool Calls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-6">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              usageData.map((row) => (
                <TableRow 
                  key={row.id} 
                  onClick={() => setSelectedUser(row)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>{row.user.email}</TableCell>
                  <TableCell className="text-right">{row.totalUsage.promptTokens}</TableCell>
                  <TableCell className="text-right">{row.totalUsage.completionTokens}</TableCell>
                  <TableCell className="text-right">{row.totalUsage.totalTokens}</TableCell>
                  <TableCell className="text-right">{row.totalUsage.toolCalls}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for individual usages */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Individual Usages for {selectedUser?.user.email}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Prompt Tokens</TableHead>
                  <TableHead className="text-right">Completion Tokens</TableHead>
                  <TableHead className="text-right">Total Tokens</TableHead>
                  <TableHead className="text-right">Tool Calls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedUser?.individualUsages?.map((usage: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(usage.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{usage.promptTokens}</TableCell>
                    <TableCell className="text-right">{usage.completionTokens}</TableCell>
                    <TableCell className="text-right">{usage.totalTokens}</TableCell>
                    <TableCell className="text-right">{usage.toolCalls}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsageTable;
