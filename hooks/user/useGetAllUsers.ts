import { useState, useEffect } from "react";
import { UserController } from "@/api/userControllers";
import { UserRole } from "@/utils/enum";
import { User } from "@/types/user";

export const useGetAllUsers = (role: UserRole) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await UserController.getAllUser(role);
      setUsers(result.data.data);
    } catch (err: any) {
      console.error("fetch users error", err);
      setError(
        err?.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  return { users, isLoading, error, refetch: fetchUsers };
};
