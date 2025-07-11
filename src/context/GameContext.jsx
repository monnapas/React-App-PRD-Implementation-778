import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [wordBanks, setWordBanks] = useState([]);
  const [presets, setPresets] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [displayMode, setDisplayMode] = useState('normal'); // normal, senior, live
  const [loading, setLoading] = useState(false);

  // Default categories and words
  const defaultCategories = [
    {
      id: 'default-nouns',
      name: 'Nouns',
      words: ['apple', 'book', 'car', 'dog', 'elephant', 'flower', 'guitar', 'house', 'island', 'jacket']
    },
    {
      id: 'default-verbs',
      name: 'Verbs',
      words: ['run', 'jump', 'swim', 'dance', 'sing', 'write', 'read', 'cook', 'play', 'sleep']
    },
    {
      id: 'default-adjectives',
      name: 'Adjectives',
      words: ['happy', 'sad', 'big', 'small', 'fast', 'slow', 'beautiful', 'ugly', 'smart', 'funny']
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Load default categories for non-authenticated users
      setCategories(defaultCategories);
      setWordBanks([]);
      setPresets([]);
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      // Load word banks
      const { data: wordBanksData } = await supabase
        .from('word_banks')
        .select('*')
        .eq('user_id', user.id);

      // Load presets
      const { data: presetsData } = await supabase
        .from('presets')
        .select('*')
        .eq('user_id', user.id);

      // Load game history
      const { data: historyData } = await supabase
        .from('game_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setCategories([...defaultCategories, ...(categoriesData || [])]);
      setWordBanks(wordBanksData || []);
      setPresets(presetsData || []);
      setGameHistory(historyData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setCategories(prev => [...prev, data]);
    }
    return { data, error };
  };

  const addWordsToCategory = async (categoryId, words) => {
    if (!user) return;

    const wordsToAdd = words.map(word => ({
      word: word.trim(),
      category_id: categoryId,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('word_banks')
      .insert(wordsToAdd)
      .select();

    if (!error && data) {
      setWordBanks(prev => [...prev, ...data]);
    }
    return { data, error };
  };

  const savePreset = async (name, config) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('presets')
      .insert([{
        name,
        config,
        user_id: user.id
      }])
      .select()
      .single();

    if (!error && data) {
      setPresets(prev => [...prev, data]);
    }
    return { data, error };
  };

  const saveGameHistory = async (gameData) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('game_history')
      .insert([{
        ...gameData,
        user_id: user.id
      }])
      .select()
      .single();

    if (!error && data) {
      setGameHistory(prev => [data, ...prev]);
    }
    return { data, error };
  };

  const value = {
    categories,
    wordBanks,
    presets,
    gameHistory,
    currentGame,
    displayMode,
    loading,
    setCurrentGame,
    setDisplayMode,
    createCategory,
    addWordsToCategory,
    savePreset,
    saveGameHistory,
    loadUserData
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};