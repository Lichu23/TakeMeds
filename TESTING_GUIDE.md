# PillTime - Complete Testing Guide

## Prerequisites

**Start Both Servers:**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Should show:
```
📅 Initializing scheduler...
✓ Created X logs for 2026-01-13
✓ Created X logs for 2026-01-14
✅ Scheduler initialized
🚀 PillTime Server running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Should show:
```
Local: http://localhost:5173/
```

---

## Phase 1: Basic Setup ✅

### 1.1 Backend API Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected:** `{"success":true,"message":"PillTime API is running",...}`

### 1.2 Frontend Loads
- Navigate to: http://localhost:5173
- **Expected:** App loads with navigation bar showing "PillTime"
- **Expected:** See Dashboard, Medications, History, Settings links

---

## Phase 2: Medication Management 🏥

### 2.1 View Medications Page
1. Click **"Medications"** in navigation
2. **Expected:** "My Medications" heading
3. **Expected:** "No medications" empty state (if first time)

### 2.2 Add a Medication

**Test Case 1: Single Daily Medication**
1. Click **"+ Add Medication"** button
2. Fill in the form:
   - Name: `Vitamin D`
   - Dosage: `1000 IU`
   - Frequency: `Daily`
   - Reminder Time: `09:00`
   - Start Date: Today's date
   - Notes: `Take with breakfast`
3. Click **"Add Medication"**
4. **Expected:** Form closes
5. **Expected:** Medication card appears in "Active Medications" section
6. **Expected:** Shows name, dosage, time, and all details

**Test Case 2: Multiple Times Per Day**
1. Click **"+ Add Medication"**
2. Fill in:
   - Name: `Blood Pressure Pill`
   - Dosage: `10mg`
   - Frequency: `Twice Daily`
   - Reminder Time 1: `08:00`
3. Click **"+ Add Another Time"**
4. Add Reminder Time 2: `20:00`
5. Start Date: Today
6. Click **"Add Medication"**
7. **Expected:** Card shows both times (8:00 AM and 8:00 PM)

**Test Case 3: Medication with End Date**
1. Add new medication
2. Set End Date: 7 days from now
3. **Expected:** Card shows both start and end dates

### 2.3 Edit a Medication
1. Click **"Edit"** on any medication card
2. Change dosage (e.g., `1000 IU` → `2000 IU`)
3. Click **"Update Medication"**
4. **Expected:** Card updates with new dosage

### 2.4 Deactivate/Activate Medication
1. Click **"Deactivate"** on an active medication
2. **Expected:** Card moves to "Inactive Medications" section
3. **Expected:** Card has gray/faded appearance
4. Click **"Activate"**
5. **Expected:** Card moves back to "Active Medications"

### 2.5 Delete a Medication
1. Click **"Delete"** on any medication
2. **Expected:** Confirmation dialog appears
3. Click **"OK"** to confirm
4. **Expected:** Medication disappears from list

### 2.6 Form Validation
1. Click **"+ Add Medication"**
2. Leave Name empty
3. Click **"Add Medication"**
4. **Expected:** Error message "Medication name is required"
5. Enter name but remove all times
6. **Expected:** Error about times required
7. Set End Date before Start Date
8. **Expected:** Error "End date must be after start date"

---

## Phase 3: Daily Tracking 📊

### 3.1 View Dashboard
1. Click **"Dashboard"** in navigation
2. **Expected:** "Today's Medications" heading with today's date
3. **Expected:** 4 statistics cards:
   - Total (number of scheduled meds today)
   - Taken (count of taken meds)
   - Pending (count of pending meds)
   - Missed (count of missed meds)

### 3.2 Auto-Generated Logs
**Verify logs were created automatically:**
1. Look at dashboard
2. **Expected:** See all your active medications listed
3. **Expected:** Each medication shows:
   - Medication name and dosage
   - Scheduled time (e.g., "9:00 AM")
   - Yellow "Pending" badge
   - Clock icon
   - "Mark as Taken" button
   - "Skip" button

### 3.3 Mark Medication as Taken
1. Find a pending medication
2. Click **"Mark as Taken"** button
3. **Expected:** Card turns green background
4. **Expected:** Badge changes to green "Taken"
5. **Expected:** Shows checkmark icon
6. **Expected:** Shows "Taken at X:XX AM/PM"
7. **Expected:** "Mark as Taken" button disappears
8. **Expected:** Statistics cards update:
   - Taken count +1
   - Pending count -1
9. **Expected:** Progress bar increases

### 3.4 Skip a Medication
1. Find a pending medication
2. Click **"Skip"** button
3. **Expected:** Badge changes to gray "Skipped"
4. **Expected:** Buttons disappear
5. **Expected:** Statistics update

### 3.5 Progress Tracking
1. Mark several medications as taken
2. **Expected:** Progress bar at bottom shows percentage
3. **Expected:** Text shows "X / Y" (taken / total)
4. **Expected:** Percentage calculation is correct

### 3.6 History Page - View Past Logs

**Basic History:**
1. Click **"History"** in navigation
2. **Expected:** "Medication History" heading
3. **Expected:** Statistics cards:
   - Compliance Rate (percentage)
   - Current Streak (consecutive perfect days)
   - Total Taken
   - Days Tracked
4. **Expected:** Logs grouped by date (newest first)
5. **Expected:** Each log shows status badge

**Time Period Filters:**
1. Click **"Last 7 Days"** button
2. **Expected:** Shows only last 7 days of logs
3. Click **"Last 30 Days"**
4. **Expected:** Shows last 30 days
5. Click **"Last 90 Days"**
6. **Expected:** Shows last 90 days
7. **Expected:** Active button highlighted in blue

**Compliance Rate:**
1. Check compliance rate percentage
2. **Expected:** Calculates: (taken / total) × 100
3. **Expected:** Progress bar matches percentage
4. **Expected:** Green color if high compliance

**Streak Counter:**
1. Check streak count
2. **Expected:** Shows consecutive days where ALL medications were taken
3. **Expected:** Resets to 0 if any day has missed/pending meds

### 3.7 Empty States
**No Medications:**
1. Delete all medications
2. Go to Dashboard
3. **Expected:** "No medications for today" message with icon

**No History:**
1. Fresh database with no logs
2. Go to History
3. **Expected:** "No history yet" message

---

## Phase 4: PWA Features 📱

### 4.1 Manifest Check
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Manifest**
4. **Expected:** See "PillTime - Medication Reminder"
5. **Expected:** See theme color #0284c7
6. **Expected:** See icon paths listed
7. **Expected:** No errors

### 4.2 Install Prompt
**On Desktop (Chrome/Edge):**
1. Visit the app
2. **Expected:** Install prompt appears at bottom right after a few seconds
3. **Expected:** Shows PillTime icon, title, and description
4. **Expected:** "Install App" and "Not Now" buttons
5. Click **"Not Now"**
6. **Expected:** Prompt dismisses
7. Refresh page
8. **Expected:** Prompt doesn't appear again (7-day cooldown)

**Manual Clear:**
1. Open DevTools → Application → Storage
2. Click "Clear site data"
3. Refresh page
4. **Expected:** Prompt appears again

### 4.3 Service Worker
1. Open DevTools → Application → Service Workers
2. **Expected:** Status "activated and running"
3. **Expected:** Source shows `/sw.js`
4. **Expected:** Update on reload checked (dev mode)

### 4.4 App Installation (After Icons Generated)
**Desktop:**
1. Build: `npm run build && npm run preview`
2. Visit `http://localhost:4173`
3. Click install icon in address bar OR install prompt
4. **Expected:** App installs
5. **Expected:** Opens in new window without browser UI
6. **Expected:** Shows in Start Menu/Applications

**Mobile (needs HTTPS):**
1. Deploy to Vercel/Netlify or use ngrok
2. Visit on phone
3. Use install prompt or browser menu
4. **Expected:** App on home screen
5. **Expected:** Opens fullscreen

---

## Phase 5: Push Notifications 🔔

### 5.1 Initial Notification Prompt

**Auto-prompt on first visit:**
1. Visit the app for the first time (clear localStorage if needed)
2. Wait 3 seconds after page load
3. **Expected:** Notification prompt appears at bottom right
4. **Expected:** Shows PillTime bell icon in blue circle
5. **Expected:** Title: "Enable Notifications"
6. **Expected:** Description about medication reminders
7. **Expected:** Two buttons: "Enable Notifications" and "Not Now"
8. **Expected:** X button in top right corner

**Dismiss the prompt:**
1. Click **"Not Now"** or the X button
2. **Expected:** Prompt disappears
3. Refresh page
4. **Expected:** Prompt doesn't appear again (stored in localStorage)

**Clear and test again:**
1. Open DevTools → Application → Local Storage
2. Delete `notificationPromptDismissed` key
3. Refresh page
4. Wait 3 seconds
5. **Expected:** Prompt appears again

### 5.2 Enable Notifications via Prompt

1. Trigger the notification prompt (fresh visit)
2. Click **"Enable Notifications"** button
3. **Expected:** Browser permission dialog appears
4. Click **"Allow"** in browser dialog
5. **Expected:** Button shows "Enabling..." briefly
6. **Expected:** Prompt disappears
7. **Expected:** Console shows success messages:
   ```
   ✅ Subscribed to push notifications
   ✅ Subscription saved to server
   ```

**Verify subscription in backend:**
1. Check backend console
2. **Expected:** See log about new subscription saved

### 5.3 Settings Page - Notification Controls

**Navigate to Settings:**
1. Click **"Settings"** in navigation
2. **Expected:** "Settings" page heading
3. **Expected:** "Manage your app preferences and notifications" subtitle

**Check Permission Status Section:**
1. Look at "Permission Status" badge
2. **Expected states:**
   - 🟢 Green "Granted" - if allowed
   - 🔴 Red "Denied" - if blocked
   - 🟡 Yellow "Not Set" - if default
3. **Expected:** Helpful message below badge explaining current state

**Check Subscription Status:**
1. Look at "Subscription Status" badge
2. **Expected:** Shows "Subscribed" or "Not Subscribed"
3. **Expected:** Green badge if subscribed, gray if not

### 5.4 Enable Notifications via Settings

**If not yet enabled:**
1. Go to Settings page
2. **Expected:** See blue "🔔 Enable Notifications" button
3. Click **"Enable Notifications"**
4. **Expected:** Browser permission dialog appears
5. Allow permissions
6. **Expected:** Success alert: "✅ Notifications enabled successfully!"
7. **Expected:** Button disappears
8. **Expected:** Two new buttons appear:
   - "📨 Send Test Notification"
   - "🔕 Disable Notifications"

### 5.5 Test Notification

**Send test notification:**
1. In Settings, click **"📨 Send Test Notification"**
2. **Expected:** Button shows "Sending..." briefly
3. **Expected:** Alert appears: "✅ Test notification sent! Check your notifications."
4. **Expected:** Browser notification appears with:
   - Title: "Test Notification"
   - Body: "This is a test notification from PillTime!"
   - PillTime icon (if icons generated)

**Verify notification works:**
1. Check system notification area
2. **Expected:** Notification visible
3. Click notification
4. **Expected:** Opens/focuses the app

### 5.6 Scheduled Medication Reminders

**Create medication with upcoming time:**
1. Go to Medications page
2. Add new medication
3. Set reminder time to 2-3 minutes from now
4. Example: If it's 10:30 AM, set time to 10:32 AM
5. Save medication

**Wait for notification:**
1. Wait until the scheduled time
2. **Expected:** At the exact minute, backend checks for due medications
3. **Expected:** Backend sends push notification
4. **Expected:** Browser notification appears with:
   - Title: "💊 Medication Reminder"
   - Body: "[Medication Name] - [Dosage]"
   - Body: "Time to take your medication!"
   - Icon: PillTime icon

**Check backend console:**
1. Watch backend console at scheduled time
2. **Expected:** Log message like:
   ```
   🔔 Checking for due medications... (HH:MM)
   📤 Sending notification for: [Med Name] at HH:MM
   ✅ Notification sent to X device(s)
   ```

**Notification actions (if supported by browser):**
1. Some browsers show action buttons on notifications
2. **Expected actions:**
   - "Mark as Taken" button
   - "Snooze" button
3. Click "Mark as Taken"
4. **Expected:** Medication marked as taken in database
5. **Expected:** Dashboard updates when you open app

### 5.7 Disable Notifications

1. Go to Settings page
2. Click **"🔕 Disable Notifications"** button
3. **Expected:** Confirmation dialog: "Are you sure you want to disable notifications?"
4. Click **"OK"**
5. **Expected:** Alert: "✅ Notifications disabled"
6. **Expected:** Subscription Status changes to "Not Subscribed"
7. **Expected:** Enable button appears again
8. **Expected:** Test/Disable buttons disappear

**Verify unsubscription:**
1. Check backend console
2. **Expected:** Log about subscription removed
3. Create medication with upcoming time
4. Wait for scheduled time
5. **Expected:** NO notification received

### 5.8 Blocked Notifications Recovery

**Simulate blocked notifications:**
1. Go to browser settings and block notifications for localhost:5173
2. Refresh the PillTime app
3. Go to Settings page

**Check the warning:**
1. **Expected:** Permission Status shows red "Denied" badge
2. **Expected:** Red warning box appears with instructions
3. **Expected:** Instructions are browser-specific:
   - Chrome/Edge: Click lock icon → Site settings → Notifications → Allow
   - Firefox: Click lock icon → More information → Permissions → Allow
   - Safari: Safari menu → Settings → Websites → Allow

**Follow instructions to unblock:**
1. Follow the browser-specific steps shown
2. Change notification permission to "Allow"
3. Refresh the app
4. Go to Settings
5. **Expected:** Permission Status shows "Granted"
6. **Expected:** Warning box disappears
7. **Expected:** Enable button appears
8. Click enable
9. **Expected:** Subscription works again

### 5.9 Multiple Notifications

**Test multiple medications at same time:**
1. Create 3 medications all scheduled for same time (e.g., 2 minutes from now)
2. Wait for scheduled time
3. **Expected:** Receive 3 separate notifications
4. **Expected:** Each shows correct medication name and dosage
5. **Expected:** Backend console shows 3 notifications sent

**Test medications at different times:**
1. Create medications scheduled for different times
2. Example: 10:00, 10:05, 10:10
3. Wait and observe
4. **Expected:** Notifications arrive at their respective times
5. **Expected:** Each notification is independent

### 5.10 Service Worker Push Events

**Verify Service Worker handles push:**
1. Open DevTools → Application → Service Workers
2. Trigger a notification (test or scheduled)
3. **Expected:** Service Worker shows as "activated and running"
4. Look at Console
5. **Expected:** May see logs from Service Worker push handler

**Check notification click handling:**
1. Receive a notification
2. Click on it (not action buttons, the notification itself)
3. **Expected:** App window opens or focuses
4. **Expected:** May navigate to Dashboard

### 5.11 How Notifications Work Section

**Verify informational content:**
1. Scroll down on Settings page
2. **Expected:** See "How Notifications Work" section
3. **Expected:** Three features explained with emojis:
   - ⏰ Scheduled Reminders
   - ✓ Quick Actions
   - 🔒 Privacy
4. **Expected:** Clear descriptions for each

### 5.12 App Information Section

**Check app details:**
1. Scroll to bottom of Settings
2. **Expected:** "About PillTime" section
3. **Expected:** Version: 1.0.0
4. **Expected:** Status: Progressive Web App
5. **Expected:** Features list includes "Push notifications"

---

## Backend Scheduler Tests 🕐

### 5.1 Verify Log Generation
**Check logs were created:**
1. Look at backend console
2. **Expected:** See messages like:
   ```
   Generating logs for 2026-01-13...
   ✓ Created X logs for 2026-01-13
   ```

**Test for tomorrow:**
1. Backend should create tomorrow's logs at startup
2. Check backend console
3. **Expected:** See logs created for tomorrow's date

### 5.2 Test Midnight Cron Job
**Manual test (don't wait for midnight!):**
1. Check backend code in `server/src/services/schedulerService.js`
2. See cron schedule: `'0 0 * * *'` (midnight)
3. **Note:** This will auto-generate tomorrow's logs at midnight

**Verify it works:**
1. Check database directly or wait until tomorrow
2. **Expected:** New logs appear automatically

### 5.3 Missed Medications
**Auto-mark as missed:**
1. Create a medication with a time in the past (e.g., 1 hour ago)
2. Wait for hourly cron job OR restart server
3. **Expected:** Status changes from "pending" to "missed"
4. **Expected:** Dashboard shows in Missed count

---

## API Endpoint Tests 🔌

### Direct API Testing

**Get All Medications:**
```bash
curl http://localhost:3000/api/medications
```
**Expected:** JSON with medications array

**Create Medication:**
```bash
curl -X POST http://localhost:3000/api/medications \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Med",
    "dosage": "100mg",
    "frequency": "daily",
    "times": ["09:00"],
    "start_date": "2026-01-13"
  }'
```
**Expected:** Success response with created medication

**Get Today's Logs:**
```bash
curl http://localhost:3000/api/logs/today
```
**Expected:** Logs array and stats object

**Get History:**
```bash
curl http://localhost:3000/api/logs/history?days=30
```
**Expected:** Logs and statistics for last 30 days

---

## Cross-Browser Testing 🌐

### Test in Multiple Browsers
1. Chrome/Edge ✅
2. Firefox ✅
3. Safari (if available) ✅

**For each browser, test:**
- [ ] Medications page loads
- [ ] Can add/edit/delete medications
- [ ] Dashboard shows correctly
- [ ] History page works
- [ ] Styles look correct

---

## Responsive Design Testing 📱

### Desktop (1920x1080)
1. Resize browser to full screen
2. **Expected:** 3-column grid for medication cards
3. **Expected:** All components readable

### Tablet (768x1024)
1. Resize browser to ~768px width
2. **Expected:** 2-column grid for medications
3. **Expected:** Stats cards still visible

### Mobile (375x667)
1. Resize to phone size
2. **Expected:** 1-column layout
3. **Expected:** Navigation readable
4. **Expected:** Cards stack vertically
5. **Expected:** Install prompt fits screen

---

## Data Persistence Tests 💾

### 1. Refresh Tests
1. Add medications
2. Refresh page (F5)
3. **Expected:** All medications still there
4. Mark some as taken
5. Refresh
6. **Expected:** Status persists

### 2. Multiple Tabs
1. Open app in two tabs
2. Add medication in Tab 1
3. Refresh Tab 2
4. **Expected:** New medication appears
5. Mark as taken in Tab 2
6. Refresh Tab 1
7. **Expected:** Status updated

---

## Error Handling Tests ⚠️

### 1. Backend Offline
1. Stop backend server (Ctrl+C)
2. Try to add medication
3. **Expected:** Error message appears
4. Restart server
5. Retry
6. **Expected:** Works again

### 2. Invalid Data
1. Try to create medication with empty name
2. **Expected:** Validation error
3. Try end date before start date
4. **Expected:** Validation error

---

## Performance Tests ⚡

### 1. Many Medications
1. Add 20+ medications
2. **Expected:** Page still responsive
3. **Expected:** Grid layout handles overflow
4. **Expected:** Scroll works smoothly

### 2. Many Logs
1. Use app for several days
2. View history with many logs
3. **Expected:** Loads within 2 seconds
4. **Expected:** Grouped by date correctly

---

## Complete Testing Checklist

Copy this checklist and check off as you test:

### Phase 2: Medications
- [ ] View medications page
- [ ] Add single medication
- [ ] Add medication with multiple times
- [ ] Add medication with end date
- [ ] Edit medication
- [ ] Deactivate medication
- [ ] Activate medication
- [ ] Delete medication
- [ ] Form validation works

### Phase 3: Tracking
- [ ] Dashboard shows today's meds
- [ ] Stats cards show correct counts
- [ ] Auto-generated logs appear
- [ ] Mark as taken works
- [ ] Skip medication works
- [ ] Progress bar updates
- [ ] History page shows logs
- [ ] Time period filters work
- [ ] Compliance rate calculates correctly
- [ ] Streak counter works
- [ ] Empty states display

### Phase 4: PWA
- [ ] Manifest loads without errors
- [ ] Service worker registers
- [ ] Install prompt appears
- [ ] Can dismiss install prompt
- [ ] Theme color applies
- [ ] App title correct

### Phase 5: Push Notifications
- [ ] Notification prompt appears after 3 seconds
- [ ] Can dismiss prompt (stores in localStorage)
- [ ] Enable notifications via prompt works
- [ ] Browser permission dialog appears
- [ ] Settings page shows permission status
- [ ] Settings page shows subscription status
- [ ] Enable notifications via Settings works
- [ ] Test notification button works
- [ ] Test notification appears in system
- [ ] Scheduled medication notifications arrive on time
- [ ] Backend logs show notification sent
- [ ] Multiple notifications work correctly
- [ ] Disable notifications works
- [ ] Unsubscribe confirmed in backend
- [ ] Blocked notifications show warning with instructions
- [ ] Service Worker handles push events
- [ ] Notification click opens/focuses app

### Backend
- [ ] Scheduler creates today's logs
- [ ] Scheduler creates tomorrow's logs
- [ ] Hourly missed check works
- [ ] API endpoints respond

### General
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Responsive on mobile size
- [ ] Data persists after refresh
- [ ] Error messages show correctly

---

## Quick Smoke Test (7 minutes)

**Minimal test to verify everything works:**

1. ✅ Backend starts with scheduler messages
2. ✅ Frontend loads at localhost:5173
3. ✅ Add one medication
4. ✅ Go to Dashboard - see it listed
5. ✅ Mark as taken - status updates
6. ✅ Go to History - see the log
7. ✅ Refresh page - data persists
8. ✅ Go to Settings - enable notifications
9. ✅ Send test notification - appears in system

**If all 9 pass → Everything is working!**

---

## Troubleshooting

**Problem:** No medications on dashboard
- **Solution:** Check if you have active medications with today's date in range

**Problem:** Install prompt doesn't appear
- **Solution:** Clear site data in DevTools, refresh

**Problem:** Scheduler didn't create logs
- **Solution:** Check medications are active and start_date is today or earlier

**Problem:** API errors
- **Solution:** Verify backend server is running on port 3000

**Problem:** Notifications not appearing
- **Solution:** Check notification permission is "Granted" in Settings
- **Solution:** Verify subscription status shows "Subscribed"
- **Solution:** Check browser notification settings aren't blocking the site
- **Solution:** Test with test notification button first
- **Solution:** Check backend console for notification errors

**Problem:** Notification prompt doesn't appear
- **Solution:** Clear localStorage key `notificationPromptDismissed`
- **Solution:** Wait 3 seconds after page load
- **Solution:** Check that permission isn't already granted or denied

**Problem:** Scheduled notifications not arriving
- **Solution:** Verify medication time matches current time (check server time)
- **Solution:** Ensure backend scheduler is running (check console for cron messages)
- **Solution:** Verify medication is active and within date range
- **Solution:** Check backend logs for notification sending attempts

**Problem:** Browser shows "Denied" permission
- **Solution:** Follow browser-specific instructions in Settings page red warning box
- **Solution:** Clear site data and try again (may need to reset browser permissions)

---

**Last Updated:** 2026-01-13
**Covers:** Phases 1-5 (Complete)
**Total Tests:** ~70+ scenarios
