# Multi-User Data Flow Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         JS Cards PWA                             │
│                  Multi-User Flashcard System                     │
└─────────────────────────────────────────────────────────────────┘
```

## User Authentication Flow

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │
     ├─────► Admin Login (email + password)
     │       │
     │       ├─► SHA256 Hash Check
     │       │
     │       └─► ✅ Success → Green Toast "Logged in as {email}"
     │
     └─────► Guest Login (no password)
             │
             └─► ✅ Success → Green Toast "Logged in as Guest"

┌──────────┐
│  Logout  │
│  Button  │
└────┬─────┘
     │
     ├─────► Clear Zustand State
     │
     ├─────► Green Toast "Logged out"
     │
     └─────► Redirect to /login
```

## Data Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         localStorage                             │
│                    (Zustand Persist)                             │
├─────────────────────────────────────────────────────────────────┤
│  Key: "js-cards-app-storage"                                    │
│                                                                  │
│  {                                                               │
│    currentUser: {                                                │
│      email: "ramanikrish2105@gmail.com",                        │
│      isAdmin: true                                               │
│    },                                                            │
│    darkMode: false,                                              │
│    cardFrontFields: ["kanji"],                                   │
│    cardBackFields: ["meaning", "onyomi", "kunyomi", "examples"] │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         IndexedDB                                │
│                      (jsCardsDB v3)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Store: kanji                                                    │
│  ├─ Key: kanji character                                        │
│  └─ Data: { kanji, meaning, onyomi[], kunyomi[], examples[] }  │
│                                                                  │
│  Store: progress (USER-SPECIFIC)                                │
│  ├─ Key: "{email}_{kanjiChar}"                                  │
│  └─ Data: {                                                      │
│       kanji: "ramanikrish2105@gmail.com_日",                    │
│       kanjiChar: "日",                                           │
│       userEmail: "ramanikrish2105@gmail.com",                   │
│       mastery: "known",                                          │
│       lastSeen: "2024-01-01T00:00:00.000Z",                     │
│       interval: 7                                                │
│     }                                                             │
│                                                                  │
│  Store: settings                                                 │
│  └─ Key: setting key                                             │
│                                                                  │
│  Store: scores                                                   │
│  └─ Key: auto-increment                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-User Progress Isolation

```
Admin User (ramanikrish2105@gmail.com)
├─ Progress Keys:
│  ├─ ramanikrish2105@gmail.com_日
│  ├─ ramanikrish2105@gmail.com_月
│  └─ ramanikrish2105@gmail.com_火
│
└─ Can:
   ├─ Edit kanji in Admin panel
   ├─ Save progress in Practice
   ├─ Take tests with due cards
   └─ View personal mastery stats

Guest User (guest)
├─ Progress Keys:
│  ├─ guest_日
│  ├─ guest_月
│  └─ guest_火
│
└─ Can:
   ├─ View all kanji
   ├─ Practice (but cannot save)
   ├─ Take tests (but cannot save)
   └─ See warning banners

❌ No Cross-Contamination
   Admin progress ≠ Guest progress
```

## Component Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.jsx                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Header                                                   │  │
│  │  ├─ currentUser from Zustand                             │  │
│  │  ├─ Logout button → handleLogout()                       │  │
│  │  └─ Shows toast on logout                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes                                                   │  │
│  │  ├─ /login → Login.jsx                                   │  │
│  │  ├─ /practice → Practice.jsx (Protected)                 │  │
│  │  ├─ /test → Test.jsx (Protected)                         │  │
│  │  ├─ /customize → Customize.jsx                           │  │
│  │  └─ /admin → Admin.jsx (Admin Only)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ToastContainer                                           │  │
│  │  └─ Shows login/logout toasts                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Practice.jsx                              │
│                                                                  │
│  1. Get currentUser from Zustand                                │
│  2. Extract userEmail = currentUser?.email || 'guest'           │
│  3. Call getDueCards(userEmail)                                 │
│  4. Display KanjiCard with onGuestAction callback               │
│  5. KanjiCard calls updateProgress(kanji, data, userEmail)      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Test.jsx                                 │
│                                                                  │
│  1. Get currentUser from Zustand                                │
│  2. Extract userEmail = currentUser?.email || 'guest'           │
│  3. Call getDueCards(userEmail) if "Use due cards" enabled      │
│  4. Display test questions                                      │
│  5. Save scores to IndexedDB                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Admin.jsx                                │
│                                                                  │
│  1. Get currentUser from Zustand                                │
│  2. Extract userEmail = currentUser?.email || 'guest'           │
│  3. Load kanji with getProgress(kanji, userEmail)               │
│  4. Display mastery badges for current user                     │
│  5. CRUD operations on kanji store                              │
└─────────────────────────────────────────────────────────────────┘
```

## Storage Function Signatures

```javascript
// Before (Single User)
updateProgress(kanjiChar, progressData)
getProgress(kanjiChar)
getDueCards()

// After (Multi-User)
updateProgress(kanjiChar, progressData, userEmail = 'guest')
getProgress(kanjiChar, userEmail = 'guest')
getDueCards(userEmail = 'guest')
```

## Toast Notification Flow

```
Login Success
├─ Admin: "Logged in as ramanikrish2105@gmail.com"
├─ Guest: "Logged in as Guest"
└─ Type: success (green background)

Logout
├─ Message: "Logged out"
├─ Type: success (green background)
└─ Action: Redirect to /login

Guest Action Blocked
├─ Message: "Login to save this progress"
├─ Type: warning (yellow background)
└─ Trigger: Hard/Known button click
```

## Offline Functionality

```
First Load (Online)
├─ Download all assets
├─ Service worker registers
├─ IndexedDB initialized
└─ User logs in → stored in localStorage

Subsequent Loads (Offline)
├─ Service worker serves cached assets
├─ User loaded from localStorage
├─ IndexedDB provides all data
└─ Full functionality available
```

## Security & Data Integrity

```
Password Security
└─ SHA256 hash: CryptoJS.SHA256('rk777').toString()

User Isolation
├─ Progress keys prefixed with email
├─ No shared state between users
└─ Complete data separation

Guest Protection
├─ Cannot save progress
├─ Yellow warning banner
└─ Toast on save attempt
```

## Summary

✅ **Multi-User Support**: Complete isolation via email-prefixed keys
✅ **Toast Notifications**: Login/logout feedback with auto-dismiss
✅ **Offline First**: localStorage + IndexedDB + Service Worker
✅ **Data Integrity**: No cross-contamination between users
✅ **Guest Mode**: Full read access, no write permissions
✅ **Admin Panel**: Full CRUD with user-specific progress view
