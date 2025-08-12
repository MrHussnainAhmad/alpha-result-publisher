
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await classAPI.getClasses(token);
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await studentAPI.getStudentsByClass(selectedClass._id, token);
      
      // Filter students by the selected class
      const classStudents = response.data.students.filter(student => 
        student.class && student.class._id === selectedClass._id
      );
      
      setStudents(classStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
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
                Back to Classes
              </button>
            )}
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
