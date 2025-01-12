import axios from "axios";
import { redirect } from "next/navigation";

export const api = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirect("/sign-in");
    }
    return Promise.reject(error);
  }
);
