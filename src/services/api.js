
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Assuming the backend runs on port 5000

const api = axios.create({
  baseURL: API_URL,
});

export const authAPI = {
  adminLogin: (credentials) => api.post('/admin/login', credentials),
};

export const gradeAPI = {
    createGrade: (data, token) => api.post('/grades', data, {
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
    getStudentsByClass: (classId, token) => api.get(`/students/class/${classId}`, {
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
