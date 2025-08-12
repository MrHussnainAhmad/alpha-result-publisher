
import axios from 'axios';

// Auto-detect if running on localhost or production
const getApiUrl = () => {
  // Check if we have an environment variable set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Otherwise use production URL
  return 'https://superior.up.railway.app/api';
};

const API_URL = getApiUrl();

console.log('API URL:', API_URL); // For debugging

const api = axios.create({
  baseURL: API_URL,
});

export const authAPI = {
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  adminSignup: (data) => api.post('/admin/signup', data),
};

export const gradeAPI = {
    createGrade: (data, token) => api.post('/grades', data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }),
    getStudentGrades: (studentId, token) => api.get(`/grades/student/${studentId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
};

export const classAPI = {
    getClasses: (token) => api.get('/classes', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
};

export const studentAPI = {
    getStudentsByClass: (classId, token) => api.get(`/admin/students`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
};

export const subjectAPI = {
    getSubjects: (token) => api.get('/subjects', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
};

export default api;
