import { useState } from 'react';
import { motion } from 'framer-motion';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';
import { updateProgress } from '../utils/storage';

function KanjiCard({ kanji, onSubmit, onGuestAction }) {
  const { cardFrontFields, cardBackFields, currentUser } = useAppStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctAnswer = kanji.meaning?.toLowerCase() || '';
    const answer = userAnswer.toLowerCase().trim();
    const correct = correctAnswer.includes(answer) || answer.includes(correctAnswer);
    setIsCorrect(correct);
    setIsFlipped(true);
    if (onSubmit) onSubmit(correct);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setUserAnswer('');
    setIsCorrect(null);
  };

  const handleMarkKnown = async () => {
    if (currentUser?.email === 'guest') {
      if (onGuestAction) onGuestAction('Login to save this progress');
      return;
    }
    const userEmail = currentUser?.email || 'guest';
    await updateProgress(kanji.kanji, { mastery: 'known', interval: 7 }, userEmail);
    handleReset();
  };

  const handleMarkHard = async () => {
    if (currentUser?.email === 'guest') {
      if (onGuestAction) onGuestAction('Login to save this progress');
      return;
    }
    const userEmail = currentUser?.email || 'guest';
    await updateProgress(kanji.kanji, { mastery: 'learning', interval: 1 }, userEmail);
    handleReset();
  };

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(kanji.kanji);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderField = (field, size = 'normal') => {
    if (field === 'kanji') {
      return <p className="text-6xl sm:text-8xl font-bold text-gray-800 dark:text-white">{kanji[field]}</p>;
    }
    if (field === 'meaning') {
      return <p className={`${size === 'large' ? 'text-2xl' : 'text-lg'} text-gray-700 dark:text-gray-300`}>{kanji[field]}</p>;
    }
    if (field === 'onyomi') {
      return (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">On'yomi</p>
          <p className="text-lg text-gray-800 dark:text-gray-200">{kanji.onyomi?.join('、') || 'N/A'}</p>
        </div>
      );
    }
    if (field === 'kunyomi') {
      return (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kun'yomi</p>
          <p className="text-lg text-gray-800 dark:text-gray-200">{kanji.kunyomi?.join('、') || 'N/A'}</p>
        </div>
      );
    }
    if (field === 'examples' && kanji.examples) {
      return (
        <div className="w-full">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Examples</p>
          <ul className="text-sm space-y-1">
            {kanji.examples.slice(0, 2).map((ex, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                <span className="font-bold">{ex.japanese}</span> ({ex.reading}) - {ex.english}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full h-96 sm:h-[28rem]"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        {/* Front */}
        <motion.div
          className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {cardFrontFields.map((field) => (
            <div key={field} className="text-center mb-4">
              {renderField(field, 'large')}
            </div>
          ))}
          <form onSubmit={handleSubmit} className="w-full mt-auto">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter meaning..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded mb-4 text-center"
            />
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
              aria-label="Submit answer and flip card"
            >
              Submit & Flip
            </button>
          </form>
        </motion.div>

        {/* Back */}
        <motion.div
          className={`absolute w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col items-center overflow-y-auto ${
            isCorrect === true ? 'border-4 border-green-500' : isCorrect === false ? 'border-4 border-red-500' : ''
          }`}
          style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
        >
          {isCorrect !== null && (
            <div className={`w-full text-center mb-4 p-2 rounded ${isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <p className={`font-bold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your answer: {userAnswer}</p>
            </div>
          )}

          {/* Audio Button */}
          <button
            onClick={handlePlayAudio}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            title="Play pronunciation"
          >
            <SpeakerWaveIcon className="w-5 h-5" />
            Play Reading
          </button>

          <div className="space-y-3 w-full mb-4">
            {cardBackFields.map((field) => (
              <div key={field} className="text-center">
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-auto w-full">
            <button
              onClick={handleMarkHard}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded transition text-sm"
              aria-label="Mark as hard to review sooner"
            >
              Hard
            </button>
            <button
              onClick={handleMarkKnown}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition text-sm"
              aria-label="Mark as known"
            >
              Known
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded transition text-sm"
              aria-label="Reset card to front"
            >
              Reset
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default KanjiCard;
