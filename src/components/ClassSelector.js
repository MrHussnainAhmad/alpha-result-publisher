import React from 'react';
import './ClassSelector.css';

const ClassSelector = ({ classes, onClassSelect, selectedClass }) => {
  return (
    <div className="class-selector">
      <h2 className="section-title">Select a Class</h2>
      <div className="classes-grid">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className={`class-card ${selectedClass?._id === cls._id ? 'selected' : ''}`}
            onClick={() => onClassSelect(cls)}
          >
            <div className="class-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="class-info">
              <h3 className="class-name">{cls.classNumber}-{cls.section}</h3>
              <p className="class-description">Class {cls.classNumber} - {cls.section}</p>
            </div>
            <div className="class-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>
        ))}
      </div>
      {classes.length === 0 && (
        <div className="no-classes">
          <i className="fas fa-info-circle"></i>
          <p>No classes available. Please contact the administrator.</p>
        </div>
      )}
    </div>
  );
};

export default ClassSelector;
