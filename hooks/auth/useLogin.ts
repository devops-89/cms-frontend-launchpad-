import { useState } from "react";
import { AuthControllers } from "@/api/authControllers";
import { LOGINRESPONSE } from "@/types/user";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/context/SnackbarContext";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/context/PermissionContext";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { forceRefresh } = usePermissions();

  const login = async (data: LOGINRESPONSE) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthControllers.login(data);
      console.log("login result", result);
      const token = result.data.data.accessToken;
      const refreshToken = result.data.data.refreshToken || "";
      const user = result.data.data.user;

      if (user) {
        if (user.role === "participant") {
          throw new Error("Access denied: Participants cannot log into the admin panel.");
        }
        queryClient.clear();
        showSnackbar("Login successful!", "success");
        if (user.role === "judge") {
          sessionStorage.setItem("judge_user", JSON.stringify(user));
          sessionStorage.setItem("judge_access_token", token);
          sessionStorage.setItem("judge_refresh_token", refreshToken);
          forceRefresh();
          router.push("/judge-panel/dashboard");
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("refresh_token", refreshToken);
          forceRefresh();
          router.push("/dashboard");
        }
      } else {
        queryClient.clear();
        showSnackbar("Login successful!", "success");
        forceRefresh();
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("login error", err);
      const error = err as any;
      let errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
      if (errorMessage.toLowerCase().includes("validation error")) {
        errorMessage = "Invalid email or password";
      }
      if (errorMessage.toLowerCase().includes("access denied")) {
        showSnackbar(errorMessage, "error");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
