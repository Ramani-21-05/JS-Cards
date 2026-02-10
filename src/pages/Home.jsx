import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AcademicCapIcon, ClipboardDocumentCheckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to JS Cards
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Advanced Offline JLPT N5 Kanji Flashcards
        </p>
        <p className="text-gray-500 dark:text-gray-500">
          Master Japanese kanji with spaced repetition, customizable cards, and offline support
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6 mb-12"
      >
        <Link
          to="/practice"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition group"
        >
          <AcademicCapIcon className="w-12 h-12 text-red-500 mb-4 group-hover:scale-110 transition" />
          <h3 className="text-xl font-bold dark:text-white mb-2">Practice</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Study with spaced repetition and track your progress
          </p>
        </Link>

        <Link
          to="/test"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition group"
        >
          <ClipboardDocumentCheckIcon className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition" />
          <h3 className="text-xl font-bold dark:text-white mb-2">Test</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Quiz yourself with customizable tests and track scores
          </p>
        </Link>

        <Link
          to="/customize"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 hover:shadow-xl transition group"
        >
          <Cog6ToothIcon className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition" />
          <h3 className="text-xl font-bold dark:text-white mb-2">Customize</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Personalize your flashcard display preferences
          </p>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-lg p-8 text-white"
      >
        <h3 className="text-2xl font-bold mb-4">Currently Available</h3>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-lg px-6 py-3">
            <p className="text-3xl font-bold">N5</p>
          </div>
          <div>
            <p className="font-semibold">JLPT N5 Level</p>
            <p className="text-sm opacity-90">20 essential kanji characters</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <p>✨ Works completely offline • 🌙 Dark mode • 🔊 Audio pronunciation</p>
      </motion.div>
    </div>
  );
}

export default Home;
