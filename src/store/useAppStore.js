import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

// Hardcoded admin credentials (hashed)
const ADMIN_EMAIL = 'ramanikrish2105@gmail.com';
const ADMIN_PASSWORD_HASH = CryptoJS.SHA256('rk777').toString();

export const useAppStore = create(
  persist(
    (set, get) => ({
      // User authentication
      currentUser: null,
      
      login: (email, password) => {
        const hashedPassword = CryptoJS.SHA256(password).toString();
        
        // Check hardcoded admin
        if (email === ADMIN_EMAIL && hashedPassword === ADMIN_PASSWORD_HASH) {
          const user = { email, isAdmin: true };
          set({ currentUser: user, isAdminLoggedIn: true });
          return { success: true, user };
        }
        
        return { success: false, error: 'Invalid email or password' };
      },
      
      logout: () => {
        set({ currentUser: null, isAdminLoggedIn: false });
      },

      // Legacy admin state (kept for backward compatibility)
      isAdminLoggedIn: false,
      loginAdmin: (password) => {
        const hashedPassword = CryptoJS.SHA256(password).toString();
        if (hashedPassword === ADMIN_PASSWORD_HASH) {
          set({ isAdminLoggedIn: true });
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ isAdminLoggedIn: false, currentUser: null }),

      // Dark mode
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Card display fields
      cardFrontFields: ['kanji'],
      cardBackFields: ['meaning', 'onyomi', 'kunyomi', 'examples'],
      setCardFrontFields: (fields) => set({ cardFrontFields: fields }),
      setCardBackFields: (fields) => set({ cardBackFields: fields }),

      // Current level
      currentLevel: 'N5',
      setCurrentLevel: (level) => set({ currentLevel: level }),
    }),
    {
      name: 'js-cards-app-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAdminLoggedIn: state.isAdminLoggedIn,
        darkMode: state.darkMode,
        cardFrontFields: state.cardFrontFields,
        cardBackFields: state.cardBackFields,
      }),
    }
  )
);
