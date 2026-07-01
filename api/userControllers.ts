import { UserRole } from "@/utils/enum";
import { userSecuredApi } from "./config";

export const UserController = {
  getAllUser: async (role: UserRole, page: number = 1, limit: number = 10, search?: string, status?: string) => {
    try {
      let url = `all?role=${role}&page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (status && status !== "All") {
        url += `&status=${encodeURIComponent(status)}`;
      }
      let result = await userSecuredApi.get(url);
      return result;
    } catch (error) {
      throw error;
    }
  },
  getPublicUsers: async (page: number = 1, limit: number = 10, search?: string, status?: string) => {
    try {
      let url = `all?role=public&page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (status && status !== "All") {
        url += `&status=${encodeURIComponent(status)}`;
      }
      let result = await userSecuredApi.get(url);
      return result;
    } catch (error) {
      throw error;
    }
  },
  getPendingUsers: async (page: number = 1, limit: number = 10, search?: string) => {
    try {
      let url = `all?status=Pending&page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      let result = await userSecuredApi.get(url);
      return result;
    } catch (error) {
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
  getAllJudges: async (search?: string, status?: string) => {
    try {
      let url = `all?role=judge`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (status && status !== "All") {
        url += `&status=${encodeURIComponent(status)}`;
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
  createAdminUser: async (roleId: string, data: any) => {
    try {
      const result = await userSecuredApi.post(`/create-by-role/${roleId}`, data);
      return result;
    } catch (error) {
      throw error;
    }
  },
  editAdminUser: async (id: string, data: any) => {
    try {
      const result = await userSecuredApi.put(`/update-role-user/${id}`, data);
      return result;
    } catch (error) {
      throw error;
    }
  },
  getAdminUsers: async (page: number = 1, limit: number = 10, search?: string, status?: string) => {
    try {
      let url = `all?roleUsers=true&page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (status && status !== "All") {
        url += `&status=${encodeURIComponent(status)}`;
      }
      const result = await userSecuredApi.get(url);
      return result;
    } catch (error) {
      throw error;
    }
  },
  exportUsers: async () => {
    try {
      const result = await userSecuredApi.get('/export?role=participant');
      return result;
    } catch (error) {
      throw error;
    }
  }
};
