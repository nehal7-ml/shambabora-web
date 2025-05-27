import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { store } from "../store/store";
import { DataBaseUrl } from "../constants/base-url";


const axios = Axios.create({})
// Defining Axios defaults
axios.defaults.baseURL = DataBaseUrl;
axios.defaults.headers.post["Content-Type"] = "application/json";

// const state = store.getState();
// const accessToken = state.user.accessToken;

// Intercepting requests to add the Authorization header
axios.interceptors.request.use(
  (config: any) => {
    const state = store.getState();
    const accessToken = state.user.accessToken;
    console.log(accessToken);

    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Function to set Authorization header
const setAuthorization = (accessToken: string) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

// Intercepting to capture errors and handle token refresh
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      toast.warning("Session timed out, please login and try again", { autoClose: 2000 });
      localStorage.clear();
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

class APIClient {

  get = async <T>(url: string, params?: Record<string, any>): Promise<{ limit?: number, total?: number } & any & T> => {
    const queryString = params
      ? Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&")
      : "";
    const queryUrl = `${url}${queryString ? `?${queryString}` : ""}`
    const resp = await axios.get(queryUrl);

    if (!resp.data.limit) return resp.data
    else {
      const newUrl = new URL(queryUrl);
      newUrl.searchParams.set("$limit", resp.data.total.toString());
      const newResp = await axios.get(newUrl.toString());
      return newResp.data;
    }
  };

  create = async (url: string, data: any): Promise<any> => {
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error("API Client Create Error:", error?.response.data.Message);
      throw new Error(error?.response.data.Message);
    }
  };

  update = async (url: string, data: any): Promise<any> => {
    return (await axios.patch(url, data)).data;
  };

  put = async (url: string, data: any): Promise<any> => {
    return (await axios.put(url, data)).data;
  };

  patch = async (url: string, data: any): Promise<any> => {
    return (await axios.patch(url, data)).data;
  };

  delete = async (url: string, config?: AxiosRequestConfig): Promise<any> => {
    return (await axios.delete(url, config)).data;
  };
}

export { APIClient, setAuthorization };
