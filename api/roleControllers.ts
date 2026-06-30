import { userSecuredApi } from "./config";

export const roleControllers = {
  getAllRoles: async () => {
    try {
      const response = await userSecuredApi.get(`/roles`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createRole: async (data: { name: string }) => {
    try {
      const response = await userSecuredApi.post(`/roles`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteRole: async (id: string) => {
    try {
      const response = await userSecuredApi.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
