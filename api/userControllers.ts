import { UserRole } from "@/utils/enum";
import { userSecuredApi } from "./config";

export const UserController = {
  getAllUser: async (role: UserRole) => {
    try {
      let result = await userSecuredApi.get(`all?role=${role}`);
      return result;
    } catch (error){
      throw error;
    }
  },
updateUserStatus: async (
  id: string,
  status: string,
  ) => {
  try {
    let result = await userSecuredApi.patch(
      "update-status",
      {
        id,
        status,
      },
    );

    return result;
  } catch (error) {
    throw error;
  }
},

  getUserById: async (id: string) => {
  try {
    let result = await userSecuredApi.get(`/${id}`);
    return result;
  } catch (error) {
    throw error;
  }
  },

  deleteUserById: async (id: string) => {
  try {
    let result = await userSecuredApi.delete(`/${id}`);
    return result;
  } catch (error) {
    throw error;
  }
  },
};
