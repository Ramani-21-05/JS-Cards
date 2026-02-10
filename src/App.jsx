import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAppStore } from './store/useAppStore';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Practice from './pages/Practice';
import Test from './pages/Test';
import Customize from './pages/Customize';
import Admin from './pages/Admin';

function Header({ onShowToast }) {
  const { darkMode, toggleDarkMode, currentUser, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onShowToast) {
      onShowToast('Logged out', 'success');
    }
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white hover:text-red-500 transition">
            JS Cards
          </Link>
          
          <div className="flex items-center gap-4">
            <nav className="flex gap-3 sm:gap-6 text-sm sm:text-base">
              <Link to="/practice" className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition">Practice</Link>
              <Link to="/test" className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition">Test</Link>
              <Link to="/customize" className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition">Customize</Link>
              {currentUser?.isAdmin && (
                <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition">Admin</Link>
              )}
            </nav>

            <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {currentUser.email === 'guest' ? 'Guest' : currentUser.email.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
                    aria-label="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Login / Sign Up
                </Link>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [toasts, setToasts] = useState([]);
  const { darkMode } = useAppStore();

  const addToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onShowToast={addToast} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onShowToast={addToast} />} />
            <Route path="/practice" element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            } />
            <Route path="/test" element={
              <ProtectedRoute>
                <Test />
              </ProtectedRoute>
            } />
            <Route path="/customize" element={<Customize />} />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </BrowserRouter>
  );
}

export default App;
