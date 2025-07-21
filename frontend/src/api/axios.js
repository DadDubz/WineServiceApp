import axios from "axios";

const instance = axios.create({
  baseURL: "", // leave blank if using Vite proxy
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
