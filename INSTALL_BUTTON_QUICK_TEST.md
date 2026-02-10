# Install Button - Quick Test

## ✅ What Was Added

**New Component:** `src/components/InstallButton.jsx`
- Listens for `beforeinstallprompt` event
- Shows orange "Install App" button (bottom-right)
- Handles PWA installation
- Auto-hides if already installed

**Updated:** `src/App.jsx`
- Added `<InstallButton />` component
- Visible on all pages

## 🧪 Quick Test

### 1. Local Preview (Optional)
```bash
npm run build
npm run preview
# Open http://localhost:4173
# Button may appear after 5-10 seconds
```

### 2. Deploy to Vercel
```bash
# Already pushed to GitHub - Vercel auto-deploys
# OR manually:
vercel --prod
```

### 3. Test on Mobile Chrome
1. Open your Vercel URL on mobile
2. Wait 5-10 seconds
3. Orange "Install App" button appears bottom-right
4. Tap button → Native install dialog shows
5. Tap "Install" → App installs
6. Alert: "JS Cards installed! Find it on your home screen."
7. Button disappears (already installed)

## 🎯 Expected Behavior

### Button Appears When:
✅ PWA criteria met (HTTPS, manifest, service worker)
✅ Not already installed
✅ `beforeinstallprompt` event fires

### Button Hidden When:
❌ Already installed (standalone mode)
❌ Install not available

### After Install:
✅ Icon on home screen
✅ Opens without browser UI
✅ Works offline
✅ Install button no longer visible

## 🔍 Troubleshooting

**Button not showing?**
- Wait 10-30 seconds after page load
- Refresh page
- Check if already installed (look for icon on home screen)
- Try in incognito mode

**Console debug:**
```javascript
// Check in browser console:
window.matchMedia('(display-mode: standalone)').matches
// false = not installed, button should appear
// true = already installed, button hidden
```

## ✅ Success = Orange Button Appears!

If you see the orange "Install App" button bottom-right on mobile Chrome, it's working! Tap it to install.
