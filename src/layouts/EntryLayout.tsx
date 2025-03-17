
import React from 'react';
import { Outlet } from 'react-router-dom';

const EntryLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-quantum-950 text-white">
      <div className="h-screen w-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default EntryLayout;
