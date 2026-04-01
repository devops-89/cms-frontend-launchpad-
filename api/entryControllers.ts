import { entrySecuredApi } from "./config";

export const entryControllers = {
  addEntry: async (data: any, contestId: string) => {
    try {
      const response = await entrySecuredApi.post(`/${contestId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getEntries: async (contestId: string) => {
    try {
      const response = await entrySecuredApi.get(`/${contestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
