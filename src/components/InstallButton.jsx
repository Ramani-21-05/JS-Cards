import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Hide if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstall(false);
    if (outcome === 'accepted') {
      alert('JS Cards installed! Find it on your home screen.');
    }
  };

  if (!showInstall) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg z-50 font-bold flex items-center gap-2 transition-transform hover:scale-105"
      aria-label="Install JS Cards app"
    >
      <ArrowDownTrayIcon className="w-5 h-5" />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
}
