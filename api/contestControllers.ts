import { AddContestPayload, ASSIGNJUDGEPAYLOAD, VotingPeriodPayload } from "@/types/user";
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

  deleteParticipant: async (contestId: string, participantId: string) => {
    try {
      const response = await contestSecuredApi.delete(
        `/${contestId}/participants/${participantId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllParticipants: async (
    contestId: string,
    page: number = 1,
    limit: number = 10,
  ) => {
  try {
    const response = await contestSecuredApi.get(
      `/${contestId}/participants?page=${page}&limit=${limit}`,
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
  updateJudgeAssignments: async (
    contestId: string,
    data: ASSIGNJUDGEPAYLOAD,
  ) => {
    try {
      const response = await contestSecuredApi.patch(
        `/${contestId}/judges/assignments`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAssignedJudges: async (contestId: string) => {
    try {
      const response = await contestSecuredApi.get(
        `/${contestId}/judges/`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addVotingPeriod: async (
    contestId: string,
    data: VotingPeriodPayload,
  ) => {
    try {
      const response = await contestSecuredApi.post(
        `/${contestId}/voting-period`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllVotingPeriods: async (contestId: string) => {
    try {
      const response = await contestSecuredApi.get(`/${contestId}/voting-period`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateVotingPeriod: async (
    votingPeriodId: string,
    data: VotingPeriodPayload
  ) => {
    try {
      const response = await contestSecuredApi.put(
        `/voting-period/${votingPeriodId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteJudgeAssignments: async (contestId: string, judgeId: string) => {
    try {
      const response = await contestSecuredApi.delete(
        `/${contestId}/judges/assignee-entities/${judgeId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
