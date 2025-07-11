import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiBarChart3, FiTrendingUp, FiClock, FiTarget, FiCalendar, FiUsers } = FiIcons;

const Statistics = () => {
  const { user } = useAuth();
  const { gameHistory, displayMode } = useGame();
  const [stats, setStats] = useState({
    totalGames: 0,
    totalWords: 0,
    averageWordsPerGame: 0,
    mostUsedCategory: '',
    totalPlayTime: 0,
    gamesThisWeek: 0,
    streak: 0
  });

  useEffect(() => {
    calculateStats();
  }, [gameHistory]);

  const calculateStats = () => {
    if (!gameHistory.length) return;

    const totalGames = gameHistory.length;
    const totalWords = gameHistory.reduce((sum, game) => sum + (game.words_used || 0), 0);
    const averageWordsPerGame = totalWords / totalGames;
    const totalPlayTime = gameHistory.reduce((sum, game) => sum + (game.duration || 0), 0);

    // Calculate games this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const gamesThisWeek = gameHistory.filter(game => 
      new Date(game.created_at) >= oneWeekAgo
    ).length;

    setStats({
      totalGames,
      totalWords,
      averageWordsPerGame: Math.round(averageWordsPerGame),
      mostUsedCategory: 'Nouns', // This would be calculated from actual data
      totalPlayTime: Math.round(totalPlayTime / 60), // Convert to minutes
      gamesThisWeek,
      streak: 3 // This would be calculated from actual data
    });
  };

  const getCardClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'bg-white p-8 rounded-lg shadow-lg border-2 border-gray-300';
      case 'live':
        return 'bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-lg shadow-lg';
      default:
        return 'bg-white p-6 rounded-lg shadow-lg';
    }
  };

  const getTextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-black text-xl';
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

  // Chart options
  const gamesPerDayOptions = {
    title: {
      text: 'Games Played This Week',
      textStyle: {
        color: displayMode === 'live' ? '#ffffff' : '#333333',
        fontSize: displayMode === 'senior' ? 18 : 16
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
        color: displayMode === 'live' ? '#ffffff' : '#333333'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: displayMode === 'live' ? '#ffffff' : '#333333'
      }
    },
    series: [{
      data: [2, 3, 1, 4, 2, 1, 3],
      type: 'bar',
      itemStyle: {
        color: '#4A90E2'
      }
    }]
  };

  const categoryDistributionOptions = {
    title: {
      text: 'Category Usage',
      textStyle: {
        color: displayMode === 'live' ? '#ffffff' : '#333333',
        fontSize: displayMode === 'senior' ? 18 : 16
      }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 35, name: 'Nouns' },
        { value: 25, name: 'Verbs' },
        { value: 20, name: 'Adjectives' },
        { value: 20, name: 'Custom' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const statCards = [
    {
      title: 'Total Games',
      value: stats.totalGames,
      icon: FiBarChart3,
      color: 'bg-blue-500'
    },
    {
      title: 'Words Practiced',
      value: stats.totalWords,
      icon: FiTarget,
      color: 'bg-green-500'
    },
    {
      title: 'Average Words/Game',
      value: stats.averageWordsPerGame,
      icon: FiTrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Play Time (min)',
      value: stats.totalPlayTime,
      icon: FiClock,
      color: 'bg-orange-500'
    },
    {
      title: 'Games This Week',
      value: stats.gamesThisWeek,
      icon: FiCalendar,
      color: 'bg-red-500'
    },
    {
      title: 'Current Streak',
      value: stats.streak,
      icon: FiUsers,
      color: 'bg-indigo-500'
    }
  ];

  if (!user) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={getCardClasses()}
        >
          <h1 className={`text-3xl font-bold mb-4 ${getTextClasses()}`}>Statistics</h1>
          <p className={`${getSubtextClasses()} mb-6`}>
            Sign in to view your personal learning statistics and track your progress.
          </p>
          
          <div className="space-y-4">
            <h2 className={`text-xl font-semibold ${getTextClasses()}`}>Demo Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map((card, index) => (
                <div key={card.title} className={`p-4 border rounded-lg ${displayMode === 'senior' ? 'border-2 border-gray-400' : 'border-gray-200'}`}>
                  <div className={`w-8 h-8 ${card.color} rounded-full flex items-center justify-center mb-2`}>
                    <SafeIcon icon={card.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div className={`text-2xl font-bold ${getTextClasses()}`}>
                    {Math.floor(Math.random() * 50) + 10}
                  </div>
                  <div className={`text-sm ${getSubtextClasses()}`}>{card.title}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className={`text-3xl font-bold ${getTextClasses()}`}>Your Statistics</h1>
        <div className={`text-sm ${getSubtextClasses()}`}>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={getCardClasses()}
          >
            <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center mb-4`}>
              <SafeIcon icon={card.icon} className="w-6 h-6 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${getTextClasses()} ${displayMode === 'senior' ? 'text-4xl' : ''}`}>
              {card.value}
            </div>
            <div className={`text-sm ${getSubtextClasses()} ${displayMode === 'senior' ? 'text-base' : ''}`}>
              {card.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={getCardClasses()}
        >
          <ReactECharts
            option={gamesPerDayOptions}
            style={{ height: '300px' }}
            theme={displayMode === 'live' ? 'dark' : 'light'}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={getCardClasses()}
        >
          <ReactECharts
            option={categoryDistributionOptions}
            style={{ height: '300px' }}
            theme={displayMode === 'live' ? 'dark' : 'light'}
          />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={getCardClasses()}
      >
        <h2 className={`text-xl font-semibold mb-4 ${getTextClasses()}`}>Recent Activity</h2>
        {gameHistory.length > 0 ? (
          <div className="space-y-3">
            {gameHistory.slice(0, 5).map((game, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className={`font-medium ${getTextClasses()}`}>
                    Game Session
                  </div>
                  <div className={`text-sm ${getSubtextClasses()}`}>
                    {game.words_used || 0} words • {Math.round((game.duration || 0) / 60)} min
                  </div>
                </div>
                <div className={`text-sm ${getSubtextClasses()}`}>
                  {new Date(game.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className={`${getSubtextClasses()} mb-4`}>
              No games played yet. Start playing to see your activity here!
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start First Game
            </button>
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={getCardClasses()}
      >
        <h2 className={`text-xl font-semibold mb-4 ${getTextClasses()}`}>Achievements</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'First Game', description: 'Complete your first game', earned: true },
            { name: 'Word Master', description: 'Practice 100 words', earned: stats.totalWords >= 100 },
            { name: 'Consistent Player', description: 'Play for 7 days straight', earned: stats.streak >= 7 },
            { name: 'Speed Learner', description: 'Complete 10 games in a day', earned: false },
            { name: 'Category Explorer', description: 'Use all default categories', earned: false },
            { name: 'Custom Creator', description: 'Create your first custom category', earned: false }
          ].map((achievement, index) => (
            <div
              key={achievement.name}
              className={`p-4 rounded-lg border-2 ${
                achievement.earned
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 rounded-full ${
                  achievement.earned ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {achievement.earned && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <h3 className={`font-semibold ${getTextClasses()}`}>
                  {achievement.name}
                </h3>
              </div>
              <p className={`text-sm ${getSubtextClasses()}`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Statistics;