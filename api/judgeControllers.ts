import { judgeSecuredApi } from "./config";
import { FORM_CONTROLLERS } from "./formControllers";

export const judgeControllers = {
  getAssignedEntries: async (page: number = 1, limit: number = 10) => {
    try {
      const response = await judgeSecuredApi.get(`judges/my/entries?page=${page}&limit=${limit}`);
      const entries = response.data?.data?.docs || [];
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEntryDetails: async (assignmentId: string) => {
    try {
      const response = await judgeSecuredApi.get(`judges/my/entries/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },



  getEvaluation: async (entryId: string) => {
    try {
      const response = await judgeSecuredApi.get(`judges/my/entries/${entryId}/evaluation`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEvaluation: async (entryId: string, evaluationData: any) => {
    try {
      const response = await judgeSecuredApi.put(`judges/my/entries/${entryId}/evaluation`, evaluationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  evaluateEntry: async (entryId: string, evaluationData: any) => {
    try {
      const response = await judgeSecuredApi.post(`judges/my/entries/${entryId}/evaluate`, evaluationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
