import { formSecuredApi } from "./config";

export const FORM_CONTROLLERS = {
  createForm: async (data: any) => {
    try {
      let result = await formSecuredApi.post("templates", data);
      return result;
    } catch (error) {
      throw error;
    }
  },
  getAllTemplates: async () => {
    try {
      let result = await formSecuredApi.get("templates");
      return result;
    } catch (error) {
      throw error;
    }
  },
  getTemplateById: async (id: string) => {
    try {
      let result = await formSecuredApi.get(`templates/${id}`);
      return result;
    } catch (error) {
      throw error;
    }
  },
  deleteTemplate: async (id: string) => {
    try {
      let result = await formSecuredApi.delete(`templates/${id}`);
      return result;
    } catch (error) {
      throw error;
    }
  },
  editTemplate: async (id: string, data: any) => {
    try {
      let result = await formSecuredApi.put(`templates/${id}`, data);
      return result;
    } catch (error) {
      throw error;
    }
  },
};
