import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("API Success:", response);
    return response;
  },

  (error) => {
    const status = error.response?.status;
    console.log("API Error Status:", status, "Full Error:", error);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Optional small delay for better UI experience
      setTimeout(() => {
        window.location.href = "/login";
      }, 200);
    }


    // Custom message for other errors
    const msg = error.response?.data?.message || error.response?.data?.error || "Something went wrong!";
    console.error(`API Error (${status}):`, msg);

    return Promise.reject(error);
  }
);


export default axiosInstance;

