
import React from 'react';

/**
 * TestDashboardWrapper component for the test route
 * This is a simple wrapper component used for testing purposes
 */
const TestDashboardWrapper: React.FC = ({ children }) => {
  return (
    <div className="test-dashboard-wrapper">
      <h1>Test Dashboard</h1>
      <div className="test-content">
        {children || <p>No test content available. This is a placeholder for testing purposes.</p>}
      </div>
    </div>
  );
};

export default TestDashboardWrapper;
