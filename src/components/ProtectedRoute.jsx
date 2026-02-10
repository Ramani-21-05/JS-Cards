import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser } = useAppStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !currentUser.isAdmin) {
    return <Navigate to="/login" state={{ from: location, message: 'Admin access only' }} replace />;
  }

  return children;
}

export function GuestWarning() {
  const { currentUser } = useAppStore();

  if (currentUser?.email === 'guest') {
    return (
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              You are using as Guest
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
              Progress will NOT save after closing browser or clearing cache. Login to save your mastery levels!
            </p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded transition"
            >
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
