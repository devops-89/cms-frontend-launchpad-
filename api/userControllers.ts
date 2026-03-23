import { UserRole } from "@/utils/enum";
import { userSecuredApi } from "./config";

export const UserController = {
  getAllUser: async (role: UserRole) => {
    try {
      let result = await userSecuredApi.get(`all?role=${role}`);
      return result;
    } catch (error) {
      throw error;
    }
  },
};
