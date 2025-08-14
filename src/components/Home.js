
import React, { useState, useEffect, useCallback } from 'react';
import { classAPI, studentAPI } from '../services/api';
import ClassSelector from './ClassSelector';
import StudentList from './StudentList';
import StudentGradeManager from './StudentGradeManager';
import './Home.css';

const Home = ({ onLogout }) => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await studentAPI.getStudentsByClass(selectedClass._id, token);
      
      if (response.data && response.data.students) {
        // Filter students by the selected class
        const classStudents = response.data.students.filter(student => 
          student.class && student.class._id === selectedClass._id
        );
        
        setStudents(classStudents);
        console.log(`Found ${classStudents.length} students in class ${selectedClass.classNumber}-${selectedClass.section}`);
      } else {
        setStudents([]);
        console.log('No students data in response');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('No students found for this class.');
      } else {
        setError('Failed to load students. Please try again.');
      }
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass, fetchStudents]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await classAPI.getClasses(token);
      
      if (response.data && response.data.classes) {
        setClasses(response.data.classes);
        console.log(`Loaded ${response.data.classes.length} classes`);
      } else {
        setClasses([]);
        console.log('No classes data in response');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('No classes found.');
      } else {
        setError('Failed to load classes. Please try again.');
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedStudent(null);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setSelectedStudent(null);
    setStudents([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  if (loading && classes.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <i className="fas fa-graduation-cap"></i>
            Superior Panel
          </h1>
          <div className="header-actions">
            {selectedClass && (
              <button className="back-to-classes-btn" onClick={handleBackToClasses}>
                <i className="fas fa-arrow-left"></i>
                {'Back'}
              </button>
            )}
            <button 
              className="refresh-btn" 
              onClick={selectedClass ? fetchStudents : fetchClasses}
              disabled={loading}
              title="Refresh data"
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {!selectedClass ? (
          <ClassSelector 
            classes={classes} 
            onClassSelect={handleClassSelect}
            selectedClass={selectedClass}
          />
        ) : !selectedStudent ? (
          <StudentList 
            students={students}
            onStudentSelect={handleStudentSelect}
            selectedStudent={selectedStudent}
          />
        ) : (
          <StudentGradeManager 
            student={selectedStudent}
            onBack={handleBackToStudents}
          />
        )}
      </main>
    </div>
  );
};

export default Home;
