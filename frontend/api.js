import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // your backend URL
  withCredentials: true, // allow cookies to be sent with each request
});

api.interceptors.request.use(
  (config) => {
    // No need to manually add the Authorization header, cookies will be sent automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Handle unauthorized error, e.g., redirect to login
      console.log("Unauthorized, logging out...");
    }
    return Promise.reject(error);
  }
);

export default api;
