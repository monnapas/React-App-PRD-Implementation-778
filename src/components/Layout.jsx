import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useGame } from '../context/GameContext';

const Layout = () => {
  const { displayMode } = useGame();

  const getLayoutClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'min-h-screen bg-white text-black text-xl';
      case 'live':
        return 'min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white';
      default:
        return 'min-h-screen bg-gray-50 text-gray-900';
    }
  };

  return (
    <div className={getLayoutClasses()}>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;