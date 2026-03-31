import { AddContestPayload } from "@/types/user";
import { contestSecuredApi } from "./config";

export const contestControllers = {
  addContest: async (data: AddContestPayload) => {
    try {
      const response = await contestSecuredApi.post("/", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getContest: async () => {
    try {
      const response = await contestSecuredApi.get("/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getContestDetails: async (id: string | undefined) => {
    try {
      const response = await contestSecuredApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateContest: async (id: string, data: AddContestPayload) => {
    try {
      const response = await contestSecuredApi.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addUserInContest: async (data: any, id: string) => {
    try {
      const response = await contestSecuredApi.post(
        `/${id}/participants`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateStatus: async (data: { status: string }, id: string) => {
    try {
      const response = await contestSecuredApi.patch(`/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateParticipantDetails: async (
    data: any,
    contestId: string,
    participantId: string,
  ) => {
    try {
      const response = await contestSecuredApi.patch(
        `/${contestId}/participants/${participantId}`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
