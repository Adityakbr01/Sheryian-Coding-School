import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { adminService } from "@/services/adminService";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import type { User } from "@/types";
import UsersTable from "../components/UsersTable";

type UserWithBan = User & { isBanned?: boolean };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithBan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllUsers();
      const list = Array.isArray(data)
        ? data
        : ((data as any)?.users ?? (data as any)?.data ?? []);
      setUsers(list);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBan = async (id: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await adminService.unbanUser(id);
        toast.success("User unbanned");
      } else {
        await adminService.banUser(id);
        toast.success("User banned");
      }
      fetchUsers();
    } catch {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User deleted");
      setUsers(users.filter((u) => u._id !== id));
    } catch {
      toast.error("Failed to delete user");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin"
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <HiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </p>
        </div>
      </div>

      <UsersTable users={users} onBan={handleBan} onDelete={handleDelete} />
    </div>
  );
}
