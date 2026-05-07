import { AddContestPayload, ASSIGNJUDGEPAYLOAD } from "@/types/user";
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
      console.log(response);
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

  getAllParticipants: async (contestId: string) => {
  try {
    const response = await contestSecuredApi.get(
      `/${contestId}/participants/`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
  },

  getParticipantById: async (
  contestId: string,
  participantId: string,
  ) => {
  try {
    const response = await contestSecuredApi.get(
      `/${contestId}/participants/${participantId}`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
  },

  assignJudgeToContest: async (
  contestId: string,
  data: ASSIGNJUDGEPAYLOAD,
  ) => {
  try {
    const response = await contestSecuredApi.post(
      `/${contestId}/judges/`,
      data,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
  },

  getAllJudges: async (contestId: string) => {
  try {
    const response = await contestSecuredApi.get(
      `/${contestId}/judges/`,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
  },

};
