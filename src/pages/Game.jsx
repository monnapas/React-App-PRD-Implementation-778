import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const { FiPlay, FiPause, FiRotateCcw, FiSave, FiClock, FiArrowLeft, FiArrowRight, FiTrash2, FiRefreshCw } = FiIcons;

const Game = () => {
  const { user } = useAuth();
  const { categories, presets, displayMode, savePreset, saveGameHistory } = useGame();
  const [gameState, setGameState] = useState('setup'); // setup, playing, paused, finished
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [wordCounts, setWordCounts] = useState({});
  const [timer, setTimer] = useState(30);
  const [repeatWords, setRepeatWords] = useState(true);
  const [currentWord, setCurrentWord] = useState(null);
  const [wordPool, setWordPool] = useState([]);
  const [usedWords, setUsedWords] = useState([]);
  const [discardedWords, setDiscardedWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const getCardClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'bg-white p-8 rounded-lg shadow-lg border-4 border-blue-600';
      case 'live':
        return 'bg-white bg-opacity-20 backdrop-blur-sm p-8 rounded-lg shadow-lg border-2 border-white border-opacity-30';
      default:
        return 'bg-white p-6 rounded-lg shadow-lg';
    }
  };

  const getTextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-black text-2xl font-bold';
      case 'live':
        return 'text-white text-xl';
      default:
        return 'text-gray-900';
    }
  };

  const getWordCardClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'bg-blue-50 p-12 rounded-xl shadow-xl border-4 border-blue-600 text-center';
      case 'live':
        return 'bg-gradient-to-br from-purple-500 to-pink-500 p-12 rounded-xl shadow-xl text-center';
      default:
        return 'bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-xl shadow-xl text-center';
    }
  };

  const getWordTextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-6xl font-bold text-blue-900 mb-6';
      case 'live':
        return 'text-5xl font-bold text-white mb-6';
      default:
        return 'text-4xl font-bold text-white mb-6';
    }
  };

  const getCategoryWords = (categoryId) => {
    if (categoryId.startsWith('default-')) {
      const defaultCategory = categories.find(cat => cat.id === categoryId);
      return defaultCategory ? defaultCategory.words : [];
    }
    return []; // For now, since we don't have word banks loaded
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      const newSelected = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      // Update word counts
      if (!prev.includes(categoryId)) {
        setWordCounts(prevCounts => ({
          ...prevCounts,
          [categoryId]: Math.min(5, getCategoryWords(categoryId).length)
        }));
      } else {
        setWordCounts(prevCounts => {
          const newCounts = { ...prevCounts };
          delete newCounts[categoryId];
          return newCounts;
        });
      }
      
      return newSelected;
    });
  };

  const handleWordCountChange = (categoryId, count) => {
    const maxWords = getCategoryWords(categoryId).length;
    setWordCounts(prev => ({
      ...prev,
      [categoryId]: Math.min(Math.max(1, count), maxWords)
    }));
  };

  const startGame = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    // Build word pool
    const pool = [];
    selectedCategories.forEach(categoryId => {
      const words = getCategoryWords(categoryId);
      const count = wordCounts[categoryId] || 1;
      const selectedWords = words.slice(0, count);
      pool.push(...selectedWords);
    });

    if (pool.length === 0) {
      toast.error('No words available in selected categories');
      return;
    }

    setWordPool([...pool]);
    setUsedWords([]);
    setDiscardedWords([]);
    setTimeLeft(timer);
    setGameState('playing');
    setGameHistory([]);
    randomizeWord(pool);
  };

  const randomizeWord = (pool = wordPool) => {
    const availableWords = pool.filter(word => 
      !usedWords.includes(word) && !discardedWords.includes(word)
    );

    if (availableWords.length === 0) {
      if (repeatWords) {
        // Reset the pool
        setUsedWords([]);
        setDiscardedWords([]);
        const randomWord = pool[Math.floor(Math.random() * pool.length)];
        setCurrentWord(randomWord);
        setGameHistory(prev => [...prev, { word: randomWord, timestamp: new Date(), action: 'randomized' }]);
      } else {
        toast.info('All words have been used');
        setGameState('finished');
      }
      return;
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord);
    setUsedWords(prev => [...prev, randomWord]);
    setGameHistory(prev => [...prev, { word: randomWord, timestamp: new Date(), action: 'randomized' }]);
  };

  const handleDiscard = () => {
    if (currentWord) {
      setDiscardedWords(prev => [...prev, currentWord]);
      setUsedWords(prev => prev.filter(word => word !== currentWord));
      setGameHistory(prev => [...prev, { word: currentWord, timestamp: new Date(), action: 'discarded' }]);
      randomizeWord();
    }
  };

  const handleReturnToPool = () => {
    if (currentWord) {
      setUsedWords(prev => prev.filter(word => word !== currentWord));
      setGameHistory(prev => [...prev, { word: currentWord, timestamp: new Date(), action: 'returned' }]);
      randomizeWord();
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentWord(null);
    setWordPool([]);
    setUsedWords([]);
    setDiscardedWords([]);
    setTimeLeft(0);
    setGameHistory([]);
  };

  const handleSavePreset = async () => {
    if (!user) {
      toast.error('Please sign in to save presets');
      return;
    }

    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const config = {
      selectedCategories,
      wordCounts,
      timer,
      repeatWords
    };

    const { error } = await savePreset(presetName, config);
    if (error) {
      toast.error('Error saving preset');
    } else {
      toast.success('Preset saved successfully!');
      setShowPresetModal(false);
      setPresetName('');
    }
  };

  const loadPreset = (preset) => {
    const config = preset.config;
    setSelectedCategories(config.selectedCategories || []);
    setWordCounts(config.wordCounts || {});
    setTimer(config.timer || 30);
    setRepeatWords(config.repeatWords !== undefined ? config.repeatWords : true);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'setup') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <h1 className={`text-3xl font-bold ${getTextClasses()}`}>Game Setup</h1>
          {user && (
            <button
              onClick={() => setShowPresetModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <SafeIcon icon={FiSave} className="w-5 h-5" />
              <span>Save Preset</span>
            </button>
          )}
        </motion.div>

        {/* Presets */}
        {user && presets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={getCardClasses()}
          >
            <h2 className={`text-xl font-semibold mb-4 ${getTextClasses()}`}>Load Preset</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h3 className="font-semibold">{preset.name}</h3>
                  <p className="text-sm text-gray-600">
                    {preset.config.selectedCategories?.length || 0} categories
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={getCardClasses()}
        >
          <h2 className={`text-xl font-semibold mb-4 ${getTextClasses()}`}>Select Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className={getTextClasses()}>{category.name}</span>
                </label>
                {selectedCategories.includes(category.id) && (
                  <div className="ml-8 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of words: {wordCounts[category.id] || 1}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={getCategoryWords(category.id).length}
                      value={wordCounts[category.id] || 1}
                      onChange={(e) => handleWordCountChange(category.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Game Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={getCardClasses()}
        >
          <h2 className={`text-xl font-semibold mb-4 ${getTextClasses()}`}>Game Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timer (seconds): {timer}
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={timer}
                onChange={(e) => setTimer(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={repeatWords}
                  onChange={(e) => setRepeatWords(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className={getTextClasses()}>Repeat words when pool is empty</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Start Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={startGame}
            className="flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xl font-semibold"
          >
            <SafeIcon icon={FiPlay} className="w-6 h-6" />
            <span>Start Game</span>
          </button>
        </motion.div>

        {/* Save Preset Modal */}
        {showPresetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Save Preset</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preset Name
                  </label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter preset name"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSavePreset}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowPresetModal(false);
                      setPresetName('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'playing' || gameState === 'paused') {
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center space-x-4">
            <h1 className={`text-2xl font-bold ${getTextClasses()}`}>Game in Progress</h1>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiClock} className="w-5 h-5 text-blue-600" />
              <span className={`text-xl font-mono ${getTextClasses()}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <SafeIcon icon={gameState === 'playing' ? FiPause : FiPlay} className="w-5 h-5" />
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <SafeIcon icon={FiRotateCcw} className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Word Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={getWordCardClasses()}
        >
          <AnimatePresence mode="wait">
            {currentWord && (
              <motion.div
                key={currentWord}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={getWordTextClasses()}>{currentWord}</div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleDiscard}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                    <span>Discard</span>
                  </button>
                  <button
                    onClick={() => randomizeWord()}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <SafeIcon icon={FiRefreshCw} className="w-5 h-5" />
                    <span>Next Word</span>
                  </button>
                  <button
                    onClick={handleReturnToPool}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
                    <span>Return to Pool</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={getCardClasses()}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold text-blue-600 ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
                {wordPool.length}
              </div>
              <div className={`text-sm ${getTextClasses()}`}>Total Words</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-green-600 ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
                {usedWords.length}
              </div>
              <div className={`text-sm ${getTextClasses()}`}>Used Words</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-red-600 ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
                {discardedWords.length}
              </div>
              <div className={`text-sm ${getTextClasses()}`}>Discarded</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className={`text-3xl font-bold mb-4 ${getTextClasses()}`}>Game Finished!</h1>
          <p className={`text-lg ${getTextClasses()}`}>Great job! Here's your game summary:</p>
        </motion.div>

        {/* Game Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={getCardClasses()}
        >
          <h2 className={`text-xl font-semibold mb-4 ${getTextClasses()}`}>Game Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold text-blue-600 ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
                {wordPool.length}
              </div>
              <div className={`text-sm ${getTextClasses()}`}>Total Words</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-green-600 ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
                {usedWords.length}
              </div>
              <div className={`text-sm ${getTextClasses()}`}>Words Used</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-red-600 ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
                {discardedWords.length}
              </div>
              <div className={`text-sm ${getTextClasses()}`}>Words Discarded</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-purple-600 ${displayMode === 'senior' ? 'text-3xl' : ''}`}>
                {gameHistory.length}
              </div>
              <div className={`text-sm ${getTextClasses()}`}>Total Actions</div>
            </div>
          </div>
        </motion.div>

        {/* Game History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={getCardClasses()}
        >
          <h2 className={`text-xl font-semibold mb-4 ${getTextClasses()}`}>Game History</h2>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {gameHistory.map((entry, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{entry.word}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    entry.action === 'randomized' ? 'bg-blue-100 text-blue-800' :
                    entry.action === 'discarded' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {entry.action}
                  </span>
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-4"
        >
          <button
            onClick={startGame}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiPlay} className="w-5 h-5" />
            <span>Play Again</span>
          </button>
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <SafeIcon icon={FiRotateCcw} className="w-5 h-5" />
            <span>New Game</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default Game;