import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend.codingjudge.online', 
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401 && window.location.pathname!=='/login' && window.location.pathname!=='/register' && window.location.pathname!=='/') {
      alert('Unauthorized, logging out...');
      window.location.href='/login';    
      console.log("Unauthorized, logging out...");
    }
    return Promise.reject(error);
  }
);

export default api;
