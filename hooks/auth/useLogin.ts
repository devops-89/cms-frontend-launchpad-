import { useState } from "react";
import { AuthControllers } from "@/api/authControllers";
import { LOGINRESPONSE } from "@/types/user";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/context/SnackbarContext";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const login = async (data: LOGINRESPONSE) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthControllers.login(data);
      console.log("login result", result);
      const token = result.data.data.accessToken;
      const user = result.data.data.user;

      if (user) {
        if (user.role === "participant") {
          throw new Error("Access denied: Participants cannot log into the admin panel.");
        }
        showSnackbar("Login successful!", "success");
        if (user.role === "judge") {
          localStorage.setItem("judge_user", JSON.stringify(user));
          localStorage.setItem("judge_access_token", token);
          router.push("/judge-panel/dashboard");
        } else {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token);
          router.push("/dashboard");
        }
      } else {
        showSnackbar("Login successful!", "success");
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("login error", err);
      let errorMessage = err?.response?.data?.message || err.message || "Something went wrong";
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
