import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const { FiPlus, FiEdit2, FiTrash2, FiUpload, FiDownload } = FiIcons;

const WordBank = () => {
  const { user } = useAuth();
  const { categories, wordBanks, displayMode, createCategory, addWordsToCategory } = useGame();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddWords, setShowAddWords] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newWords, setNewWords] = useState('');
  const [bulkWords, setBulkWords] = useState('');

  const getCardClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300';
      case 'live':
        return 'bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-lg shadow-lg';
      default:
        return 'bg-white p-6 rounded-lg shadow-lg';
    }
  };

  const getTextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-black text-lg';
      case 'live':
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  const getSubtextClasses = () => {
    switch (displayMode) {
      case 'senior':
        return 'text-gray-700 text-base';
      case 'live':
        return 'text-gray-200';
      default:
        return 'text-gray-600';
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create categories');
      return;
    }

    const { error } = await createCategory(newCategoryName);
    if (error) {
      toast.error('Error creating category');
    } else {
      toast.success('Category created successfully!');
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleAddWords = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add words');
      return;
    }

    const words = newWords.split(',').map(word => word.trim()).filter(word => word);
    if (words.length === 0) {
      toast.error('Please enter at least one word');
      return;
    }

    const { error } = await addWordsToCategory(selectedCategory.id, words);
    if (error) {
      toast.error('Error adding words');
    } else {
      toast.success(`Added ${words.length} words successfully!`);
      setNewWords('');
      setShowAddWords(false);
      setSelectedCategory(null);
    }
  };

  const handleBulkAddWords = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add words');
      return;
    }

    const words = bulkWords.split('\n').map(word => word.trim()).filter(word => word);
    if (words.length === 0) {
      toast.error('Please enter at least one word');
      return;
    }

    const { error } = await addWordsToCategory(selectedCategory.id, words);
    if (error) {
      toast.error('Error adding words');
    } else {
      toast.success(`Added ${words.length} words successfully!`);
      setBulkWords('');
      setShowAddWords(false);
      setSelectedCategory(null);
    }
  };

  const getCategoryWords = (categoryId) => {
    if (categoryId.startsWith('default-')) {
      const defaultCategory = categories.find(cat => cat.id === categoryId);
      return defaultCategory ? defaultCategory.words : [];
    }
    return wordBanks.filter(word => word.category_id === categoryId).map(word => word.word);
  };

  if (!user) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={getCardClasses()}
        >
          <h1 className={`text-3xl font-bold mb-4 ${getTextClasses()}`}>Word Bank Management</h1>
          <p className={`${getSubtextClasses()} mb-6`}>
            Sign in to create custom categories and manage your personal word bank.
          </p>
          
          <div className="space-y-4">
            <h2 className={`text-xl font-semibold ${getTextClasses()}`}>Default Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className={`p-4 border rounded-lg ${displayMode === 'senior' ? 'border-2 border-gray-400' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold mb-2 ${getTextClasses()}`}>{category.name}</h3>
                  <p className={`text-sm ${getSubtextClasses()}`}>
                    {getCategoryWords(category.id).length} words
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {getCategoryWords(category.id).slice(0, 3).map((word, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {word}
                      </span>
                    ))}
                    {getCategoryWords(category.id).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{getCategoryWords(category.id).length - 3} more
                      </span>
                    )}
                  </div>
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
        <h1 className={`text-3xl font-bold ${getTextClasses()}`}>Word Bank Management</h1>
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </motion.div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={getCardClasses()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-semibold ${getTextClasses()}`}>{category.name}</h3>
              {!category.id.startsWith('default-') && (
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <p className={`${getSubtextClasses()} mb-4`}>
              {getCategoryWords(category.id).length} words
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {getCategoryWords(category.id).slice(0, 6).map((word, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {word}
                </span>
              ))}
              {getCategoryWords(category.id).length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                  +{getCategoryWords(category.id).length - 6} more
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  setShowAddWords(true);
                }}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                disabled={category.id.startsWith('default-')}
              >
                Add Words
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm">
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Words Modal */}
      {showAddWords && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Add Words to {selectedCategory.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Single/Multiple Words (comma-separated)
                </label>
                <input
                  type="text"
                  value={newWords}
                  onChange={(e) => setNewWords(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="word1, word2, word3"
                />
                <button
                  onClick={handleAddWords}
                  className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Words
                </button>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Add (one word per line)
                </label>
                <textarea
                  value={bulkWords}
                  onChange={(e) => setBulkWords(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="word1&#10;word2&#10;word3"
                />
                <button
                  onClick={handleBulkAddWords}
                  className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Bulk Add Words
                </button>
              </div>

              <button
                onClick={() => {
                  setShowAddWords(false);
                  setSelectedCategory(null);
                  setNewWords('');
                  setBulkWords('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WordBank;