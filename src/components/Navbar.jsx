import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const { FiHome, FiBook, FiPlay, FiBarChart3, FiUser, FiLogOut, FiMenu, FiX, FiEye, FiUsers, FiMonitor } = FiIcons;

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { displayMode, setDisplayMode } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      navigate('/');
      toast.success('Signed out successfully');
    }
  };

  const toggleDisplayMode = () => {
    const modes = ['normal', 'senior', 'live'];
    const currentIndex = modes.indexOf(displayMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setDisplayMode(nextMode);
    toast.success(`Switched to ${nextMode} mode`);
  };

  const getDisplayModeIcon = () => {
    switch (displayMode) {
      case 'senior': return FiEye;
      case 'live': return FiUsers;
      default: return FiMonitor;
    }
  };

  const getDisplayModeLabel = () => {
    switch (displayMode) {
      case 'senior': return 'Senior Mode';
      case 'live': return 'Live Mode';
      default: return 'Normal Mode';
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/word-bank', label: 'Word Bank', icon: FiBook },
    { path: '/game', label: 'Game', icon: FiPlay },
    { path: '/statistics', label: 'Statistics', icon: FiBarChart3 }
  ];

  const getNavbarClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'bg-white shadow-lg border-b-4 border-blue-600';
      case 'live':
        return 'bg-black bg-opacity-50 backdrop-blur-sm';
      default:
        return 'bg-white shadow-lg';
    }
  };

  const getTextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-black text-xl font-bold';
      case 'live':
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <nav className={getNavbarClasses()}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className={`font-bold text-xl ${getTextClasses()}`}>
            Word Randomizer
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-500 text-white'
                    : `hover:bg-gray-100 ${getTextClasses()}`
                }`}
              >
                <SafeIcon icon={item.icon} className="w-5 h-5" />
                <span className={displayMode === 'senior' ? 'text-lg' : ''}>{item.label}</span>
              </Link>
            ))}

            {/* Display Mode Toggle */}
            <button
              onClick={toggleDisplayMode}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 ${getTextClasses()}`}
              title={getDisplayModeLabel()}
            >
              <SafeIcon icon={getDisplayModeIcon()} className="w-5 h-5" />
              <span className={displayMode === 'senior' ? 'text-lg' : 'hidden lg:inline'}>
                {getDisplayModeLabel()}
              </span>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 ${getTextClasses()}`}
                >
                  <SafeIcon icon={FiUser} className="w-5 h-5" />
                  <span className={displayMode === 'senior' ? 'text-lg' : 'hidden lg:inline'}>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-red-100 text-red-600`}
                >
                  <SafeIcon icon={FiLogOut} className="w-5 h-5" />
                  <span className={displayMode === 'senior' ? 'text-lg' : 'hidden lg:inline'}>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/signin"
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-md ${getTextClasses()}`}
          >
            <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-gray-200"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-500 text-white'
                      : `hover:bg-gray-100 ${getTextClasses()}`
                  }`}
                >
                  <SafeIcon icon={item.icon} className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <button
                onClick={() => {
                  toggleDisplayMode();
                  setIsMenuOpen(false);
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 ${getTextClasses()}`}
              >
                <SafeIcon icon={getDisplayModeIcon()} className="w-5 h-5" />
                <span>{getDisplayModeLabel()}</span>
              </button>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-gray-100 ${getTextClasses()}`}
                  >
                    <SafeIcon icon={FiUser} className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:bg-red-100 text-red-600"
                  >
                    <SafeIcon icon={FiLogOut} className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                  <Link
                    to="/auth/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;