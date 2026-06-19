import { userPublicApi, userSecuredApi } from "./config";

export const CountryController = {
  getAllCountries: async () => {
    try {
      let result = await userPublicApi.get("countries");
      return result.data;
    } catch (error) {
      throw error;
    }
  },
  
  getCountryById: async (id: number) => {
    try {
      let result = await userPublicApi.get(`countries/${id}`);
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  createCountry: async (data: any) => {
    try {
      let result = await userSecuredApi.post("countries", data);
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  updateCountry: async (id: number, data: any) => {
    try {
      let result = await userSecuredApi.put(`countries/${id}`, data);
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCountry: async (id: number) => {
    try {
      let result = await userSecuredApi.delete(`countries/${id}`);
      return result.data;
    } catch (error) {
      throw error;
    }
  },
};
