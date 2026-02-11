import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    // baseURL: "http://192.168.1.125:5000/api/"
    timeout: 30000

});

 axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if(token){
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
);

 export default axiosInstance;