import { useState } from "react";
import { AuthControllers } from "@/api/authControllers";
import { RegisterParticipantPayload } from "@/types/user";

export const useRegisterParticipant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterParticipantPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AuthControllers.registerParticipants(data as any);
      console.log("registration result", result);
      return result;
    } catch (err: any) {
      console.error("registration error", err);
      const errorMessage = err?.response?.data?.message || err.message || "Something went wrong";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};
