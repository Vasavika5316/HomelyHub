import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:8002',
    withCredentials: true, // This is crucial for sending cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token from localStorage if available
api.interceptors.request.use(
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            // You might want to redirect to login here
        }
        return Promise.reject(error);
    }
);

export default api;
