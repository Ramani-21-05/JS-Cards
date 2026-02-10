// User-specific progress management
export function getUserProgressKey(userEmail) {
  if (!userEmail || userEmail === 'guest') {
    return 'guest_progress';
  }
  return `progress_${userEmail}`;
}

export function saveUserProgress(userEmail, progressData) {
  const key = getUserProgressKey(userEmail);
  try {
    localStorage.setItem(key, JSON.stringify(progressData));
  } catch (error) {
    console.error('Failed to save user progress:', error);
  }
}

export function getUserProgress(userEmail) {
  const key = getUserProgressKey(userEmail);
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get user progress:', error);
    return null;
  }
}

export function clearGuestProgress() {
  try {
    localStorage.removeItem('guest_progress');
  } catch (error) {
    console.error('Failed to clear guest progress:', error);
  }
}
