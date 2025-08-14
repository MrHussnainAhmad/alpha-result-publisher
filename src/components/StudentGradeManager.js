import React, { useState, useEffect, useCallback } from 'react';
import { gradeAPI, subjectAPI } from '../services/api';
import './StudentGradeManager.css';

const StudentGradeManager = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'record'
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Add Grades State
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [grades, setGrades] = useState([]);
  
  // Show Record State
  const [gradeRecords, setGradeRecords] = useState([]);
  const [recordExamType, setRecordExamType] = useState('');
  const [recordExamDate, setRecordExamDate] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  const examTypes = [
    { value: 'monthly', label: 'Monthly', icon: 'fa-calendar-alt' },
    { value: 'weekly', label: 'Weekly', icon: 'fa-calendar-week' },
    { value: 'daily', label: 'Daily', icon: 'fa-calendar-day' },
    { value: 'surprise', label: 'Surprise', icon: 'fa-exclamation-triangle' }
  ];

  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await subjectAPI.getSubjects(token);
      
      if (response.data && response.data.subjects) {
        setSubjects(response.data.subjects);
        console.log(`Loaded ${response.data.subjects.length} subjects`);
      } else {
        setSubjects([]);
        console.log('No subjects data in response');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('No subjects found.');
      } else {
        setError('Failed to load subjects');
      }
      setSubjects([]);
    }
  }, []);

  const fetchGradeRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await gradeAPI.getStudentGrades(student._id, token);
      
      if (response.data && response.data.grades) {
        setGradeRecords(response.data.grades);
        console.log(`Loaded ${response.data.grades.length} grade records`);
      } else {
        setGradeRecords([]);
        console.log('No grade records data in response');
      }
    } catch (error) {
      console.error('Error fetching grade records:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('No grade records found for this student.');
      } else {
        setError('Failed to load grade records');
      }
      setGradeRecords([]);
    } finally {
      setLoading(false);
    }
  }, [student?._id]);

  useEffect(() => {
    fetchSubjects();
    if (activeTab === 'record') {
      fetchGradeRecords();
    }
  }, [activeTab, fetchSubjects, fetchGradeRecords]);

  const handleGradeChange = (subjectId, obtainedMarks, totalMarks) => {
    setGrades(prev => {
      const existing = prev.find(g => g.subject === subjectId);
      if (existing) {
        return prev.map(g => g.subject === subjectId ? { ...g, obtainedMarks, totalMarks } : g);
      } else {
        return [...prev, { subject: subjectId, obtainedMarks, totalMarks }];
      }
    });
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
  };

  const filteredGradeRecords = (() => {
    if (!filtersApplied) return [];
    if (!recordExamType || !recordExamDate) return [];
    const selectedDate = recordExamDate; // yyyy-mm-dd from input
    return gradeRecords.filter((record) => {
      const recordDate = new Date(record.examDate);
      const recordDateStr = new Date(recordDate.getTime() - recordDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      return record.gradeType === recordExamType && recordDateStr === selectedDate;
    });
  })();

  const handleRecordTypeChange = (type) => {
    setRecordExamType(type);
    setFiltersApplied(false);
  };

  const handleRecordDateChange = (date) => {
    setRecordExamDate(date);
    setFiltersApplied(false);
  };

  // Compute totals for filtered records (aggregated) - removed per requirements
  const computeTotalsForRecord = (record) => {
    const aggregate = (record?.subjects || []).reduce((acc, s) => {
      acc.obtained += Number(s.marksObtained || 0);
      acc.total += Number(s.totalMarks || 0);
      return acc;
    }, { obtained: 0, total: 0 });
    const percentage = aggregate.total > 0 ? Math.round((aggregate.obtained / aggregate.total) * 100) : 0;
    const grade = (() => {
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C+';
      if (percentage >= 40) return 'C';
      if (percentage >= 30) return 'D+';
      if (percentage >= 20) return 'D';
      return 'F';
    })();
    return { ...aggregate, percentage, grade };
  };

  const handleSubmitGrades = async () => {
    if (!examType || !examDate) {
      setError('Please select exam type and date');
      return;
    }

    if (grades.length === 0) {
      setError('Please add at least one grade');
      return;
    }

    // Validate that all grades have valid marks
    const invalidGrades = grades.filter(grade => 
      !grade.obtainedMarks || !grade.totalMarks || 
      parseInt(grade.obtainedMarks) > parseInt(grade.totalMarks) ||
      parseInt(grade.obtainedMarks) < 0 || parseInt(grade.totalMarks) <= 0
    );

    if (invalidGrades.length > 0) {
      setError('Please enter valid marks for all subjects. Obtained marks cannot exceed total marks.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const gradeData = {
        studentId: student._id,
        gradeType: examType,
        examDate,
        subjects: grades.map(gradeItem => {
          const obtainedMarks = parseInt(gradeItem.obtainedMarks);
          const totalMarks = parseInt(gradeItem.totalMarks);
          const percentage = Math.round((obtainedMarks / totalMarks) * 100);
          
          // Calculate grade based on percentage
          let calculatedGrade;
          if (percentage >= 90) calculatedGrade = 'A+';
          else if (percentage >= 80) calculatedGrade = 'A';
          else if (percentage >= 70) calculatedGrade = 'B+';
          else if (percentage >= 60) calculatedGrade = 'B';
          else if (percentage >= 50) calculatedGrade = 'C+';
          else if (percentage >= 40) calculatedGrade = 'C';
          else if (percentage >= 30) calculatedGrade = 'D+';
          else if (percentage >= 20) calculatedGrade = 'D';
          else calculatedGrade = 'F';
          
          // Get subject name from subjects array
          const subjectObj = subjects.find(s => s._id === gradeItem.subject);
          const subjectName = subjectObj ? subjectObj.name : 'Unknown Subject';
          
          return {
            subject: subjectName, // Send subject name as string, not ObjectId
            marksObtained: obtainedMarks,
            totalMarks: totalMarks,
            percentage: percentage,
            grade: calculatedGrade
          };
        })
      };

      console.log('Sending grade data:', gradeData);
      
      // Add some basic validation
      if (!gradeData.studentId) {
        throw new Error('Student ID is required');
      }
      if (!gradeData.gradeType) {
        throw new Error('Grade type is required');
      }
      if (!gradeData.examDate) {
        throw new Error('Exam date is required');
      }
      if (!gradeData.subjects || gradeData.subjects.length === 0) {
        throw new Error('At least one subject is required');
      }
      
      await gradeAPI.createGrade(gradeData, token);
      setSuccess('Grades saved successfully!');
      setGrades([]);
      setExamType('');
      setExamDate('');
      
      // Refresh grade records if on record tab
      if (activeTab === 'record') {
        fetchGradeRecords();
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more specific error message
      if (error.response?.data?.message) {
        setError(`Failed to save grades: ${error.response.data.message}`);
      } else if (error.message) {
        setError(`Failed to save grades: ${error.message}`);
      } else {
        setError('Failed to save grades. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (subjectId) => {
    // If subjectId is already a string (subject name), return it directly
    if (typeof subjectId === 'string' && !subjectId.match(/^[0-9a-fA-F]{24}$/)) {
      return subjectId;
    }
    // Otherwise, try to find the subject by ObjectId
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  return (
    <div className="student-grade-manager">
      <div className="grade-manager-header">
        <button className="back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Students
        </button>
        <div className="student-info">
          <div className="student-avatar">
            {student.profilePicture ? (
              <img src={student.profilePicture} alt={student.fullname} />
            ) : (
              <div className="avatar-placeholder">
                {student.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
          </div>
          <div className="student-details">
            <h2>{student.fullname}</h2>
            <p>{student.studentId || 'No ID Assigned'}</p>
          </div>
        </div>
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <i className="fas fa-plus-circle"></i>
            Add Grades
          </button>
          <button 
            className={`tab-btn ${activeTab === 'record' ? 'active' : ''}`}
            onClick={() => setActiveTab('record')}
          >
            <i className="fas fa-history"></i>
            Show Record
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'add' && (
          <div className="add-grades-section">
            <div className="exam-info">
              <div className="form-group">
                <label>Exam Type</label>
                <div className="exam-type-buttons">
                  {examTypes.map(type => (
                    <button
                      key={type.value}
                      className={`exam-type-btn ${examType === type.value ? 'selected' : ''}`}
                      onClick={() => setExamType(type.value)}
                    >
                      <i className={`fas ${type.icon}`}></i>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>

            <div className="grades-section">
              <h3>Subject Marks</h3>
              <div className="grades-grid">
                {subjects.map(subject => (
                  <div key={subject._id} className="grade-item">
                    <label>{subject.name}</label>
                    <div className="marks-inputs">
                      <div className="mark-input-group">
                        <label>Obtained Marks</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={grades.find(g => g.subject === subject._id)?.obtainedMarks || ''}
                          onChange={(e) => handleGradeChange(subject._id, e.target.value, grades.find(g => g.subject === subject._id)?.totalMarks || 100)}
                          className="mark-input"
                        />
                      </div>
                      <div className="mark-input-group">
                        <label>Total Marks</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="100"
                          value={grades.find(g => g.subject === subject._id)?.totalMarks || 100}
                          onChange={(e) => handleGradeChange(subject._id, grades.find(g => g.subject === subject._id)?.obtainedMarks || 0, e.target.value)}
                          className="mark-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="submit-section">
              <button 
                className="submit-btn"
                onClick={handleSubmitGrades}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Grades
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'record' && (
          <div className="grade-records-section">
            <div className="record-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Exam Type</label>
                  <select
                    className="filter-select"
                    value={recordExamType}
                    onChange={(e) => handleRecordTypeChange(e.target.value)}
                  >
                    <option value="">Select Type</option>
                    {examTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Exam Date</label>
                  <input
                    type="date"
                    className="filter-date"
                    value={recordExamDate}
                    onChange={(e) => handleRecordDateChange(e.target.value)}
                  />
                </div>
                <div className="filter-actions">
                  <button
                    className="filter-button"
                    onClick={handleApplyFilters}
                    disabled={!recordExamType || !recordExamDate}
                  >
                    Show Results
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <i className="fas fa-spinner fa-spin"></i>
                Loading grade records...
              </div>
            ) : !filtersApplied ? (
              <div className="no-records">
                <i className="fas fa-filter"></i>
                <p>Select exam type and date, then click "Show Results".</p>
              </div>
            ) : filteredGradeRecords.length > 0 ? (
              <>
                <div className="records-list">
                  {filteredGradeRecords.map((record, index) => (
                    <div key={index} className="record-card">
                      <div className="record-header">
                        <h4>{record.gradeType} Exam</h4>
                        <span className="record-date">{new Date(record.examDate).toLocaleDateString()}</span>
                      </div>
                      {(() => {
                        const rTotals = computeTotalsForRecord(record);
                        return (
                          <div className="record-summary">
                            <div className="summary-item">
                              <span className="summary-label">Total Obtained</span>
                              <span className="summary-value">{rTotals.obtained}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Total Marks</span>
                              <span className="summary-value">{rTotals.total}</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Percentage</span>
                              <span className="summary-badge">{rTotals.percentage}%</span>
                            </div>
                            <div className="summary-item">
                              <span className="summary-label">Grade</span>
                              <span className="summary-grade">{rTotals.grade}</span>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="record-grades">
                        {record.subjects.map((subject, idx) => (
                          <div key={idx} className="record-grade">
                            <span className="subject-name">{getSubjectName(subject.subject)}</span>
                            <span className="grade-value">{subject.marksObtained}/{subject.totalMarks} ({subject.grade})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-records">
                <i className="fas fa-file-alt"></i>
                <p>No grade records match the selected type and date.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGradeManager;
