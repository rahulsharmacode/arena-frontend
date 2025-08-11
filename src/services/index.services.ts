
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
// import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { endpoint } from "./api.services";

const baseURL = import.meta.env.VITE_API;
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: import.meta.env.VITE_API_REQUEST_TIMEOUT,
});


let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      const refresh = Cookies.get("refresh");

      if (!refresh) {
        // Optional logout logic
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await fetch(baseURL + endpoint["auth"]["refresh"], {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Refresh failed: ${errorData}`);
        }

        const { access } = await response.json();

        if (!access) throw new Error("No access token received");

        Cookies.set("access", access);

        processQueue(null, access);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        // Optionally clear auth and redirect
        Cookies.remove("access");
        Cookies.remove("refresh");
        // window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    if (error?.response?.status === 500) {
      return toast.error("Internal Server Error");
    }

    if (axios.isCancel(error)) {
      console.log("Request canceled", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { baseURL };

