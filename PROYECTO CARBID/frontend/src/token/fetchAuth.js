import axios from "axios";

export const fetchAuth = axios.create({
  baseURL: "http://localhost:4000",
});

// Poner automaticamente el token
fetchAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
