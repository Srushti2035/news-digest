import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';
const API = axios.create({ baseURL });

// This sends our JWT token automatically in every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const getProfile = () => API.get('/news/profile');
export const updatePreferences = (data) => API.patch('/news/update-preferences', data);
export const sendNow = () => API.post('/news/send-now');
export const getNewsPreview = () => API.get('/news/preview');
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });
export const getSuggestions = () => API.get('/news/suggestions');