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
import { Plus, RotateCwIcon, Trash2 } from "lucide-react";
import DeleteUserModal from "./deleteUserModal";
import { User } from "@/types/types";
import Helpers from "@/config/helpers";
import api from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10; // Number of users per page

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset to first page when query changes
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    fetchUsers(debouncedQuery, page);
  }, [debouncedQuery, page]);

  const fetchUsers = async (searchQuery = "", pageNumber = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get("/users", {
        params: {
          query: searchQuery,
          page: pageNumber - 1,
          limit: PAGE_SIZE,
        },
      });

      // Assuming your API returns paginated results like:
      // { data: User[], totalCount: number }

      setUsers(response.data.data);
      // Calculate total pages
      const totalCount = response.data.total ?? 0;
      setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
    } catch (error: any) {
      Helpers.showToast(
        error.response?.data?.message || "Failed to fetch users",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await api.put(`/users/delete/${selectedUser.id}`);
        // After deletion, refetch current page
        fetchUsers(debouncedQuery, page);
        setIsDeleteModalOpen(false);
        Helpers.showToast("User deleted successfully!", "success");
      } catch (error: any) {
        Helpers.showToast(
          error.response?.data?.message || "Failed to delete user",
          "error"
        );
      }
    }
  };
  
  const handleRestore = async () => {
    if (selectedUser) {
      try {
        await api.put(`/users/restore/${selectedUser.id}`);
        // After deletion, refetch current page
        fetchUsers(debouncedQuery, page);
        setIsDeleteModalOpen(false);
        Helpers.showToast("User restored successfully!", "success");
      } catch (error: any) {
        Helpers.showToast(
          error.response?.data?.message || "Failed to restore user",
          "error"
        );
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
            Users
          </h2>
          <Button
            onClick={() => navigate("/admin/add-user")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-border/50 rounded px-3 py-2"
          />
        </div>

        {/* User Table */}
        <div className="border border-border/50 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="ml-2 text-muted-foreground">
                        Loading users...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500 text-white"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-500 text-white"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.credits}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                      {user.isActive ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="h-8 w-8 border-border/50 hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            setSelectedUser(user);
                            await handleRestore();
                          }}
                          className="h-8 w-8 border-border/50 hover:border-destructive hover:text-destructive"
                        >
                          <RotateCwIcon className="w-4 h-4" />
                        </Button>
                      )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>

          <span>
            Page {page} of {totalPages}
          </span>

          <Button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        username={selectedUser?.username || ""}
      />
    </div>
  );
};

export default UserTable;
