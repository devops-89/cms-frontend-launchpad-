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

const formSecuredApi = axios.create({
  baseURL: SERVER_ENDPOINTS.FORM_BASEURL,
});

formSecuredApi.interceptors.request.use(
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

const contestSecuredApi = axios.create({
  baseURL: SERVER_ENDPOINTS.CONTEST_BASEURL,
});

contestSecuredApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    let token = localStorage.getItem("token") || localStorage.getItem("judge_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const entrySecuredApi = axios.create({
  baseURL: SERVER_ENDPOINTS.ENTRY_BASEURL,
});

entrySecuredApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    let token = localStorage.getItem("token") || localStorage.getItem("judge_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const judgeSecuredApi = axios.create({
  baseURL: SERVER_ENDPOINTS.CONTEST_BASEURL,
});

judgeSecuredApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    let token = localStorage.getItem("judge_access_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const userPublicApi = axios.create({
  baseURL: SERVER_ENDPOINTS.USER_BASEURL,
});

export {
  authPublicApi, authSecuredApi, contestSecuredApi,
  entrySecuredApi, formSecuredApi, judgeSecuredApi, userSecuredApi,
  userPublicApi
};
