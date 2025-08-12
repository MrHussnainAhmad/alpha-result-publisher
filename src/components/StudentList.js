import React from 'react';
import './StudentList.css';

const StudentList = ({ students, onStudentSelect, selectedStudent }) => {
  return (
    <div className="student-list">
      <div className="student-list-header">
        <h2 className="section-title">Students in Class</h2>
        <div className="student-count">
          <i className="fas fa-users"></i>
          <span>{students.length} Students</span>
        </div>
      </div>
      
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr 
                key={student._id} 
                className={selectedStudent?._id === student._id ? 'selected-row' : ''}
              >
                <td>
                  <div className="student-id">
                    <i className="fas fa-id-card"></i>
                    {student.studentId || 'Not Assigned'}
                  </div>
                </td>
                <td>
                  <div className="student-name">
                    <div className="student-avatar">
                      {student.profilePicture ? (
                        <img src={student.profilePicture} alt={student.fullname} />
                      ) : (
                        <div className="avatar-placeholder">
                          {student.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{student.fullname}</span>
                  </div>
                </td>
                <td>{student.email}</td>
                <td>
                  <span className={`status-badge ${student.isVerified ? 'verified' : 'unverified'}`}>
                    <i className={`fas ${student.isVerified ? 'fa-check-circle' : 'fa-clock'}`}></i>
                    {student.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td>
                  <button 
                    className="manage-btn"
                    onClick={() => onStudentSelect(student)}
                  >
                    <i className="fas fa-cog"></i>
                    Manage Grades
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {students.length === 0 && (
          <div className="no-students">
            <i className="fas fa-user-graduate"></i>
            <p>No students found in this class.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
