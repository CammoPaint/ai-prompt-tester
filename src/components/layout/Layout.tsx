import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useThemeEffect } from '../../utils/theme';

const Layout: React.FC = () => {
  // Apply theme
  useThemeEffect();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;