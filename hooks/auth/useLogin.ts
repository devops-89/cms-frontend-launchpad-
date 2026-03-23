import { useState } from "react";
import { AuthControllers } from "@/api/authControllers";
import { LOGINRESPONSE } from "@/types/user";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (data: LOGINRESPONSE) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthControllers.login(data);
      console.log("login result", result);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("login error", err);
      setError(
        err?.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
