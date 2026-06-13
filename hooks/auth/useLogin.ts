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
      const token = result.data.data.accessToken;
      const user = result.data.data.user;

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role === "judge") {
          localStorage.setItem("judge_access_token", token);
          router.push("/judge-panel/dashboard");
        } else {
          localStorage.setItem("token", token);
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
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
