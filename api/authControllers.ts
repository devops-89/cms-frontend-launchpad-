import {
  FORGOTPASSWORDPAYLOAD,
  JUDGEPAYLOAD,
  LOGINRESPONSE,
  LOGOUTPAYLOAD,
  RegisterParticipantPayload,
  REGISTERPAYLOAD,
  RESETPASSWORDPAYLOAD
} from "@/types/user";
import { authPublicApi, authSecuredApi } from "./config";

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

  logout: async (data: LOGOUTPAYLOAD) => {
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

verifyOtp: async (data: any) => {
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
};
