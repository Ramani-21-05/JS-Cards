# PWA Quick Test - Mobile Chrome

## 🚀 After Vercel Deploys

### 1. Open on Mobile Chrome
```
https://your-app.vercel.app
```

### 2. Wait for Install Prompt (30 seconds)
- Banner appears: "Add JS Cards to Home screen"
- Tap "Add" or "Install"

### 3. OR Force Install
- Tap Chrome menu (⋮)
- Tap "Install app" or "Add to Home screen"

### 4. Verify
- ✅ Icon on home screen
- ✅ Opens without browser UI
- ✅ Works offline

## 🔍 Debug (if prompt doesn't appear)

### On Desktop:
```bash
# 1. Build
npm run build

# 2. Preview
npm run preview

# 3. Open http://localhost:4173
# 4. DevTools → Application → Manifest
# 5. Check: No errors, icons load
```

### On Mobile:
1. Chrome menu → "Install app" should be visible
2. If not, check:
   - HTTPS enabled? (Vercel = yes)
   - Manifest loads? (visit /manifest.webmanifest)
   - Icons load? (visit /pwa-192x192.png)
   - Service worker active? (DevTools → Application)

## ✅ Success = Install Prompt Appears!

If you see "Add to Home screen" or "Install app" in Chrome menu, your PWA is working correctly!
