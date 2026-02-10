# JS Cards

> Offline JLPT N5 Kanji Flashcards PWA with Spaced Repetition & Multi-User Support

## Features

- **Practice Mode** - Spaced repetition flashcards with progress tracking
- **Test Mode** - Customizable quizzes (10/20/50 questions) with multiple test types
- **Customize** - Live preview of card display preferences
- **Admin Panel** - Full CRUD with sortable table, bulk import, and modals
- **Multi-User Support** - Isolated progress tracking per user email
- **Dark Mode** - Toggle between light and dark themes
- **Audio Pronunciation** - Web Speech API for Japanese readings
- **Offline First** - IndexedDB + Service Worker caching
- **Mobile Ready** - Responsive design for all devices
- **Toast Notifications** - Login/logout feedback with auto-dismiss

## Quick Start

```bash
npm install
npm run dev
```

## Admin Credentials

- **Email**: ramanikrish2105@gmail.com
- **Password**: rk777

## Build & Test PWA

```bash
npm run build
npm run preview
```

Open http://localhost:4173, then:
1. DevTools → Application → Service Workers
2. Enable "Offline" mode
3. Reload - app works offline ✓
4. Install PWA via browser prompt

## Multi-User Testing

1. Login as admin → practice kanji → logout
2. Login as guest → practice same kanji
3. Verify progress is isolated per user
4. Login as admin again → edits persist ✓

## Deploy

```bash
# Vercel
vercel

# Netlify
netlify deploy --prod
```

## Stack

React • Vite • Tailwind CSS • Framer Motion • Headless UI • Zustand • IndexedDB • PWA
