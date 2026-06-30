import axios, { InternalAxiosRequestConfig, AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { SERVER_ENDPOINTS } from "./serverConstant";

const authSecuredApi = axios.create({
  baseURL: SERVER_ENDPOINTS.AUTH_BASEURL,
});

authSecuredApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
  (config: InternalAxiosRequestConfig) => {
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
  (config: InternalAxiosRequestConfig) => {
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
  (config: InternalAxiosRequestConfig) => {
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
  (config: InternalAxiosRequestConfig) => {
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
  (config: InternalAxiosRequestConfig) => {
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

let isRefreshing = false;

interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: AxiosError | Error) => void;
}

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: AxiosError | Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setupResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      if (!originalRequest) return Promise.reject(error);

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string | null>(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token) {
                originalRequest.headers["Authorization"] = "Bearer " + token;
              }
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const isJudgePanel = window.location?.pathname?.startsWith('/judge-panel');
          const refreshToken = isJudgePanel
            ? localStorage.getItem("judge_refresh_token")
            : localStorage.getItem("refresh_token");

          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const result = await authPublicApi.post("refresh", { refreshToken });
          
          const newAccessToken = result.data.data.accessToken;
          const newRefreshToken = result.data.data.refreshToken;

          if (isJudgePanel) {
            localStorage.setItem("judge_access_token", newAccessToken);
            if (newRefreshToken) localStorage.setItem("judge_refresh_token", newRefreshToken);
          } else {
            localStorage.setItem("token", newAccessToken);
            if (newRefreshToken) localStorage.setItem("refresh_token", newRefreshToken);
          }

          instance.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken;
          originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

          processQueue(null, newAccessToken);
          return instance(originalRequest);
        } catch (refreshError) {
          const typedError = refreshError as AxiosError | Error;
          processQueue(typedError, null);
          const isJudgePanel = window.location?.pathname?.startsWith('/judge-panel');
          if (isJudgePanel) {
            localStorage.removeItem("judge_access_token");
            localStorage.removeItem("judge_refresh_token");
            localStorage.removeItem("judge_user");
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
          }
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          return Promise.reject(typedError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
};

setupResponseInterceptor(authSecuredApi);
setupResponseInterceptor(userSecuredApi);
setupResponseInterceptor(formSecuredApi);
setupResponseInterceptor(contestSecuredApi);
setupResponseInterceptor(entrySecuredApi);
setupResponseInterceptor(judgeSecuredApi);
