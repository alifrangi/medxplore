import React from 'react';
import { motion } from 'framer-motion';
import './DepartmentDashboardLayout.css';

const DepartmentDashboardLayout = ({ 
  departmentName, 
  departmentColor,
  children,
  sidebarContent,
  headerActions
}) => {
  return (
    <div className="department-dashboard-layout">
      <div className="department-header" style={{ backgroundColor: departmentColor }}>
        <div className="header-content">
          <h1>{departmentName} Dashboard</h1>
          <div className="header-actions">
            {headerActions}
          </div>
        </div>
      </div>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {sidebarContent}
          </motion.div>
        </aside>

        <main className="dashboard-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DepartmentDashboardLayout;