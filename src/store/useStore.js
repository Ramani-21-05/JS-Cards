import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // Admin state
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),

      // User settings
      frontFields: ['kanji'],
      backFields: ['meaning', 'reading'],
      setFrontFields: (fields) => set({ frontFields: fields }),
      setBackFields: (fields) => set({ backFields: fields }),

      // Dark mode
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Progress tracking
      practiceProgress: { seen: 0, correct: 0 },
      updatePracticeProgress: (progress) => set({ practiceProgress: progress }),
      resetPracticeProgress: () => set({ practiceProgress: { seen: 0, correct: 0 } }),
    }),
    {
      name: 'js-cards-storage',
    }
  )
);
