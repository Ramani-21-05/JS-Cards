# Quick Testing Guide

## 🚀 Start the App

```bash
cd js-cards
npm run dev
```

Open: http://localhost:5173

## 🧪 Quick Test (5 minutes)

### 1. Admin Login & Edit (2 min)
```
1. Click "Login / Sign Up"
2. Enter:
   Email: ramanikrish2105@gmail.com
   Password: rk777
3. ✅ Check: Green toast "Logged in as ramanikrish2105@gmail.com"
4. Click "Practice"
5. Click "Submit & Flip" on first card
6. Click "Known" button
7. ✅ Check: Card marked as known (no toast)
8. Click "Logout" in header
9. ✅ Check: Green toast "Logged out"
10. ✅ Check: Redirected to /login
```

### 2. Guest Mode (1 min)
```
1. Click "Continue as Guest"
2. ✅ Check: Green toast "Logged in as Guest"
3. Click "Practice"
4. ✅ Check: Yellow warning banner at top
5. Click "Submit & Flip" on first card
6. Click "Known" button
7. ✅ Check: Yellow toast "Login to save this progress"
8. Click "Logout"
```

### 3. Admin Persistence (2 min)
```
1. Login as admin again (ramanikrish2105@gmail.com / rk777)
2. ✅ Check: Green toast appears
3. Click "Practice"
4. ✅ Check: Card from step 1.6 still shows as "Known" in stats
5. Click "Admin"
6. ✅ Check: Same card shows green "known" badge
7. ✅ SUCCESS: Admin edits persisted!
```

## 🔬 Detailed Test (15 minutes)

### Test 1: Multi-User Isolation
```
Admin Session:
1. Login as admin
2. Practice → Mark 日 as "Known"
3. Practice → Mark 月 as "Known"
4. Check stats: 2 Known
5. Logout

Guest Session:
6. Login as guest
7. Practice → Check stats: 0 Known (all new)
8. Try to mark 日 as "Known"
9. ✅ Check: Yellow toast appears
10. Logout

Admin Session Again:
11. Login as admin
12. Practice → Check stats: 2 Known
13. ✅ SUCCESS: Admin progress preserved!
```

### Test 2: Offline Mode
```
1. Login as admin
2. Mark 3 kanji as "Known"
3. Open DevTools (F12)
4. Application → Service Workers
5. Check "Offline" checkbox
6. Refresh page (F5)
7. ✅ Check: Still logged in (no redirect)
8. ✅ Check: Can navigate to Practice
9. ✅ Check: Stats show 3 Known
10. ✅ SUCCESS: Offline works!
```

### Test 3: Toast Notifications
```
1. Login as admin
   ✅ Green toast: "Logged in as ramanikrish2105@gmail.com"
   ✅ Auto-dismisses after 5 seconds

2. Logout
   ✅ Green toast: "Logged out"
   ✅ Auto-dismisses after 5 seconds

3. Login as guest
   ✅ Green toast: "Logged in as Guest"
   ✅ Auto-dismisses after 5 seconds

4. Practice → Try to save
   ✅ Yellow toast: "Login to save this progress"
   ✅ Auto-dismisses after 3 seconds
```

### Test 4: Admin Panel
```
1. Login as admin
2. Click "Admin"
3. ✅ Check: Table shows all kanji
4. ✅ Check: Mastery badges show your progress
5. Click "Edit" on any kanji
6. Change meaning
7. Click "Update"
8. ✅ Check: Change saved
9. Logout and login again
10. ✅ Check: Edit still there
```

### Test 5: Test Mode
```
1. Login as admin
2. Practice → Mark 5 kanji as "Known"
3. Click "Test"
4. Enable "Use only due cards"
5. Start test
6. ✅ Check: Known kanji not in test
7. Complete test
8. ✅ Check: Score saved to history
9. Logout and login as guest
10. Click "Test"
11. Enable "Use only due cards"
12. ✅ Check: All kanji available (guest has no progress)
```

## 🐛 Common Issues & Solutions

### Issue: Toast doesn't appear
**Solution**: Check browser console for errors, ensure App.jsx passes onShowToast prop

### Issue: Progress not saving
**Solution**: Check if logged in as guest (guest cannot save)

### Issue: Admin edits lost after logout
**Solution**: Check IndexedDB in DevTools → Application → IndexedDB → jsCardsDB → progress

### Issue: Offline mode not working
**Solution**: Build first with `npm run build`, then `npm run preview`

## 📊 Expected Results

### localStorage (DevTools → Application → Local Storage)
```json
{
  "js-cards-app-storage": {
    "state": {
      "currentUser": {
        "email": "ramanikrish2105@gmail.com",
        "isAdmin": true
      }
    }
  }
}
```

### IndexedDB (DevTools → Application → IndexedDB → jsCardsDB)
```
progress store:
├─ ramanikrish2105@gmail.com_日 (admin progress)
├─ ramanikrish2105@gmail.com_月 (admin progress)
├─ guest_日 (guest progress - if any)
└─ guest_月 (guest progress - if any)
```

## ✅ Success Checklist

After testing, verify:

- [ ] Admin login shows green toast with email
- [ ] Guest login shows green toast "Logged in as Guest"
- [ ] Logout shows green toast and redirects
- [ ] Admin can save progress
- [ ] Guest cannot save progress (shows toast)
- [ ] Admin edits persist after logout/login
- [ ] Guest progress isolated from admin
- [ ] Offline mode works (after build)
- [ ] All toasts auto-dismiss
- [ ] No console errors

## 🎉 All Tests Pass?

**Congratulations!** The app is working correctly. You can now:

1. Build for production: `npm run build`
2. Test PWA: `npm run preview`
3. Deploy to Vercel/Netlify
4. Share with users!

## 📝 Notes

- Admin credentials: ramanikrish2105@gmail.com / rk777
- Guest mode: No password required
- Progress keys: `{email}_{kanjiChar}`
- Toast duration: 5 seconds (login/logout), 3 seconds (guest warning)
- IndexedDB: jsCardsDB v3
- localStorage: js-cards-app-storage
