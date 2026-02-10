import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initDB, loadDefaultData, getDueCards, getKanjiByChar, getAllKanji } from '../utils/storage';
import { GuestWarning } from '../components/ProtectedRoute';
import { useAppStore } from '../store/useAppStore';
import KanjiCard from '../components/KanjiCard';
import Loading from '../components/Loading';

function Practice() {
  const { currentUser } = useAppStore();
  const [dueKanjiChars, setDueKanjiChars] = useState([]);
  const [currentKanji, setCurrentKanji] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [stats, setStats] = useState({ total: 0, known: 0, learning: 0, new: 0 });
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadPracticeData();
  }, [currentUser]);

  const loadPracticeData = async () => {
    await initDB();
    await loadDefaultData();
    
    const userEmail = currentUser?.email || 'guest';
    const dueChars = await getDueCards(userEmail);
    const allKanji = await getAllKanji();
    
    // Calculate stats
    const progressData = await Promise.all(
      allKanji.map(async (k) => {
        const { getProgress } = await import('../utils/storage');
        return getProgress(k.kanji, userEmail);
      })
    );
    
    const known = progressData.filter(p => p?.mastery === 'known').length;
    const learning = progressData.filter(p => p?.mastery === 'learning').length;
    const newCards = progressData.filter(p => p?.mastery === 'new' || !p).length;
    
    setStats({ total: allKanji.length, known, learning, new: newCards });
    setDueKanjiChars(shuffle ? dueChars.sort(() => Math.random() - 0.5) : dueChars);
    
    if (dueChars.length > 0) {
      const firstKanji = await getKanjiByChar(dueChars[0]);
      setCurrentKanji(firstKanji);
    }
    
    setLoading(false);
  };

  const handleCardSubmit = (isCorrect) => {
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0
    }));
  };

  const handleNext = async () => {
    if (currentIndex < dueKanjiChars.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextKanji = await getKanjiByChar(dueKanjiChars[nextIndex]);
      setCurrentKanji(nextKanji);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...dueKanjiChars].sort(() => Math.random() - 0.5);
    setDueKanjiChars(shuffled);
    setShuffle(!shuffle);
  };

  const handleEndSession = () => {
    alert(`Session complete!\nReviewed: ${sessionStats.reviewed}\nCorrect: ${sessionStats.correct}\nBest streak: ${sessionStats.streak}`);
    setSessionStats({ reviewed: 0, correct: 0, streak: 0 });
    loadPracticeData();
  };

  if (loading) {
    return <Loading message="Loading practice session..." />;
  }

  if (dueKanjiChars.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">No Cards Due!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">You've reviewed all due cards. Great job!</p>
        <button
          onClick={loadPracticeData}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <GuestWarning />
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">Practice Mode</h2>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-green-700 dark:text-green-300">Known</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.known}</p>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Learning</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.learning}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg shadow p-4 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300">New</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.new}</p>
          </div>
        </div>

        {/* Session Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="dark:text-gray-300">Progress: {currentIndex + 1}/{dueKanjiChars.length}</span>
            <span className="dark:text-gray-300">Reviewed: {sessionStats.reviewed}</span>
            <span className="dark:text-gray-300">Correct: {sessionStats.correct}</span>
            <span className="dark:text-gray-300">Streak: 🔥 {sessionStats.streak}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleShuffle}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition text-sm"
          >
            {shuffle ? '🔀 Shuffled' : '🔀 Shuffle'}
          </button>
          <button
            onClick={handleEndSession}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded transition text-sm"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        {currentKanji && (
          <motion.div
            key={currentKanji.kanji}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <KanjiCard kanji={currentKanji} onSubmit={handleCardSubmit} onGuestAction={showToast} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          {toast}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleNext}
          disabled={currentIndex === dueKanjiChars.length - 1}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold px-8 py-2 rounded transition"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}

export default Practice;
