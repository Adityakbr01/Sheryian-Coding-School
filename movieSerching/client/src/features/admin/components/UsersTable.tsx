import { HiTrash, HiBan, HiCheck } from "react-icons/hi";
import type { User } from "@/types";

type UserWithBan = User & { isBanned?: boolean };

interface UsersTableProps {
  users: UserWithBan[];
  onBan: (id: string, isBanned: boolean) => void;
  onDelete: (id: string) => void;
}

export default function UsersTable({
  users,
  onBan,
  onDelete,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">No users found.</p>
    );
  }

  return (
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
              <td className="py-3 px-4 text-sm text-foreground">{user.name}</td>
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
                        onClick={() => onBan(user._id, !!user.isBanned)}
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
                        onClick={() => onDelete(user._id)}
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
  );
}
