import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiTrash, HiBan, HiCheck } from "react-icons/hi";
import { adminService } from "@/services/adminService";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import type { User } from "@/types";

export default function AdminUsers() {
  const [users, setUsers] = useState<(User & { isBanned?: boolean })[]>([]);
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
        <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
                Name
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
                Email
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
                Role
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
                Status
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-foreground">
                  {user.name}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      user.role === "admin"
                        ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      user.isBanned
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-green-500/15 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {user.isBanned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {user.role !== "admin" && (
                      <>
                        <button
                          onClick={() => handleBan(user._id, !!user.isBanned)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            user.isBanned
                              ? "bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25"
                              : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/25"
                          }`}
                          title={user.isBanned ? "Unban" : "Ban"}
                        >
                          {user.isBanned ? (
                            <HiCheck size={16} />
                          ) : (
                            <HiBan size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1.5 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <HiTrash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No users found.
        </p>
      )}
    </div>
  );
}
