import { initializeDepartmentCodes } from '../services/database';

// This function should be called once to set up the initial department codes
// You can run this in the browser console or create a setup page for admins

export const setupCodes = async () => {
  try {
    console.log('Setting up department codes...');
    const result = await initializeDepartmentCodes();
    
    if (result.success) {
      console.log('Department codes initialized successfully:');
      console.log('='.repeat(50));
      result.departments.forEach(dept => {
        console.log(`${dept.name} (${dept.id}): ${dept.code}`);
      });
      console.log('='.repeat(50));
      console.log('Default codes set:');
      console.log('Research: 123456');
      console.log('Academic: 234567');
      console.log('Global Outreach: 345678');
      console.log('='.repeat(50));
      
      // Store codes in localStorage for admin reference (temporary)
      localStorage.setItem('departmentCodes', JSON.stringify(result.departments));
      
      return result.departments;
    } else {
      console.error('Failed to initialize codes:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error setting up codes:', error);
    return null;
  }
};

// Function to retrieve codes for admins (from localStorage)
export const getCodes = () => {
  try {
    const codes = localStorage.getItem('departmentCodes');
    return codes ? JSON.parse(codes) : null;
  } catch (error) {
    console.error('Error retrieving codes:', error);
    return null;
  }
};

// Function to display codes in console (for admin use)
export const showCodes = () => {
  const codes = getCodes();
  if (codes) {
    console.log('Current Department Codes:');
    codes.forEach(dept => {
      console.log(`${dept.name}: ${dept.code}`);
    });
  } else {
    console.log('No codes found. Run setupCodes() first.');
  }
};

// Add to window for console access
if (typeof window !== 'undefined') {
  window.setupDepartmentCodes = setupCodes;
  window.showDepartmentCodes = showCodes;
}