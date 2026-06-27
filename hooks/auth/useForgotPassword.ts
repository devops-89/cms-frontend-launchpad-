import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthControllers } from '@/api/authControllers';
import { useSnackbar } from '@/context/SnackbarContext';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const forgotPassword = async (values: { email: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthControllers.forgotPassword(values);
      showSnackbar(res?.data?.message || "OTP sent successfully!", "success");
      
      router.push(`/verify-otp?flow=forgot&email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return { forgotPassword, isLoading, error };
};
