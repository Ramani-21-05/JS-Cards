import { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, ClockIcon } from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';
import { initDB, loadDefaultData, getAllKanji, getDueCards, saveScore, getAllScores } from '../utils/storage';
import { GuestWarning } from '../components/ProtectedRoute';
import { useAppStore } from '../store/useAppStore';

const QUESTION_COUNTS = [10, 20, 50];
const TEST_TYPES = [
  { id: 'meaning', name: 'Kanji → Meaning', question: 'kanji', answer: 'meaning' },
  { id: 'reading', name: 'Kanji → Reading', question: 'kanji', answer: 'onyomi' },
  { id: 'reverse', name: 'Meaning → Kanji', question: 'meaning', answer: 'kanji' }
];

function Test() {
  const { currentUser } = useAppStore();
  const [stage, setStage] = useState('setup'); // setup, testing, results, history
  const [questionCount, setQuestionCount] = useState(10);
  const [testType, setTestType] = useState(TEST_TYPES[0]);
  const [useDueCards, setUseDueCards] = useState(false);
  const [useTimer, setUseTimer] = useState(true);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    loadScoreHistory();
  }, []);

  useEffect(() => {
    if (stage === 'testing') {
      const interval = setInterval(() => {
        setTimer(t => t + 1);
        if (useTimer) {
          setCountdown(c => {
            if (c <= 1) {
              handleFinish();
              return 0;
            }
            return c - 1;
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage, useTimer]);

  const loadScoreHistory = async () => {
    const scores = await getAllScores();
    setScoreHistory(scores);
  };

  const startTest = async () => {
    await initDB();
    await loadDefaultData();
    
    const userEmail = currentUser?.email || 'guest';
    let pool = [];
    if (useDueCards) {
      const dueChars = await getDueCards(userEmail);
      const allKanji = await getAllKanji();
      pool = allKanji.filter(k => dueChars.includes(k.kanji));
    } else {
      pool = await getAllKanji();
    }
    
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, questionCount);
    setQuestions(shuffled);
    setStage('testing');
    setTimer(0);
    setCountdown(300);
  };

  const handleAnswerChange = (e) => {
    setAnswers({ ...answers, [currentIndex]: e.target.value });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    let correct = 0;
    const resultsList = questions.map((q, idx) => {
      const userAnswer = (answers[idx] || '').toLowerCase().trim();
      let correctAnswer = '';
      
      if (testType.answer === 'meaning') {
        correctAnswer = q.meaning?.toLowerCase() || '';
      } else if (testType.answer === 'onyomi') {
        correctAnswer = q.onyomi?.join('、').toLowerCase() || '';
      } else if (testType.answer === 'kanji') {
        correctAnswer = q.kanji?.toLowerCase() || '';
      }
      
      const isCorrect = correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer);
      if (isCorrect) correct++;
      
      return { question: q, userAnswer, correctAnswer, isCorrect };
    });
    
    setScore(correct);
    setResults(resultsList);
    setStage('results');
    
    await saveScore({
      score: correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      time: timer,
      testType: testType.name,
      questionCount: questions.length
    });
    
    loadScoreHistory();
  };

  const handleRestart = () => {
    setStage('setup');
    setCurrentIndex(0);
    setAnswers({});
    setQuestions([]);
    setScore(0);
    setResults([]);
  };

  if (stage === 'history') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Test History</h2>
          <button
            onClick={() => setStage('setup')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition"
          >
            Back
          </button>
        </div>
        <div className="space-y-4">
          {scoreHistory.map((s, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold dark:text-white">{s.testType}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-500">{s.score}/{s.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{s.percentage}% • {Math.floor(s.time / 60)}:{(s.time % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Test Complete!</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
            <p className="text-6xl font-bold text-red-500 mb-4">{score}/{questions.length}</p>
            <p className="text-2xl text-gray-700 dark:text-gray-300 mb-2">{Math.round((score / questions.length) * 100)}%</p>
            <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
              <ClockIcon className="w-5 h-5" />
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-bold mb-4 dark:text-white">Review:</h3>
          <div className="space-y-3">
            {results.map((r, idx) => (
              <div
                key={idx}
                className={`p-4 rounded ${
                  r.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}
              >
                <p className="font-bold text-2xl mb-1">
                  {testType.question === 'kanji' ? r.question.kanji : r.question.meaning}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your answer: <span className="font-semibold">{r.userAnswer || '(no answer)'}</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Correct: <span className="font-semibold">{r.correctAnswer}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded transition"
          >
            New Test
          </button>
          <button
            onClick={() => setStage('history')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded transition"
          >
            View History
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'testing') {
    const currentQuestion = questions[currentIndex];
    const questionText = testType.question === 'kanji' ? currentQuestion.kanji : currentQuestion.meaning;

    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-400">
            <p>Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            {useTimer && (
              <div className={`flex items-center gap-2 ${
                countdown < 60 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
              }`}>
                <ClockIcon className="w-5 h-5" />
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </div>
            )}
            <div className="text-gray-600 dark:text-gray-400">
              Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{testType.name}</p>
            <p className="text-6xl sm:text-8xl font-bold text-gray-800 dark:text-white text-center mb-8">
              {questionText}
            </p>
            <input
              type="text"
              value={answers[currentIndex] || ''}
              onChange={handleAnswerChange}
              placeholder="Your answer..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-center text-lg"
              autoFocus
            />
          </motion.div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold px-6 py-2 rounded transition"
            >
              Previous
            </button>
            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleFinish}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2 rounded transition"
              >
                Finish Test
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Setup stage
  return (
    <div className="max-w-2xl mx-auto">
      <GuestWarning />
      
      <h2 className="text-3xl font-bold mb-8 text-center dark:text-white">Test Setup</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
        {/* Question Count */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Number of Questions
          </label>
          <Listbox value={questionCount} onChange={setQuestionCount}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-3 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 dark:text-white">
                <span className="block truncate">{questionCount} questions</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg z-10">
                  {QUESTION_COUNTS.map((count) => (
                    <Listbox.Option
                      key={count}
                      value={count}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-red-100 dark:bg-red-900' : ''
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate dark:text-white ${selected ? 'font-semibold' : 'font-normal'}`}>
                            {count} questions
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-500">
                              <CheckIcon className="h-5 w-5" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Test Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Test Type
          </label>
          <Listbox value={testType} onChange={setTestType}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-3 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 dark:text-white">
                <span className="block truncate">{testType.name}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg z-10">
                  {TEST_TYPES.map((type) => (
                    <Listbox.Option
                      key={type.id}
                      value={type}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-red-100 dark:bg-red-900' : ''
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate dark:text-white ${selected ? 'font-semibold' : 'font-normal'}`}>
                            {type.name}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-500">
                              <CheckIcon className="h-5 w-5" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useDueCards}
              onChange={(e) => setUseDueCards(e.target.checked)}
              className="w-5 h-5 mr-3"
            />
            <span className="dark:text-gray-300">Use only due cards (spaced repetition)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useTimer}
              onChange={(e) => setUseTimer(e.target.checked)}
              className="w-5 h-5 mr-3"
            />
            <span className="dark:text-gray-300">Enable countdown timer (5 minutes)</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={startTest}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded transition"
          >
            Start Test
          </button>
          <button
            onClick={() => setStage('history')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded transition"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

export default Test;
