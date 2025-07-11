import React from 'react';
import { Link } from 'react-router-dom';

const AdminEvents = () => {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Event Management</h1>
          </div>
        </div>
      </div>
      <div className="admin-container">
        <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '15px' }}>
          <h2>Event Management - Coming Soon</h2>
          <p>This feature will allow you to:</p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '2rem auto' }}>
            <li>Create new events</li>
            <li>Edit existing events</li>
            <li>Track event attendance</li>
            <li>Add students to events</li>
            <li>Generate event reports</li>
            <li>Upload certificates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;