import axios, { InternalAxiosRequestConfig } from "axios";
import { SERVER_ENDPOINTS } from "./serverConstant";

const authSecuredApi = axios.create({
  baseURL: SERVER_ENDPOINTS.AUTH_BASEURL,
});

authSecuredApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    let token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const authPublicApi = axios.create({
  baseURL: SERVER_ENDPOINTS.AUTH_BASEURL,
});

const userSecuredApi = axios.create({
  baseURL: SERVER_ENDPOINTS.USER_BASEURL,
});

userSecuredApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    let token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { authSecuredApi, authPublicApi, userSecuredApi };
