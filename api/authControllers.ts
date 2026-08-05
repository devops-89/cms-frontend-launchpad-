import {
  FORGOTPASSWORDPAYLOAD,
  JUDGEPAYLOAD,
  LOGINRESPONSE,
  LOGOUTPAYLOAD,
  RegisterParticipantPayload,
  REGISTERPAYLOAD,
  RESETPASSWORDPAYLOAD
} from "@/types/user";
import { authPublicApi, authSecuredApi, userSecuredApi } from "./config";

export const AuthControllers = {
  login: async (data: LOGINRESPONSE) => {
    try {
      let result = await authPublicApi.post("login", data);
      return result;
    } catch (error) {
      throw error;
    }
  },

  registerParticipants: async (data: RegisterParticipantPayload) => {
    try {
      let result = await authSecuredApi.post("register-participant", data);
      return result;
    } catch (error) {
      throw error;
    }
  },
  addJudge: async (data: JUDGEPAYLOAD) => {
    try {
      let result = await authSecuredApi.post("register-judge", data);
      return result;
    } catch (error) {
      throw error;
    }
  },

  registerAdmin: async (data: REGISTERPAYLOAD) => {
  try {
    let result = await authPublicApi.post(
      "register",
      data,
    );

    return result;
  } catch (error) {
    throw error;
  }
  },

  logout: async (data: LOGOUTPAYLOAD | {} = {}) => {
  try {
    let result = await authSecuredApi.post(
      "logout",
      data,
    );

    return result;
  } catch (error) {
    throw error;
  }
},

forgotPassword: async (
  data: FORGOTPASSWORDPAYLOAD,
  ) => {
  try {
    let result = await authPublicApi.post(
      "forgot-password",
      data,
    );

    return result;
  } catch (error) {
    throw error;
  }
},

resetPassword: async (
  data: RESETPASSWORDPAYLOAD,
  ) => {
  try {
    let result = await authPublicApi.post(
      "reset-password",
      data,
    );

    return result;
  } catch (error) {
    throw error;
  }
},

refreshToken: async (data: LOGOUTPAYLOAD) => {
  try {
    let result = await authPublicApi.post(
      "refresh",
      data,
    );

    return result;
  } catch (error) {
    throw error;
  }
},

verifyOtp: async (data: Record<string, unknown>) => {
  try {
    let result =
      await authPublicApi.post(
        "verify-otp",
        data,
      );

    return result;
  } catch (error) {
    throw error;
  }
},

resendOtp: async (data: Record<string, unknown>) => {
  try {
    let result = await authPublicApi.post("resend-otp", data);
    return result;
  } catch (error) {
    throw error;
  }
},

getMe: async (token?: string) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    let result = await userSecuredApi.get("me", config);
    return result;
  } catch (error) {
    throw error;
  }
},

updateMe: async (id: string, data: FormData | Record<string, any>, token?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (data instanceof FormData) headers["Content-Type"] = "multipart/form-data";
    else headers["Content-Type"] = "application/json";

    let result = await userSecuredApi.put(`/${id}`, data, { headers });
    return result;
  } catch (error) {
    throw error;
  }
}
};
