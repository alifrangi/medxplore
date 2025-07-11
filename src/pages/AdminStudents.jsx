import React from 'react';
import { Link } from 'react-router-dom';

const AdminStudents = () => {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Student Management</h1>
          </div>
        </div>
      </div>
      <div className="admin-container">
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '15px' }}>
          <h2>Student Management - Coming Soon</h2>
          <p>This feature will allow you to:</p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '2rem auto' }}>
            <li>View all registered students</li>
            <li>Search and filter students</li>
            <li>Update student information</li>
            <li>Add events to student passports</li>
            <li>Manage tier progression</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;