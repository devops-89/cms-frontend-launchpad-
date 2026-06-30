import { userSecuredApi } from "./config";

export const permissionControllers = {
  getAllPermissions: async () => {
    try {
      const response = await userSecuredApi.get(`/permissions/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPermission: async (data: any) => {
    try {
      const response = await userSecuredApi.post(`/permissions/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createBulkPermissions: async (data: any[]) => {
    try {
      const response = await userSecuredApi.post(`/permissions/bulk`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateBulkPermissions: async (data: any[]) => {
    try {
      const response = await userSecuredApi.put(`/permissions/bulk`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePermission: async (id: number, data: any) => {
    try {
      const response = await userSecuredApi.put(`/permissions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
