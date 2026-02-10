import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    console.log('InstallButton: Component mounted');
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInStandaloneMode = window.navigator.standalone || isStandalone;
    console.log('InstallButton: Is standalone?', isInStandaloneMode);
    
    if (isInStandaloneMode) {
      console.log('InstallButton: Already installed, hiding button');
      setShowInstall(false);
      return;
    }

    const handler = (e) => {
      console.log('InstallButton: beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);

    // Fallback: Show button after 3 seconds if event hasn't fired (for testing)
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt) {
        console.log('InstallButton: Showing fallback button (no event yet)');
        setShowInstall(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('InstallButton: No deferred prompt available');
      alert('Install not available yet. Try:\n1. Refresh the page\n2. Wait a few seconds\n3. Check Chrome menu for "Install app"');
      return;
    }
    
    console.log('InstallButton: Prompting install...');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`InstallButton: Install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstall(false);
    
    if (outcome === 'accepted') {
      alert('JS Cards installed! Find it on your home screen.');
    }
  };

  if (!showInstall) {
    console.log('InstallButton: Button hidden (showInstall=false)');
    return null;
  }

  console.log('InstallButton: Rendering button');
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
