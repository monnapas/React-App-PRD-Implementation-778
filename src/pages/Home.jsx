import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiBook, FiBarChart3, FiUsers, FiEye, FiMonitor } = FiIcons;

const Home = () => {
  const { user } = useAuth();
  const { displayMode } = useGame();

  const getCardClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'bg-white p-8 rounded-lg shadow-lg border-2 border-blue-600 hover:shadow-xl transition-shadow';
      case 'live':
        return 'bg-white bg-opacity-20 backdrop-blur-sm p-8 rounded-lg shadow-lg hover:bg-opacity-30 transition-all';
      default:
        return 'bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow';
    }
  };

  const getTextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-black';
      case 'live':
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  const getSubtextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-gray-700 text-lg';
      case 'live':
        return 'text-gray-200';
      default:
        return 'text-gray-600';
    }
  };

  const features = [
    {
      icon: FiPlay,
      title: 'Start Playing',
      description: 'Jump right into a word randomization game with our default word bank',
      link: '/game',
      color: 'bg-blue-500'
    },
    {
      icon: FiBook,
      title: 'Manage Word Bank',
      description: 'Create custom categories and add your own words for personalized learning',
      link: '/word-bank',
      color: 'bg-green-500'
    },
    {
      icon: FiBarChart3,
      title: 'View Statistics',
      description: 'Track your progress and see your learning statistics over time',
      link: '/statistics',
      color: 'bg-purple-500'
    }
  ];

  const displayModes = [
    {
      icon: FiMonitor,
      title: 'Normal Mode',
      description: 'Standard interface for regular use'
    },
    {
      icon: FiEye,
      title: 'Senior Mode',
      description: 'Large text and high contrast for better readability'
    },
    {
      icon: FiUsers,
      title: 'Live Mode',
      description: 'Optimized for social media streaming and group activities'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className={`text-4xl md:text-6xl font-bold ${getTextClasses()} ${displayMode === 'senior' ? 'text-5xl md:text-7xl' : ''}`}>
          English Word Randomizer
        </h1>
        <p className={`text-lg md:text-xl max-w-3xl mx-auto ${getSubtextClasses()} ${displayMode === 'senior' ? 'text-xl md:text-2xl' : ''}`}>
          A fun and interactive way to learn English vocabulary. Create custom word banks, 
          set up games, and practice with friends or in the classroom.
        </p>
        {!user && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/signup"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Get Started Free
            </Link>
            <Link
              to="/game"
              className="px-8 py-3 bg-transparent border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-lg font-semibold"
            >
              Try Demo
            </Link>
          </div>
        )}
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={feature.link} className={`block ${getCardClasses()}`}>
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto`}>
                  <SafeIcon icon={feature.icon} className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${getTextClasses()} ${displayMode === 'senior' ? 'text-2xl' : ''}`}>
                  {feature.title}
                </h3>
                <p className={`${getSubtextClasses()} ${displayMode === 'senior' ? 'text-lg' : ''}`}>
                  {feature.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Display Modes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-8"
      >
        <h2 className={`text-3xl font-bold text-center ${getTextClasses()} ${displayMode === 'senior' ? 'text-4xl' : ''}`}>
          Display Modes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {displayModes.map((mode, index) => (
            <div key={mode.title} className={getCardClasses()}>
              <div className="text-center space-y-4">
                <div className={`w-12 h-12 ${displayMode === mode.title.toLowerCase().split(' ')[0] ? 'bg-blue-500' : 'bg-gray-400'} rounded-full flex items-center justify-center mx-auto`}>
                  <SafeIcon icon={mode.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-semibold ${getTextClasses()} ${displayMode === 'senior' ? 'text-xl' : ''}`}>
                  {mode.title}
                </h3>
                <p className={`text-sm ${getSubtextClasses()} ${displayMode === 'senior' ? 'text-base' : ''}`}>
                  {mode.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Statistics Preview */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${getCardClasses()} text-center`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${getTextClasses()} ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
            Welcome back, {user.email}!
          </h2>
          <p className={`${getSubtextClasses()} ${displayMode === 'senior' ? 'text-lg' : ''}`}>
            Ready to continue your English learning journey?
          </p>
          <div className="mt-6">
            <Link
              to="/game"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Start New Game
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;