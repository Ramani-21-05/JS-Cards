import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import KanjiCard from '../components/KanjiCard';

const DEFAULT_FRONT = ['kanji'];
const DEFAULT_BACK = ['meaning', 'onyomi', 'kunyomi', 'examples'];

function Customize() {
  const { cardFrontFields, cardBackFields, setCardFrontFields, setCardBackFields } = useAppStore();

  const availableFields = [
    { id: 'kanji', name: 'Kanji Character', description: 'The kanji itself' },
    { id: 'meaning', name: 'Meaning', description: 'English translation' },
    { id: 'onyomi', name: "On'yomi", description: 'Chinese reading (katakana)' },
    { id: 'kunyomi', name: "Kun'yomi", description: 'Japanese reading (hiragana)' },
    { id: 'examples', name: 'Examples', description: 'Usage examples with readings' }
  ];

  const sampleKanji = {
    kanji: '日',
    meaning: 'sun, day',
    onyomi: ['ニチ', 'ジツ'],
    kunyomi: ['ひ', 'か'],
    examples: [
      {japanese: '日本', reading: 'にほん', english: 'Japan'},
      {japanese: '毎日', reading: 'まいにち', english: 'every day'}
    ]
  };

  const handleFrontChange = (field) => {
    const newFields = cardFrontFields.includes(field)
      ? cardFrontFields.filter(f => f !== field)
      : [...cardFrontFields, field];
    setCardFrontFields(newFields);
  };

  const handleBackChange = (field) => {
    const newFields = cardBackFields.includes(field)
      ? cardBackFields.filter(f => f !== field)
      : [...cardBackFields, field];
    setCardBackFields(newFields);
  };

  const handleReset = () => {
    setCardFrontFields(DEFAULT_FRONT);
    setCardBackFields(DEFAULT_BACK);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold dark:text-white">Customize Card Display</h2>
        <button
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Front Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🎴</span> Front Side
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select what to show before flipping
          </p>
          <div className="space-y-3">
            {availableFields.map(field => (
              <label
                key={field.id}
                className="flex items-start cursor-pointer p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <input
                  type="checkbox"
                  checked={cardFrontFields.includes(field.id)}
                  onChange={() => handleFrontChange(field.id)}
                  className="mt-1 mr-3 w-5 h-5 text-red-500"
                />
                <div>
                  <p className="font-semibold dark:text-white">{field.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Tip: Keep front side simple for better memorization
            </p>
          </div>
        </motion.div>

        {/* Back Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🔄</span> Back Side
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select what to reveal after flipping
          </p>
          <div className="space-y-3">
            {availableFields.map(field => (
              <label
                key={field.id}
                className="flex items-start cursor-pointer p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <input
                  type="checkbox"
                  checked={cardBackFields.includes(field.id)}
                  onChange={() => handleBackChange(field.id)}
                  className="mt-1 mr-3 w-5 h-5 text-red-500"
                />
                <div>
                  <p className="font-semibold dark:text-white">{field.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded">
            <p className="text-xs text-green-700 dark:text-green-300">
              ✅ Changes save automatically
            </p>
          </div>
        </motion.div>

        {/* Live Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:row-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
              <span className="text-2xl">👁️</span> Live Preview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              See how your card will look
            </p>
            <motion.div
              key={`${cardFrontFields.join(',')}-${cardBackFields.join(',')}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <KanjiCard kanji={sampleKanji} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Field Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <h3 className="text-lg font-bold mb-4 dark:text-white">Current Configuration</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Front Side Fields:</p>
            <div className="flex flex-wrap gap-2">
              {cardFrontFields.length > 0 ? (
                cardFrontFields.map(field => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-sm font-medium"
                  >
                    {field}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-sm italic">No fields selected</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Back Side Fields:</p>
            <div className="flex flex-wrap gap-2">
              {cardBackFields.length > 0 ? (
                cardBackFields.map(field => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    {field}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-sm italic">No fields selected</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Customize;
