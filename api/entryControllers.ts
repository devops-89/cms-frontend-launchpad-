import { contestSecuredApi, entrySecuredApi } from "./config";

export const entryControllers = {
  createEntry: async (
    contestId: string,
    data: any,
  ) => {
    try {
      const response = await contestSecuredApi.post(
        `/${contestId}/entries`,
        data,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllEntries: async (
    contestId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ) => {
    try {
      let url = `/${contestId}/entries?page=${page}&limit=${limit}`;
      if (status && status !== "all" && status !== "All") {
        url += `&status=${status.toLowerCase()}`;
      }
      const response = await contestSecuredApi.get(url);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEntryById: async (
    contestId: string,
    entryId: string,
  ) => {
    try {
      const response = await contestSecuredApi.get(
        `/${contestId}/entries/${entryId}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEntrySubmission: async (
    contestId: string,
    entryId: string,
    data: any,
  ) => {
    try {
      const response = await contestSecuredApi.patch(
        `/${contestId}/entries/${entryId}`,
        data,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEntryStatus: async (
    contestId: string,
    data: { entryIds: string[]; status: string; reason?: string },
  ) => {
    try {
      const response = await contestSecuredApi.patch(
        `/${contestId}/entries/bulk-status`,
        data,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteEntry: async (
    contestId: string,
    entryId: string,
  ) => {
    try {
      const response = await contestSecuredApi.delete(
        `/${contestId}/entries/${entryId}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};