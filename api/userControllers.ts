import { UserRole } from "@/utils/enum";
import { userSecuredApi } from "./config";

export const UserController = {
  getAllUser: async (role: UserRole, page: number = 1, limit: number = 10, search?: string) => {
    try {
      let url = `all?role=${role}&page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      let result = await userSecuredApi.get(url);
      return result;
    } catch (error){
      throw error;
    }
  },
updateUserStatus: async (
  id: string,
  status: string,
  contestId?: string
  ) => {
  try {
    let result = await userSecuredApi.patch(
      "update-status",
      {
        id,
        status,
        ...(contestId && { contestId })
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
  getAllJudges: async (search?: string) => {
    try {
      let url = `all?role=judge`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const result = await userSecuredApi.get(url);
      return result;
    } catch (error) {
      throw error;
    }
  },
  editJudge: async (id: string, data: any) => {
    try {
      const result = await userSecuredApi.put(`/${id}`, data);
      return result;
    } catch (error) {
      throw error;
    }
  },
};
