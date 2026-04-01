import {
  JUDGEPAYLOAD,
  LOGINRESPONSE,
  RegisterParticipantPayload,
  User,
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
};
